import React, { useState, useEffect, useRef, useCallback } from 'react';
import './BlinkDetectionModal.css';
import { FaceMesh } from '@mediapipe/face_mesh';
// Camera utility is no longer needed as we're managing the stream directly

const MAX_POINTS = 60; // Retained for consistency, though charts are removed

const BlinkDetectionModal = ({ isOpen, onClose, patientName, familyNumbers = [], panicThreshold = 2.5, onEmergencyTrigger }) => {
  const [isDetecting, setIsDetecting] = useState(false);
  const [blinkCount, setBlinkCount] = useState(0);
  const [currentEAR, setCurrentEAR] = useState(0);
  const [faceDetected, setFaceDetected] = useState(false);
  const [error, setError] = useState('');
  const [processingTime, setProcessingTime] = useState(0);
  const [debugInfo, setDebugInfo] = useState('');
  const [consecutiveBlinks, setConsecutiveBlinks] = useState(0);
  const [emergencyTriggered, setEmergencyTriggered] = useState(false);
  const [showBoundingBoxes, setShowBoundingBoxes] = useState(true); // Toggle for landmark visualization
  const [pendingBlink, setPendingBlink] = useState(false); // Visual feedback for pending blink

  const videoRef = useRef(null); // This will now hold a programmatic video element, never appended to DOM
  const canvasRef = useRef(null);
  const hiddenCanvasRef = useRef(null); // New ref for the offscreen canvas
  const streamRef = useRef(null);
  const animationFrameRef = useRef(null);
  const faceMeshRef = useRef(null);

  // GestureDetector equivalent state from divyatest.py
  const blinkThreshold = useRef(0.22);
  const consecutiveEmergencyBlinksRef = useRef(5);
  const blinkTimeoutRef = useRef(3000);
  const lastBlinkTimeRef = useRef(0);
  const cooldown = useRef(150);
  const isCurrentlyClosedRef = useRef(false);
  const blinkStartTimeRef = useRef(0);
  const minBlinkDuration = useRef(50);
  const maxBlinkDuration = useRef(500);
  const pendingBlinkRef = useRef(false); // New: track if we have a pending blink to validate

  const prevLandmarksRef = useRef(null);
  const blinkTimesRef = useRef([]); // Track timestamps of recent blinks
  const faceDetectionTimeoutRef = useRef(null); // Track face detection timeout

  // Create refs for props that might cause re-renders if in useCallback dependencies
  const patientNameRef = useRef(patientName);
  const familyNumbersRef = useRef(familyNumbers);
  const emergencyTriggeredRef = useRef(emergencyTriggered);
  const onEmergencyTriggerRef = useRef(onEmergencyTrigger);

  // Update refs when props/state change that are used inside stable callbacks
  useEffect(() => {
    patientNameRef.current = patientName;
    familyNumbersRef.current = familyNumbers;
    onEmergencyTriggerRef.current = onEmergencyTrigger;
  }, [patientName, familyNumbers, onEmergencyTrigger]);

  useEffect(() => {
    emergencyTriggeredRef.current = emergencyTriggered;
  }, [emergencyTriggered]);

  // Helper for Euclidean distance (from scipy.spatial.distance.euclidean)
  const euclideanDistance = (p1, p2) => {
    return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
  };

  // Calculate Eye Aspect Ratio (EAR) - translated from Python _calculate_ear
  const calculateEAR = useCallback((landmarks, eyeIndices) => {
    if (!landmarks || !eyeIndices || eyeIndices.length < 6) {
      return 0;
    }

    const points = eyeIndices.map(idx => landmarks[idx]);

    // Vertical distances (P2-P6, P3-P5)
    const v1 = euclideanDistance(points[1], points[5]);
    const v2 = euclideanDistance(points[2], points[4]);

    // Horizontal distance (P1-P4)
    const h = euclideanDistance(points[0], points[3]);

    if (h === 0) {
      return 0;
    }

    const ear = (v1 + v2) / (2.0 * h);
    return ear;
  }, []);

  // Define the stable onResults logic
  const onResults = useCallback((results) => {
    console.log('onResults: Callback triggered.');
    const canvas = canvasRef.current;
    const hiddenCanvas = hiddenCanvasRef.current;
    if (!canvas || !hiddenCanvas) {
      console.log('onResults: Canvas or hiddenCanvas not ready, returning.');
      return;
    }

    const context = canvas.getContext('2d');
    if (!context) {
      console.error('onResults: Could not get 2D context for visible canvas.');
      return;
    }
    console.log(`onResults: Visible canvas dimensions - Width: ${canvas.width}, Height: ${canvas.height}`);

    // Clear canvas before drawing new frame to prevent stacking
    context.clearRect(0, 0, canvas.width, canvas.height);

    // Draw the hidden canvas content onto the visible canvas
    context.drawImage(hiddenCanvas, 0, 0, canvas.width, canvas.height);
    console.log('onResults: Drew hidden canvas to visible canvas.');

    const startTime = performance.now();

    if (results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0) {
      setFaceDetected(true);
      const landmarks = results.multiFaceLandmarks[0];
      console.log('onResults: Face detected, processing landmarks.');

      // Convert normalized landmarks to canvas coordinates (relative to visible canvas)
      const scaleX = canvas.width;
      const scaleY = canvas.height;
      const denormalizedLandmarks = landmarks.map(landmark => ({
        x: landmark.x * scaleX,
        y: landmark.y * scaleY,
        z: landmark.z * scaleX, // z is also scaled
      }));

      // Draw landmarks as green dots only if showBoundingBoxes is enabled
      if (showBoundingBoxes) {
        console.log('onResults: Drawing bounding boxes.');
        for (const landmark of denormalizedLandmarks) {
          context.beginPath();
          context.arc(landmark.x, landmark.y, 1, 0, 2 * Math.PI);
          context.fillStyle = '#00ff00';
          context.fill();
        }
      }

      // Eye indices for MediaPipe Face Mesh (from divyatest.py)
      const leftEyeIndices = [362, 385, 387, 263, 373, 380];
      const rightEyeIndices = [33, 160, 158, 133, 153, 144];

      const leftEAR = calculateEAR(denormalizedLandmarks, leftEyeIndices);
      const rightEAR = calculateEAR(denormalizedLandmarks, rightEyeIndices);
      const avgEAR = (leftEAR + rightEAR) / 2;
      setCurrentEAR(avgEAR);
      console.log(`onResults: Calculated EAR: ${avgEAR.toFixed(3)}`);

      const currentTime = Date.now();

      // Blink Detection logic
      if (avgEAR < blinkThreshold.current) {
        // Eye is currently closed
        if (!isCurrentlyClosedRef.current) { // If it was previously open (transition from open to closed)
          isCurrentlyClosedRef.current = true;
          blinkStartTimeRef.current = currentTime; // Record when blink started
          pendingBlinkRef.current = true; // Mark that we have a pending blink to validate
          setPendingBlink(true); // Visual feedback
          console.log('onResults: Eye closed, recording blink start time.');

          // Don't count the blink yet - wait for validation when eye opens
        }
      } else { // Eye is open
        // Only process if we were previously closed (blink end)
        if (isCurrentlyClosedRef.current && pendingBlinkRef.current) {
          const blinkDuration = currentTime - blinkStartTimeRef.current;
          console.log(`onResults: Eye opened, blink duration: ${blinkDuration}ms`);
          
          // Validate blink duration before counting
          if (blinkDuration >= minBlinkDuration.current && blinkDuration <= maxBlinkDuration.current) {
            // Valid blink - check cooldown and count it
            if (currentTime - lastBlinkTimeRef.current > cooldown.current) {
              setBlinkCount(prev => {
                const newCount = prev + 1;
                console.log(`onResults: Valid blink counted! New count: ${newCount}`);
                return newCount;
              });
              lastBlinkTimeRef.current = currentTime;

              // Add current blink time to the array
              blinkTimesRef.current.push(currentTime);

              // Remove blinks older than 3 seconds
              const threeSecondsAgo = currentTime - blinkTimeoutRef.current;
              blinkTimesRef.current = blinkTimesRef.current.filter(time => time > threeSecondsAgo);

              // Check if we have 5 or more blinks within 3 seconds
              if (blinkTimesRef.current.length >= consecutiveEmergencyBlinksRef.current && !emergencyTriggeredRef.current) {
                console.log("EMERGENCY TRIGGERED! 5 blinks detected within 3 seconds. Making emergency call...");
                setEmergencyTriggered(true);
                onEmergencyTriggerRef.current('Excessive Blinking (5+ blinks in 3 seconds)');
              }

              // Update consecutive blinks count for display
              setConsecutiveBlinks(blinkTimesRef.current.length);
            } else {
              console.log(`onResults: Blink ignored due to cooldown (${currentTime - lastBlinkTimeRef.current}ms < ${cooldown.current}ms)`);
            }
          } else {
            // Invalid blink duration - just log it, don't count or decrease
            if (blinkDuration < minBlinkDuration.current) {
              console.log(`onResults: Blink too short (${blinkDuration}ms), ignored.`);
            } else {
              console.log(`onResults: Blink too long (${blinkDuration}ms), ignored.`);
            }
          }
          
          // Reset pending blink state
          pendingBlinkRef.current = false;
          setPendingBlink(false); // Clear visual feedback
        }
        
        isCurrentlyClosedRef.current = false; // Reset to open
        console.log('onResults: Eye is open.');

        // Clean up old blinks (older than 3 seconds) even when eyes are open
        const threeSecondsAgo = currentTime - blinkTimeoutRef.current;
        blinkTimesRef.current = blinkTimesRef.current.filter(time => time > threeSecondsAgo);
        setConsecutiveBlinks(blinkTimesRef.current.length);

        // Reset emergency if no blinks in the last 3 seconds
        if (blinkTimesRef.current.length === 0) {
          setEmergencyTriggered(false);
        }
      }

      prevLandmarksRef.current = denormalizedLandmarks; // Store for future twitch detection if needed

    } else {
      setFaceDetected(false);
      console.log('onResults: No face detected.');
      
      // Only reset if face has been missing for more than 2 seconds to avoid flickering
      if (!faceDetectionTimeoutRef.current) {
        faceDetectionTimeoutRef.current = setTimeout(() => {
          console.log('onResults: Face missing for 2+ seconds, resetting counters.');
          setBlinkCount(0);
          setConsecutiveBlinks(0);
          setEmergencyTriggered(false);
          setPendingBlink(false);
          lastBlinkTimeRef.current = 0;
          isCurrentlyClosedRef.current = false;
          pendingBlinkRef.current = false;
          prevLandmarksRef.current = null;
          blinkTimesRef.current = [];
          faceDetectionTimeoutRef.current = null;
        }, 2000);
      }
      return;
    }
    setProcessingTime(performance.now() - startTime);
  }, [calculateEAR, showBoundingBoxes]);

  // Combined effect for initializing FaceMesh and camera setup/cleanup
  useEffect(() => {
    console.log('BlinkDetectionModal useEffect: isOpen changed to', isOpen);
    if (!isOpen) { // Cleanup when modal closes
      console.log('BlinkDetectionModal: Cleaning up resources.');
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
        console.log('BlinkDetectionModal: Camera stream stopped.');
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
        console.log('BlinkDetectionModal: Animation frame canceled.');
      }
      if (faceMeshRef.current) {
        faceMeshRef.current.close();
        faceMeshRef.current = null;
        console.log('BlinkDetectionModal: FaceMesh closed.');
      }
      // Ensure programmatic video element is stopped and cleared
      if (videoRef.current) {
        if (videoRef.current.srcObject) {
          videoRef.current.srcObject.getTracks().forEach(track => track.stop());
          videoRef.current.srcObject = null;
        }
        videoRef.current = null;
        console.log('BlinkDetectionModal: Programmatic video element cleared.');
      }
      // Clean up hidden canvas context
      if (hiddenCanvasRef.current) {
        const context = hiddenCanvasRef.current.getContext('2d');
        context.clearRect(0, 0, hiddenCanvasRef.current.width, hiddenCanvasRef.current.height);
        hiddenCanvasRef.current = null;
        console.log('BlinkDetectionModal: Hidden canvas cleared.');
      }

      setIsDetecting(false);
      setBlinkCount(0);
      setConsecutiveBlinks(0);
      setEmergencyTriggered(false);
      setPendingBlink(false);
      lastBlinkTimeRef.current = 0;
      isCurrentlyClosedRef.current = false;
      pendingBlinkRef.current = false;
      prevLandmarksRef.current = null;
      blinkTimesRef.current = []; // Reset blink times array
      if (faceDetectionTimeoutRef.current) {
        clearTimeout(faceDetectionTimeoutRef.current);
        faceDetectionTimeoutRef.current = null;
      }
      setError(''); // Clear any previous errors
      setDebugInfo(''); // Clear debug info
      console.log('BlinkDetectionModal: State reset.');
      return;
    }

    // Setup when modal opens
    const setupDetection = async () => {
      console.log('setupDetection: Starting FaceMesh and camera setup.');
      if (!faceMeshRef.current) {
        try {
          setDebugInfo('Loading MediaPipe FaceMesh models...');
          console.log('setupDetection: Initializing FaceMesh...');
          faceMeshRef.current = new FaceMesh({
            locateFile: (file) => {
              return `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`;
            },
          });
          faceMeshRef.current.setOptions({
            maxNumFaces: 1,
            refineLandmarks: true,
            minDetectionConfidence: 0.5,
            minTrackingConfidence: 0.5,
          });
          faceMeshRef.current.onResults(onResults); // Ensure it's registered with initialized FaceMesh
          setDebugInfo('MediaPipe FaceMesh models loaded successfully.');
          console.log('setupDetection: FaceMesh initialized.');
        } catch (error) {
          console.error('Detector initialization error:', error);
          setError('Failed to load FaceMesh models: ' + error.message);
          setDebugInfo('Model initialization failed: ' + error.message);
          setIsDetecting(false);
          return; 
        }
      }

      if (!canvasRef.current || !faceMeshRef.current) {
        const msg = 'Canvas element not ready, or FaceMesh not initialized.';
        setError(msg);
        console.error('setupDetection Error:', msg);
        setIsDetecting(false);
        return;
      }

      if (streamRef.current) { // Prevent re-initializing stream if already exists
        console.log('setupDetection: Stream already exists, skipping re-initialization.');
        return; 
      }

      try {
        console.log('setupDetection: Requesting camera access...');
        // Create a hidden video element (not added to DOM) to get the stream
        const tempVideo = document.createElement('video');
        tempVideo.autoplay = true;
        tempVideo.playsInline = true;
        tempVideo.muted = true;
        videoRef.current = tempVideo; // Assign to ref

        // Create a hidden canvas for internal processing
        const tempHiddenCanvas = document.createElement('canvas');
        tempHiddenCanvas.style.display = 'none'; // Ensure it's hidden
        tempHiddenCanvas.style.position = 'fixed'; // Position off-screen
        tempHiddenCanvas.style.top = '-9999px';
        tempHiddenCanvas.style.left = '-9999px';
        hiddenCanvasRef.current = tempHiddenCanvas; // Assign to ref
        const hiddenContext = hiddenCanvasRef.current.getContext('2d');

        const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480 } });
        streamRef.current = stream;
        videoRef.current.srcObject = stream;
        console.log('setupDetection: Camera stream obtained.');

        videoRef.current.onloadedmetadata = () => {
          console.log('videoRef.current.onloadedmetadata: Video metadata loaded.');
          videoRef.current.play();

          // Set dimensions of both visible and hidden canvases
          if (canvasRef.current && videoRef.current && hiddenCanvasRef.current) {
            canvasRef.current.width = videoRef.current.videoWidth;
            canvasRef.current.height = videoRef.current.videoHeight;
            hiddenCanvasRef.current.width = videoRef.current.videoWidth;
            hiddenCanvasRef.current.height = videoRef.current.videoHeight;
            console.log(`Canvas dimensions set: Visible ${canvasRef.current.width}x${canvasRef.current.height}, Hidden ${hiddenCanvasRef.current.width}x${hiddenCanvasRef.current.height}`);
          }

          // Use requestAnimationFrame to draw video to hidden canvas and send to FaceMesh
          const processFrame = async () => {
            if (videoRef.current && !videoRef.current.paused && hiddenCanvasRef.current) {
              // Draw video frame to hidden canvas
              hiddenContext.drawImage(videoRef.current, 0, 0, hiddenCanvasRef.current.width, hiddenCanvasRef.current.height);
              // Send hidden canvas to FaceMesh
              await faceMeshRef.current.send({ image: hiddenCanvasRef.current });
            }
            animationFrameRef.current = requestAnimationFrame(processFrame);
          };
          
          processFrame();
          setIsDetecting(true);
          console.log('setupDetection: Starting video frame processing.');
        };
      } catch (err) {
        console.error("Error accessing camera: ", err);
        setError('Failed to access camera. Please ensure it\'s connected and permissions are granted: ' + err.message);
        setIsDetecting(false);
      }
    };

    if (isOpen) {
      setupDetection();
    }

    // Add onResults to dependency array so setupDetection re-runs when it changes (e.g., showBoundingBoxes toggle)
  }, [isOpen, onResults]);

  if (!isOpen) return null;

  return (
    <div className={`blink-modal-backdrop ${isOpen ? 'show' : ''}`}>
      <div className="blink-modal-content">
        <span className="modal-close-x" onClick={() => { console.log('X button clicked!'); onClose(); }}>&times;</span>
        <h2>Blink Detection for {patientName}</h2>
        <div className="video-container">
          <canvas ref={canvasRef} className="output_canvas"></canvas>
        </div>
        <div className="detection-info">
          {error && <p className="error-message">{error}</p>}
          <p>Face Detected: {faceDetected ? 'Yes' : 'No'}</p>
          <p>Current EAR: {currentEAR.toFixed(3)}</p>
          <p>Blink Count: {blinkCount}</p>
          <p>Blinks in Last 3s: {consecutiveBlinks}/5</p>
          <p>EAR Threshold: {blinkThreshold.current}</p>
          <p>Processing Time: {processingTime.toFixed(1)}ms</p>
          {pendingBlink && <p className="pending-blink">🔄 Validating blink...</p>}
          {emergencyTriggered && <p className="emergency-alert">EMERGENCY ALERT! 5+ blinks in 3 seconds detected!</p>}
        </div>
        <div className="controls">
          <label className="toggle-label">
            <input
              type="checkbox"
              checked={showBoundingBoxes}
              onChange={(e) => setShowBoundingBoxes(e.target.checked)}
            />
            Show Face Landmarks
          </label>
        </div>
      </div>
    </div>
  );
};

export default BlinkDetectionModal; 
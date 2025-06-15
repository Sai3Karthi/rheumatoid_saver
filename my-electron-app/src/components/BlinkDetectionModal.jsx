import React, { useState, useEffect, useRef, useCallback } from 'react';
import './BlinkDetectionModal.css';
import { FaceMesh } from '@mediapipe/face_mesh';
import { Camera } from '@mediapipe/camera_utils';

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

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const animationFrameRef = useRef(null);
  const faceMeshRef = useRef(null);
  const cameraRef = useRef(null);

  // GestureDetector equivalent state from divyatest.py
  const blinkThreshold = useRef(0.25);
  const consecutiveEmergencyBlinksRef = useRef(10);
  const blinkTimeoutRef = useRef(5000);
  const lastBlinkTimeRef = useRef(0);
  const cooldown = useRef(300);
  const isCurrentlyClosedRef = useRef(false);

  const prevLandmarksRef = useRef(null);

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
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!canvas || !video) return;

    const context = canvas.getContext('2d');
    
    // Clear canvas before drawing new frame to prevent stacking
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    const startTime = performance.now();

    if (results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0) {
      setFaceDetected(true);
      const landmarks = results.multiFaceLandmarks[0];

      // Convert normalized landmarks to canvas coordinates
      const scaleX = canvas.width;
      const scaleY = canvas.height;
      const denormalizedLandmarks = landmarks.map(landmark => ({
        x: landmark.x * scaleX,
        y: landmark.y * scaleY,
        z: landmark.z * scaleX, // z is also scaled
      }));

      // Draw landmarks as green dots
      for (const landmark of denormalizedLandmarks) {
        context.beginPath();
        context.arc(landmark.x, landmark.y, 1, 0, 2 * Math.PI);
        context.fillStyle = '#00ff00';
        context.fill();
      }

      // Eye indices for MediaPipe Face Mesh (from divyatest.py)
      const leftEyeIndices = [362, 385, 387, 263, 373, 380];
      const rightEyeIndices = [33, 160, 158, 133, 153, 144];

      const leftEAR = calculateEAR(denormalizedLandmarks, leftEyeIndices);
      const rightEAR = calculateEAR(denormalizedLandmarks, rightEyeIndices);
      const avgEAR = (leftEAR + rightEAR) / 2;
      setCurrentEAR(avgEAR);

      const currentTime = Date.now();

      // Blink Detection logic
      if (avgEAR < blinkThreshold.current) {
        // Eye is currently closed
        if (!isCurrentlyClosedRef.current) { // If it was previously open (transition from open to closed)
          isCurrentlyClosedRef.current = true;

          if (currentTime - lastBlinkTimeRef.current > cooldown.current) {
            // Valid blink detected and not in cooldown
            setBlinkCount(prev => {
              const newCount = prev + 1;
              return newCount;
            });
            lastBlinkTimeRef.current = currentTime;

            // Check for consecutive blinks for emergency
            if (currentTime - lastBlinkTimeRef.current < blinkTimeoutRef.current) {
              setConsecutiveBlinks(prev => {
                const newConsecutive = prev + 1;
                if (newConsecutive >= consecutiveEmergencyBlinksRef.current && !emergencyTriggeredRef.current) {
                  console.log("EMERGENCY TRIGGERED! Making emergency call...");
                  setEmergencyTriggered(true);
                  onEmergencyTriggerRef.current('Excessive Blinking');
                }
                return newConsecutive;
              });
            } else {
              // Reset consecutive blinks if too much time passed between blinks
              setConsecutiveBlinks(1);
            }
          }
        }
      } else { // Eye is open
        isCurrentlyClosedRef.current = false; // Reset to open

        if (currentTime - lastBlinkTimeRef.current > blinkTimeoutRef.current) {
          // Reset consecutive blinks if a long time has passed since the last blink
          setConsecutiveBlinks(0);
          setEmergencyTriggered(false);
        }
      }

      prevLandmarksRef.current = denormalizedLandmarks; // Store for future twitch detection if needed

    } else {
      setFaceDetected(false);
      // Reset blink count if face not detected for a while
      setBlinkCount(0);
      setConsecutiveBlinks(0);
      setEmergencyTriggered(false);
      lastBlinkTimeRef.current = 0;
      isCurrentlyClosedRef.current = false; // Also reset this on cleanup
      prevLandmarksRef.current = null;
      return;
    }
    setProcessingTime(performance.now() - startTime);
  }, [calculateEAR]);

  // Combined effect for initializing FaceMesh and camera setup/cleanup
  useEffect(() => {
    if (!isOpen) { // Cleanup when modal closes
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
      if (cameraRef.current) {
        cameraRef.current.stop();
        cameraRef.current = null;
      }
      if (faceMeshRef.current) {
        faceMeshRef.current.close();
        faceMeshRef.current = null;
      }
      setIsDetecting(false);
      setBlinkCount(0);
      setConsecutiveBlinks(0);
      setEmergencyTriggered(false);
      lastBlinkTimeRef.current = 0;
      isCurrentlyClosedRef.current = false;
      prevLandmarksRef.current = null;
      return;
    }

    // Setup when modal opens
    const setupDetection = async () => {
      if (!faceMeshRef.current) {
        try {
          setDebugInfo('Loading MediaPipe FaceMesh models...');
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
          faceMeshRef.current.onResults(onResults); 
          setDebugInfo('MediaPipe FaceMesh models loaded successfully.');
        } catch (error) {
          console.error('Detector initialization error:', error);
          setError('Failed to load FaceMesh models: ' + error.message);
          setDebugInfo('Model initialization failed: ' + error.message);
          return; 
        }
      }

      if (!videoRef.current || !canvasRef.current || !faceMeshRef.current) {
        setError('Video or canvas element not ready, or FaceMesh not initialized.');
        return;
      }

      if (streamRef.current) { // Prevent re-initializing stream if already exists
        return; 
      }

      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480 } });
        streamRef.current = stream;
        videoRef.current.srcObject = stream;

        videoRef.current.onloadedmetadata = () => {
          videoRef.current.play();
          if (canvasRef.current && videoRef.current) {
            canvasRef.current.width = videoRef.current.videoWidth;
            canvasRef.current.height = videoRef.current.videoHeight;
          }

          if (!cameraRef.current) {
            cameraRef.current = new Camera(videoRef.current, {
              onFrame: async () => {
                if (faceMeshRef.current) {
                  await faceMeshRef.current.send({ image: videoRef.current });
                }
              },
              width: 640, 
              height: 480, 
            });
            cameraRef.current.start();
            setIsDetecting(true);
          }
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

    // No explicit cleanup here, as consolidated at the top of the effect when !isOpen
  }, [isOpen, onResults]);

  if (!isOpen) return null;

  return (
    <div className={`blink-modal-backdrop ${isOpen ? 'show' : ''}`}>
      <div className="blink-modal-content">
        <h2>Blink Detection for {patientName}</h2>
        <div className="video-container">
          <video ref={videoRef} className="input_video" autoPlay playsInline muted></video>
          <canvas ref={canvasRef} className="output_canvas"></canvas>
        </div>
        <div className="detection-info">
          {error && <p className="error-message">{error}</p>}
          <p>Face Detected: {faceDetected ? 'Yes' : 'No'}</p>
          <p>Current EAR: {currentEAR.toFixed(3)}</p>
          <p>Blink Count: {blinkCount}</p>
          <p>Consecutive Blinks: {consecutiveBlinks}</p>
          {emergencyTriggered && <p className="emergency-alert">EMERGENCY ALERT! Call Initiated!</p>}
        </div>
        <button onClick={onClose} className="close-button">Close</button>
      </div>
    </div>
  );
};

export default BlinkDetectionModal; 
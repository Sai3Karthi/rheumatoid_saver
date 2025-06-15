import React, { useState, useEffect, useRef, useCallback } from 'react';
import './BlinkDetectionModal.css';
<<<<<<< HEAD
import { FaceMesh } from '@mediapipe/face_mesh';
import { Camera } from '@mediapipe/camera_utils';

const MAX_POINTS = 60; // Retained for consistency, though charts are removed

const BlinkDetectionModal = ({ isOpen, onClose, patientName, familyNumbers = [], panicThreshold = 2.5, onEmergencyTrigger }) => {
=======
import * as faceapi from '@vladmandic/face-api';
import Chart from 'chart.js/auto';

const MAX_POINTS = 60;

const DETECTION_INTERVAL = 80; // ms, ~12 FPS

const BlinkDetectionModal = ({ isOpen, onClose, patientName, familyNumbers = [], panicThreshold = 2.5 }) => {
>>>>>>> 30239a6 (first)
  const [isDetecting, setIsDetecting] = useState(false);
  const [blinkCount, setBlinkCount] = useState(0);
  const [currentEAR, setCurrentEAR] = useState(0);
  const [faceDetected, setFaceDetected] = useState(false);
  const [error, setError] = useState('');
  const [processingTime, setProcessingTime] = useState(0);
  const [debugInfo, setDebugInfo] = useState('');
<<<<<<< HEAD
  const [consecutiveBlinks, setConsecutiveBlinks] = useState(0);
  const [emergencyTriggered, setEmergencyTriggered] = useState(false);

=======
  const [isInitialized, setIsInitialized] = useState(false);
  const [blinksPerSecond, setBlinksPerSecond] = useState(0);
  const [lastBlinkTime, setLastBlinkTime] = useState(0);
  const [sessionStartTime, setSessionStartTime] = useState(0);
  const [earThreshold, setEarThreshold] = useState(0.29); // Default threshold, now adjustable
  const [isCalibrating, setIsCalibrating] = useState(false);
  const [calibrationStep, setCalibrationStep] = useState('idle'); // 'idle', 'open', 'closed', 'done'
  const [calibrationEARs, setCalibrationEARs] = useState([]);
  const [calibratedThreshold, setCalibratedThreshold] = useState(null);
  const chartRef = useRef(null);
  const chartInstanceRef = useRef(null);
  const earDataRef = useRef([]);
  const blinkEventsRef = useRef([]);
  
>>>>>>> 30239a6 (first)
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const animationFrameRef = useRef(null);
<<<<<<< HEAD
  const faceMeshRef = useRef(null);
  const cameraRef = useRef(null);

  // GestureDetector equivalent state from divyatest.py
  const blinkThreshold = useRef(0.25);
  const consecutiveEmergencyBlinksRef = useRef(10);
  const blinkTimeoutRef = useRef(5000);
  const lastBlinkTimeRef = useRef(0);
  const cooldown = useRef(300);
  const isCurrentlyClosedRef = useRef(false); // New ref to track if eye is currently considered closed

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
=======
  const detectorRef = useRef(null);
  
  // Advanced blink detection parameters
  const CONSECUTIVE_FRAMES = 1; // Single frame detection
  const BLINK_COOLDOWN = 150; // Faster detection
  
  const earHistoryRef = useRef([]);
  const blinkCounterRef = useRef(0);
  const lastBlinkTimeRef = useRef(0);
  const sessionStartTimeRef = useRef(0);
  const debugEarHistoryRef = useRef([]); // For debugging
  const frameCountRef = useRef(0); // Track frame count

  const detectionIntervalRef = useRef(null);

  const [emergencyTriggered, setEmergencyTriggered] = useState(false);
  const [lastEmergencyTime, setLastEmergencyTime] = useState(0);

  // Calculate Eye Aspect Ratio (EAR) for blink detection - SIMPLIFIED VERSION
  const calculateEAR = useCallback((eye) => {
    if (!eye || eye.length < 6) {
      console.log('Invalid eye landmarks:', eye);
      return 0;
    }
    
    try {
      // Simplified EAR calculation using only key points
      const p1 = eye[1]; // Top eyelid
      const p2 = eye[2]; // Upper eyelid
      const p3 = eye[3]; // Outer corner
      const p4 = eye[4]; // Lower eyelid
      const p5 = eye[5]; // Bottom eyelid
      const p0 = eye[0]; // Inner corner
      
      // Calculate vertical distances
      const A = Math.sqrt(Math.pow(p1.y - p5.y, 2) + Math.pow(p1.x - p5.x, 2));
      const B = Math.sqrt(Math.pow(p2.y - p4.y, 2) + Math.pow(p2.x - p4.x, 2));
      
      // Calculate horizontal distance
      const C = Math.sqrt(Math.pow(p0.y - p3.y, 2) + Math.pow(p0.x - p3.x, 2));
      
      if (C === 0) {
        console.log('Horizontal distance is zero');
        return 0;
      }
      
      const ear = (A + B) / (2.0 * C);
      console.log(`EAR calculation: A=${A.toFixed(2)}, B=${B.toFixed(2)}, C=${C.toFixed(2)}, EAR=${ear.toFixed(3)}`);
      return ear;
    } catch (error) {
      console.error('Error calculating EAR:', error);
      return 0;
    }
  }, []);

  // Detect blinks using EAR and timing logic - IMPROVED VERSION
  const detectBlink = useCallback((leftEAR, rightEAR) => {
    const currentTime = Date.now();
    const avgEAR = (leftEAR + rightEAR) / 2;
    frameCountRef.current++;
    
    console.log(`Frame ${frameCountRef.current}: Left EAR=${leftEAR.toFixed(3)}, Right EAR=${rightEAR.toFixed(3)}, Avg EAR=${avgEAR.toFixed(3)}`);
    
    // Add current EAR to history for debugging
    debugEarHistoryRef.current.push(avgEAR);
    if (debugEarHistoryRef.current.length > 20) {
      debugEarHistoryRef.current.shift();
    }
    
    // Add current EAR to history
    earHistoryRef.current.push(avgEAR);
    if (earHistoryRef.current.length > 10) {
      earHistoryRef.current.shift();
    }
    
    // Check if EAR is below threshold (eye is closed)
    if (avgEAR < earThreshold) {
      console.log(`EAR below threshold! ${avgEAR.toFixed(3)} < ${earThreshold}`);
      
      // Check cooldown period to avoid multiple detections
      const timeSinceLastBlink = currentTime - lastBlinkTimeRef.current;
      
      if (timeSinceLastBlink > BLINK_COOLDOWN) {
        blinkCounterRef.current++;
        lastBlinkTimeRef.current = currentTime;
        
        setBlinkCount(blinkCounterRef.current);
        setLastBlinkTime(currentTime);
        
        // Calculate blinks per second
        const sessionDuration = (currentTime - sessionStartTimeRef.current) / 1000;
        if (sessionDuration > 0) {
          const bps = blinkCounterRef.current / sessionDuration;
          setBlinksPerSecond(bps);
        }
        
        console.log(`🎉 BLINK DETECTED! EAR: ${avgEAR.toFixed(3)}, Threshold: ${earThreshold}, Count: ${blinkCounterRef.current}, Time since last: ${timeSinceLastBlink}ms`);
        return true;
      } else {
        console.log(`Blink detected but in cooldown. Time since last: ${timeSinceLastBlink}ms, Cooldown: ${BLINK_COOLDOWN}ms`);
      }
    }
    
    return false;
  }, [earThreshold]);

  // Initialize face-api.js models
  const initializeDetector = useCallback(async () => {
    if (isInitialized) return;
    console.log('Attempting to initialize detector...');
    try {
      setDebugInfo('Loading face-api.js models...');
      console.log('Attempting to load models from: ./models (relative to index.html)');

      // Load models from the relative path
      await faceapi.nets.tinyFaceDetector.loadFromUri('./models');
      console.log('tinyFaceDetector model loaded.');
      await faceapi.nets.faceLandmark68Net.loadFromUri('./models');
      console.log('faceLandmark68Net model loaded.');
      await faceapi.nets.faceExpressionNet.loadFromUri('./models'); 
      console.log('faceExpressionNet model loaded.');
      
      setIsInitialized(true);
      setDebugInfo('Face-api.js models loaded successfully.');
      console.log('Face-api.js models loaded successfully.');
    } catch (error) {
      console.error('Detector initialization error:', error);
      setError('Failed to load face detection models: ' + error.message);
      setDebugInfo('Model initialization failed: ' + error.message);
      console.error('Model initialization failed:', error.message);
    }
  }, [isInitialized]);

  // --- Throttled Detection Loop ---
  const runDetection = useCallback(async () => {
    if (!isDetecting || !videoRef.current || !canvasRef.current || !isInitialized) return;
    const startTime = performance.now();
    try {
      if (videoRef.current.readyState !== videoRef.current.HAVE_ENOUGH_DATA) return;
      const displaySize = { width: videoRef.current.videoWidth, height: videoRef.current.videoHeight };
      faceapi.matchDimensions(canvasRef.current, displaySize);
      const context = canvasRef.current.getContext('2d');
      // Clear and draw video frame
      context.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      context.drawImage(videoRef.current, 0, 0, displaySize.width, displaySize.height);
      // Detect faces/landmarks
      const detections = await faceapi.detectAllFaces(canvasRef.current, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceExpressions();
      const resizedDetections = faceapi.resizeResults(detections, displaySize);
      if (resizedDetections.length > 0) {
        setFaceDetected(true);
        const detection = resizedDetections[0];
        const leftEye = detection.landmarks.getLeftEye();
        const rightEye = detection.landmarks.getRightEye();
        const leftEAR = calculateEAR(leftEye);
        const rightEAR = calculateEAR(rightEye);
        const avgEAR = (leftEAR + rightEAR) / 2;
        setCurrentEAR(avgEAR);
        const blinked = detectBlink(leftEAR, rightEAR);
        // Draw overlays
        faceapi.draw.drawDetections(canvasRef.current, resizedDetections);
        faceapi.draw.drawFaceLandmarks(canvasRef.current, resizedDetections);
        context.strokeStyle = blinked ? '#ff0000' : '#00ff00';
        context.lineWidth = 2;
        context.beginPath();
        leftEye.forEach((point, index) => {
          if (index === 0) context.moveTo(point.x, point.y);
          else context.lineTo(point.x, point.y);
        });
        context.closePath();
        context.stroke();
        context.beginPath();
        rightEye.forEach((point, index) => {
          if (index === 0) context.moveTo(point.x, point.y);
          else context.lineTo(point.x, point.y);
        });
        context.closePath();
        context.stroke();
        // Calibration logic ...
        if (isCalibrating) {
          if (calibrationStep === 'open') {
            setCalibrationEARs(ears => [...ears, avgEAR]);
            setDebugInfo('Calibration: Recording open-eye EAR...');
            if (calibrationEARs.length > 30) {
              setCalibrationStep('closed');
              setDebugInfo('Calibration: Now CLOSE your eyes for 2 seconds.');
            }
          } else if (calibrationStep === 'closed') {
            setCalibrationEARs(ears => [...ears, avgEAR]);
            setDebugInfo('Calibration: Recording closed-eye EAR...');
            if (calibrationEARs.length > 60) {
              const openEars = calibrationEARs.slice(0, 30);
              const closedEars = calibrationEARs.slice(30);
              const openMean = openEars.reduce((a, b) => a + b, 0) / openEars.length;
              const closedMean = closedEars.reduce((a, b) => a + b, 0) / closedEars.length;
              const threshold = (openMean + closedMean) / 2 - 0.02;
              setCalibratedThreshold(threshold);
              setEarThreshold(threshold);
              setIsCalibrating(false);
              setCalibrationStep('done');
              setDebugInfo(`Calibration complete! Threshold set to ${threshold.toFixed(3)}. Start blinking!`);
            }
          }
        }
        // Chart update
        if (chartInstanceRef.current) {
          earDataRef.current.push(avgEAR);
          blinkEventsRef.current.push(blinked ? 0.5 : 0);
          if (earDataRef.current.length > MAX_POINTS) earDataRef.current.shift();
          if (blinkEventsRef.current.length > MAX_POINTS) blinkEventsRef.current.shift();
          chartInstanceRef.current.data.datasets[0].data = earDataRef.current;
          chartInstanceRef.current.data.datasets[1].data = blinkEventsRef.current;
          chartInstanceRef.current.update('none');
        }
        setDebugInfo(`Face detected! EAR: ${avgEAR.toFixed(3)} | Blinks: ${blinkCounterRef.current} | BPS: ${blinksPerSecond.toFixed(2)} | Threshold: ${earThreshold} | Below: ${avgEAR < earThreshold ? 'YES' : 'NO'} | Frame: ${frameCountRef.current}`);
      } else {
        setFaceDetected(false);
        setCurrentEAR(0);
        setDebugInfo(`No face detected.`);
      }
      setProcessingTime(performance.now() - startTime);
    } catch (error) {
      setError('Processing failed: ' + error.message);
      setFaceDetected(false);
      setDebugInfo('Processing error: ' + error.message);
    }
  }, [isDetecting, isInitialized, calculateEAR, detectBlink, isCalibrating, calibrationStep, earThreshold]);

  // Start/stop detection interval
  useEffect(() => {
    if (isDetecting && isInitialized && videoRef.current) {
      detectionIntervalRef.current = setInterval(runDetection, DETECTION_INTERVAL);
    } else {
      if (detectionIntervalRef.current) clearInterval(detectionIntervalRef.current);
      detectionIntervalRef.current = null;
    }
    return () => { if (detectionIntervalRef.current) clearInterval(detectionIntervalRef.current); };
  }, [isDetecting, isInitialized, runDetection]);

  // Start camera and detection
  const startDetection = useCallback(async () => {
    try {
      setError('');
      setDebugInfo('Starting detection...');
      setIsDetecting(true);
      
      // Reset counters for new session
      blinkCounterRef.current = 0;
      earHistoryRef.current = [];
      lastBlinkTimeRef.current = 0;
      sessionStartTimeRef.current = Date.now();
      
      setBlinkCount(0);
      setBlinksPerSecond(0);
      setLastBlinkTime(0);
      setSessionStartTime(Date.now());
      
      // Initialize detector first
      await initializeDetector();
      
      // Get camera stream
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user'
        }
      });
      
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        
        // Wait for video to be ready
        await new Promise((resolve) => {
          videoRef.current.onloadedmetadata = () => {
            videoRef.current.play().then(resolve);
          };
        });
      }
      
      setDebugInfo('Camera started, beginning advanced blink detection...');
      
    } catch (error) {
      console.error('Start detection error:', error);
      setError('Failed to access camera: ' + error.message);
      setDebugInfo('Failed to start: ' + error.message);
      setIsDetecting(false);
    }
  }, [initializeDetector]);

  // Stop detection
  const stopDetection = useCallback(() => {
    setIsDetecting(false);
    setDebugInfo('Detection stopped');
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    
    // Reset counters
    setBlinkCount(0);
    blinkCounterRef.current = 0;
    earHistoryRef.current = [];
    setCurrentEAR(0);
    setFaceDetected(false);
    setBlinksPerSecond(0);
    setLastBlinkTime(0);
    lastBlinkTimeRef.current = 0;
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopDetection();
    };
  }, [stopDetection]);

  // --- Chart.js Live Graph ---
  useEffect(() => {
    if (!chartRef.current) return;
    if (chartInstanceRef.current) return; // Only create once
    chartInstanceRef.current = new Chart(chartRef.current, {
      type: 'line',
      data: {
        labels: Array(MAX_POINTS).fill(''),
        datasets: [
          {
            label: 'EAR',
            data: earDataRef.current,
            borderColor: '#0984e3',
            backgroundColor: 'rgba(9,132,227,0.1)',
            pointRadius: 0,
            borderWidth: 2,
            tension: 0.2,
            yAxisID: 'y',
          },
          {
            label: 'Blink',
            data: blinkEventsRef.current,
            borderColor: '#fdcb6e',
            backgroundColor: '#fdcb6e',
            type: 'bar',
            barPercentage: 1.0,
            categoryPercentage: 1.0,
            yAxisID: 'y',
            order: 2,
          },
        ],
      },
      options: {
        animation: false,
        responsive: true,
        plugins: {
          legend: { display: false },
        },
        scales: {
          y: {
            min: 0,
            max: 0.5,
            title: { display: true, text: 'EAR' },
          },
        },
      },
    });
    return () => { chartInstanceRef.current && chartInstanceRef.current.destroy(); };
  }, []);

  // --- Calibration Logic ---
  const startCalibration = () => {
    setIsCalibrating(true);
    setCalibrationStep('open');
    setCalibrationEARs([]);
    setCalibratedThreshold(null);
    setDebugInfo('Calibration: Please keep your eyes OPEN and look at the camera.');
  };

  useEffect(() => {
    if (
      isDetecting &&
      familyNumbers.length > 0 &&
      blinksPerSecond > panicThreshold &&
      !emergencyTriggered &&
      Date.now() - lastEmergencyTime > 30000
    ) {
      setEmergencyTriggered(true);
      setLastEmergencyTime(Date.now());
      if (window.electronAPI && window.electronAPI.callFamilyNumbers) {
        window.electronAPI.callFamilyNumbers(familyNumbers);
      } else {
        familyNumbers.forEach(num => window.open(`tel:${num}`));
      }
      setTimeout(() => setEmergencyTriggered(false), 10000);
    }
  }, [isDetecting, blinksPerSecond, panicThreshold, familyNumbers, emergencyTriggered, lastEmergencyTime]);
>>>>>>> 30239a6 (first)

  if (!isOpen) return null;

  return (
<<<<<<< HEAD
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
=======
    <div className={`blink-modal-backdrop ${isOpen ? 'show' : ''}`} onClick={onClose}>
      <div className="blink-modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="blink-modal-close-button" onClick={onClose}>
          &times;
        </button>
        
        <h2>👁️ Advanced Blink Detection</h2>
        <p className="patient-name">Testing for: {patientName || 'Patient'}</p>
        
        <div className="camera-container">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="camera-feed"
            style={{ display: 'none' }}
          />
          <canvas
            ref={canvasRef}
            className="processing-canvas"
            style={{ display: isDetecting && faceDetected ? 'block' : 'block' }}
          />
          
          {!isDetecting && (
            <div className="camera-placeholder">
              <div className="placeholder-icon">📷</div>
              <p>Camera will activate when you start detection</p>
            </div>
          )}
        </div>
        
        <div className="detection-stats">
          <div className="stat-item">
            <span className="stat-label">Face Detected:</span>
            <span className={`stat-value face-status ${faceDetected ? 'detected' : 'not-detected'}`}>
              {faceDetected ? '✅ Yes' : '❌ No'}
            </span>
          </div>
          
          <div className="stat-item">
            <span className="stat-label">Blink Count:</span>
            <span className="stat-value blink-count">{blinkCount}</span>
          </div>
          
          <div className="stat-item">
            <span className="stat-label">Eye Aspect Ratio:</span>
            <span className="stat-value ear-value">{currentEAR.toFixed(3)}</span>
          </div>
          
          <div className="stat-item">
            <span className="stat-label">Blinks/Second:</span>
            <span className="stat-value bps-value">{blinksPerSecond.toFixed(2)}</span>
          </div>
          
          <div className="stat-item">
            <span className="stat-label">Processing Time:</span>
            <span className="stat-value processing-time">{processingTime.toFixed(1)}ms</span>
          </div>
        </div>
        
        {debugInfo && (
          <div className="debug-info">
            <span>🔍 {debugInfo}</span>
          </div>
        )}
        
        {faceDetected && debugEarHistoryRef.current.length > 0 && (
          <div className="debug-ear-history">
            <h4>📊 Recent EAR Values (Last 5):</h4>
            <div className="ear-values">
              {debugEarHistoryRef.current.slice(-5).map((ear, index) => (
                <span 
                  key={index} 
                  className={`ear-value ${ear < earThreshold ? 'below-threshold' : 'above-threshold'}`}
                >
                  {ear.toFixed(3)}
                </span>
              ))}
            </div>
            <p className="threshold-info">Threshold: {earThreshold} (Values below this = blink)</p>
          </div>
        )}
        
        {error && (
          <div className="error-message">
            <span>⚠️ {error}</span>
          </div>
        )}
        
        <div className="detection-controls">
          {!isDetecting ? (
            <button 
              className="start-button"
              onClick={startDetection}
            >
              🎬 Start Advanced Detection
            </button>
          ) : (
            <button 
              className="stop-button"
              onClick={stopDetection}
            >
              ⏹️ Stop Detection
            </button>
          )}
          
          <button 
            className="reset-button"
            onClick={() => {
              setBlinkCount(0);
              blinkCounterRef.current = 0;
              earHistoryRef.current = [];
              lastBlinkTimeRef.current = 0;
              setBlinksPerSecond(0);
              setLastBlinkTime(0);
            }}
          >
            🔄 Reset Counter
          </button>
        </div>
        
        <div className="instructions">
          <h3>📋 Instructions:</h3>
          <ul>
            <li>Position your face in the camera view</li>
            <li>Look directly at the camera</li>
            <li>Blink naturally - the system will count each blink</li>
            <li>Watch the Eye Aspect Ratio (EAR) value change when you blink</li>
            <li>Green eye outlines = eyes open, Red = blink detected</li>
            <li>Good lighting improves detection accuracy</li>
            <li>Blinks/Second shows your current blink rate</li>
          </ul>
        </div>

        <div style={{ margin: '20px 0', textAlign: 'center' }}>
          <label htmlFor="ear-threshold-slider" style={{ fontWeight: 600, color: '#2d3436' }}>
            EAR Threshold: <span style={{ color: '#00b894' }}>{earThreshold.toFixed(3)}</span>
          </label>
          <input
            id="ear-threshold-slider"
            type="range"
            min="0.15"
            max="0.40"
            step="0.005"
            value={earThreshold}
            onChange={e => setEarThreshold(Number(e.target.value))}
            style={{ width: '60%', marginLeft: 10 }}
          />
        </div>

        <div style={{ margin: '20px 0', textAlign: 'center' }}>
          {!isCalibrating && calibrationStep !== 'done' && (
            <button className="start-button" onClick={startCalibration}>
              ✨ Auto-Calibrate Threshold
            </button>
          )}
          {isCalibrating && calibrationStep === 'open' && (
            <div className="calibration-info">Keep your eyes OPEN and look at the camera...</div>
          )}
          {isCalibrating && calibrationStep === 'closed' && (
            <div className="calibration-info">Now CLOSE your eyes for 2 seconds...</div>
          )}
          {calibrationStep === 'done' && (
            <div className="calibration-info">Calibration complete! Threshold set to {calibratedThreshold && calibratedThreshold.toFixed(3)}</div>
          )}
        </div>

        <div style={{ margin: '30px 0' }}>
          <canvas ref={chartRef} height={120} />
        </div>

        {emergencyTriggered && (
          <div className="emergency-alert" style={{ background: 'linear-gradient(135deg, #fd79a8, #e84393)', color: 'white', padding: 20, borderRadius: 15, margin: '20px 0', fontWeight: 600, fontSize: '1.3em', boxShadow: '0 4px 15px rgba(253,121,168,0.3)' }}>
            🚨 Emergency! Calling your family contacts now!
          </div>
        )}
>>>>>>> 30239a6 (first)
      </div>
    </div>
  );
};

<<<<<<< HEAD
export default BlinkDetectionModal;
=======
export default BlinkDetectionModal; 
>>>>>>> 30239a6 (first)

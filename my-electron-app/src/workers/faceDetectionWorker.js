// Face Detection Web Worker
// This worker handles all face detection and blink counting calculations
// to keep the main thread responsive

import { FaceMesh } from '@mediapipe/face_mesh';

let faceMesh;
let isInitialized = false;

// Eye Aspect Ratio (EAR) calculation function
function calculateEAR(eye) {
  // Calculate the euclidean distances between the vertical eye landmarks
  const A = Math.sqrt(Math.pow(eye[1].y - eye[5].y, 2) + Math.pow(eye[1].x - eye[5].x, 2));
  const B = Math.sqrt(Math.pow(eye[2].y - eye[4].y, 2) + Math.pow(eye[2].x - eye[4].x, 2));
  
  // Calculate the euclidean distance between the horizontal eye landmarks
  const C = Math.sqrt(Math.pow(eye[0].y - eye[3].y, 2) + Math.pow(eye[0].x - eye[3].x, 2));
  
  // The Eye Aspect Ratio is the ratio of the eye's height to its width
  const ear = (A + B) / (2.0 * C);
  
  return ear;
}

// Initialize MediaPipe Face Mesh
async function initializeFaceMesh() {
  if (isInitialized) return;
  
  faceMesh = new FaceMesh({
    locateFile: (file) => {
      return `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`;
    }
  });

  faceMesh.setOptions({
    maxNumFaces: 1,
    refineLandmarks: true,
    minDetectionConfidence: 0.5,
    minTrackingConfidence: 0.5
  });

  isInitialized = true;
}

// Process video frame for blink detection
async function processFrame(videoData) {
  if (!isInitialized) {
    await initializeFaceMesh();
  }

  try {
    const results = await new Promise((resolve) => {
      faceMesh.onResults((results) => {
        resolve(results);
      });
      faceMesh.send({ image: videoData });
    });

    if (results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0) {
      const landmarks = results.multiFaceLandmarks[0];
      
      // Extract eye landmarks (MediaPipe face mesh indices)
      const leftEye = [
        landmarks[33],  // Left eye corner
        landmarks[160], // Left eye top
        landmarks[158], // Left eye top inner
        landmarks[133], // Left eye bottom inner
        landmarks[153], // Left eye bottom
        landmarks[144]  // Left eye corner
      ];
      
      const rightEye = [
        landmarks[362], // Right eye corner
        landmarks[387], // Right eye top
        landmarks[386], // Right eye top inner
        landmarks[263], // Right eye bottom inner
        landmarks[373], // Right eye bottom
        landmarks[380]  // Right eye corner
      ];

      // Calculate EAR for both eyes
      const leftEAR = calculateEAR(leftEye);
      const rightEAR = calculateEAR(rightEye);
      
      // Average EAR
      const avgEAR = (leftEAR + rightEAR) / 2.0;
      
      return {
        success: true,
        avgEAR,
        leftEAR,
        rightEAR,
        landmarks: landmarks.length,
        faceDetected: true
      };
    } else {
      return {
        success: true,
        avgEAR: 0,
        leftEAR: 0,
        rightEAR: 0,
        landmarks: 0,
        faceDetected: false
      };
    }
  } catch (error) {
    return {
      success: false,
      error: error.message,
      faceDetected: false
    };
  }
}

// Handle messages from main thread
self.onmessage = async function(e) {
  const { type, data } = e.data;
  
  switch (type) {
    case 'INIT':
      await initializeFaceMesh();
      self.postMessage({ type: 'INIT_COMPLETE' });
      break;
      
    case 'PROCESS_FRAME':
      const result = await processFrame(data);
      self.postMessage({ 
        type: 'FRAME_RESULT', 
        data: result 
      });
      break;
      
    case 'CLEANUP':
      if (faceMesh) {
        faceMesh.close();
        isInitialized = false;
      }
      self.postMessage({ type: 'CLEANUP_COMPLETE' });
      break;
  }
}; 
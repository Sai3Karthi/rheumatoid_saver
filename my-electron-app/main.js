require('dotenv').config();
const { app, BrowserWindow, ipcMain, shell, Notification } = require('electron')
const path = require('path')
const fs = require('fs')
<<<<<<< HEAD
const axios = require('axios'); // Add axios import

// Remove Twilio configuration and client initialization
// const twilio = require('twilio');
// const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID || 'your_account_sid_here';
// const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN || 'your_auth_token_here';
// const TWILIO_PHONE_NUMBER = process.env.TWILIO_PHONE_NUMBER || '+1234567890';
// const twilioClient = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);

const BLAND_AI_API_KEY = process.env.BLAND_AI_API_KEY;
const BLAND_AI_API_ENDPOINT = 'https://api.bland.ai/v1/calls';
=======
const twilio = require('twilio');

// Twilio configuration - Get these from your Twilio console
const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID || 'your_account_sid_here';
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN || 'your_auth_token_here';
const TWILIO_PHONE_NUMBER = process.env.TWILIO_PHONE_NUMBER || '+1234567890'; // Your Twilio phone number

// Initialize Twilio client
const twilioClient = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
>>>>>>> 30239a6 (first)

const uploadsDir = path.join(__dirname, 'uploads');
// const modelsDir = path.join(__dirname, 'dist', 'models'); // No longer needed directly for IPC
console.log('Uploads directory:', uploadsDir);
// console.log('Models directory:', modelsDir); // No longer needed

function createWindow () {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: false,
<<<<<<< HEAD
      contextIsolation: true,
=======
      contextIsolation: false,
>>>>>>> 30239a6 (first)
      preload: path.join(__dirname, 'preload.js'),
      // additionalArguments: [`--models-path=${modelsDir}`] // No longer needed
    }
  })

  win.loadFile(path.join(__dirname, 'dist', 'index.html')) // Load index.html from dist
}

app.whenReady().then(() => {
  createWindow()

  ipcMain.on('report-distress', (event, message) => {
    console.log('Distress reported:', message);
    // Here you would integrate AI/ML for distress analysis or send to a backend
    // For now, let's just show a desktop notification.
    new Notification({
      title: 'Distress Reported',
      body: `Patient reported distress: ${message}`
    }).show();
  });

  ipcMain.on('call-emergency', () => {
    console.log('Attempting to call emergency services (911)');
    // In a real application, you might want to confirm with the user again
    // or use a more robust way to initiate a call if 'tel:' protocol is not enough
    shell.openExternal('tel:911');
  });

<<<<<<< HEAD
  ipcMain.on('sendEmergencyCall', async (event, patientName, numbers) => {
    if (Array.isArray(numbers) && numbers.length > 0) {
      try {
        console.log(`🚨 Emergency Alert for ${patientName}: Attempting to call ${numbers.length} family contacts using Bland AI`);
        console.log('Family numbers:', numbers);

        if (!BLAND_AI_API_KEY || BLAND_AI_API_KEY === 'YOUR_BLAND_AI_API_KEY') {
          throw new Error('Bland AI API Key not configured. Please set up your .env file.');
        }

        console.log('🔑 Using Bland AI API Key:', BLAND_AI_API_KEY.substring(0, 10) + '...');

        const callPromises = numbers.map(async (number) => {
          try {
            console.log(`📞 Making Bland AI call to: ${number}`);
            
            // Headers
            const headers = {
              'Authorization': BLAND_AI_API_KEY,
            };

            // Data
            const data = {
              "phone_number": number,
              "voice": "June",
              "wait_for_greeting": false,
              "record": true,
              "answered_by_enabled": true,
              "noise_cancellation": false,
              "interruption_threshold": 100,
              "block_interruptions": false,
              "max_duration": 12,
              "model": "base",
              "language": "en",
              "background_track": "none",
              "endpoint": "https://api.bland.ai",
              "voicemail_action": "hangup",
              "task": "This is an emergency alert from the Care Companion app. A family member, " + patientName + ", may be experiencing distress and needs immediate assistance. Please check on them right away. This is an automated emergency call. If you cannot reach them, please consider calling emergency services or visiting their location immediately. Thank you for your attention to this emergency alert."
            };

            console.log('📤 Sending request to Bland AI with data:', JSON.stringify(data, null, 2));

            // API request using axios
            const response = await axios.post('https://api.bland.ai/v1/calls', data, { headers });

            console.log(`✅ Bland AI call initiated successfully to ${number}:`, response.data);
            return { number, success: true, response: response.data };
          } catch (error) {
            console.error(`❌ Failed to make Bland AI call to ${number}:`, error.message);
            if (error.response) {
              console.error('Response status:', error.response.status);
              console.error('Response data:', error.response.data);
            }
            return { number, success: false, error: error.message };
          }
        });

        const results = await Promise.all(callPromises);
        const successfulCalls = results.filter(r => r.success);
        const failedCalls = results.filter(r => !r.success);

        console.log('📊 Emergency Call Results:', {
          total: numbers.length,
          successful: successfulCalls.length,
          failed: failedCalls.length,
          successfulNumbers: successfulCalls.map(r => r.number),
          failedNumbers: failedCalls.map(r => ({ number: r.number, error: r.error }))
        });

        new Notification({
          title: '🚨 Emergency Calls Initiated',
          body: `Successfully called ${successfulCalls.length}/${numbers.length} contacts via Bland AI. ${failedCalls.length} failed.`
        }).show();

        if (successfulCalls.length > 0) {
          console.log('✅ Successfully called:', successfulCalls.map(r => r.number).join(', '));
        }
        if (failedCalls.length > 0) {
          console.log('❌ Failed calls:', failedCalls.map(r => `${r.number} (${r.error})`).join(', '));
        }

      } catch (error) {
        console.error('🚨 Critical error during Bland AI call initiation:', error);

        console.log('🔄 Falling back to system dialer...');
        numbers.forEach(num => {
          console.log(`📞 Calling family number (fallback): ${num}`);
          shell.openExternal(`tel:${num}`);
        });

        new Notification({
          title: '🚨 Emergency Alert (Fallback)',
          body: `Bland AI failed. Using system dialer for: ${numbers.join(', ')}`
        }).show();
      }
    } else {
      console.warn('⚠️ sendEmergencyCall: Invalid or empty numbers array', numbers);
      new Notification({
        title: '⚠️ Emergency Alert',
        body: 'No family contacts found. Please add emergency contacts in Section C.'
      }).show();
=======
  ipcMain.on('call-family-numbers', async (event, numbers) => {
    if (Array.isArray(numbers)) {
      try {
        // Make calls using Twilio
        const callPromises = numbers.map(async (number) => {
          try {
            console.log('Making Twilio call to:', number);
            
            const call = await twilioClient.calls.create({
              url: 'http://localhost:3001/emergency-twillml', // Our local TwiML server
              to: number,
              from: TWILIO_PHONE_NUMBER,
              statusCallback: 'https://your-webhook-url.com/status', // Optional: for call status updates
              statusCallbackEvent: ['initiated', 'ringing', 'answered', 'completed'],
              statusCallbackMethod: 'POST'
            });
            
            console.log('Call initiated with SID:', call.sid);
            return { number, success: true, sid: call.sid };
          } catch (error) {
            console.error('Failed to call', number, ':', error.message);
            return { number, success: false, error: error.message };
          }
        });
        
        const results = await Promise.all(callPromises);
        const successfulCalls = results.filter(r => r.success);
        const failedCalls = results.filter(r => !r.success);
        
        console.log('Call results:', { successful: successfulCalls.length, failed: failedCalls.length });
        
        // Show notification
        new Notification({
          title: 'Emergency Calls Initiated',
          body: `Successfully called ${successfulCalls.length} contacts. ${failedCalls.length} failed.`
        }).show();
        
      } catch (error) {
        console.error('Error making Twilio calls:', error);
        
        // Fallback to shell.openExternal if Twilio fails
        console.log('Falling back to shell.openExternal...');
        numbers.forEach(num => {
          console.log('Calling family number (fallback):', num);
          shell.openExternal(`tel:${num}`);
        });
        
        new Notification({
          title: 'Emergency Alert (Fallback)',
          body: `Calling family contacts: ${numbers.join(', ')}`
        }).show();
      }
    } else {
      console.warn('call-family-numbers: Invalid numbers array', numbers);
>>>>>>> 30239a6 (first)
    }
  });

  ipcMain.handle('save-patient-details', async (event, details) => {
    console.log('Patient Details Saved:', details);
    let savedPicturePath = '';

    // Ensure the uploads directory exists
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir);
      console.log('Uploads directory created:', uploadsDir);
    }

    // Handle picture upload
    if (details.picture && details.picture.buffer && details.picture.name) {
      const pictureFileName = details.picture.name;
      const destPicturePath = path.join(uploadsDir, pictureFileName);
      const pictureBuffer = Buffer.from(details.picture.buffer);

      console.log('Destination picture path:', destPicturePath);
      try {
        fs.writeFileSync(destPicturePath, pictureBuffer);
        console.log(`Picture saved to: ${destPicturePath}`);
        savedPicturePath = destPicturePath; // Return this path
      } catch (error) {
        console.error('Error saving picture:', error);
      }
    }

    // Handle medical records upload
    if (details.medicalRecords && details.medicalRecords.length > 0) {
      for (const record of details.medicalRecords) {
        if (record.buffer && record.name) {
          const recordFileName = record.name;
          const destRecordPath = path.join(uploadsDir, recordFileName);
          const recordBuffer = Buffer.from(record.buffer);
          try {
            fs.writeFileSync(destRecordPath, recordBuffer);
            console.log(`Medical record saved to: ${destRecordPath}`);
          } catch (error) {
            console.error('Error saving medical record:', error);
          }
        }
      }
    }

    new Notification({
      title: 'Patient Details Saved',
      body: `Details for ${details.name} saved!`
    }).show();

    return { savedPicturePath: savedPicturePath }; // Return the path
  });

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
}) 
const { contextBridge, ipcRenderer } = require('electron')

// Removed: Parse additional arguments for the models path
// const getModelsPath = () => {
//   const modelsArg = process.argv.find(arg => arg.startsWith('--models-path='));
//   return modelsArg ? modelsArg.split('=')[1] : null;
// };

contextBridge.exposeInMainWorld('electronAPI', {
  reportDistress: (message) => ipcRenderer.send('report-distress', message),
  callEmergency: () => ipcRenderer.send('call-emergency'),
  savePatientDetails: (details) => ipcRenderer.invoke('save-patient-details', details),
  callFamilyNumbers: (numbers) => ipcRenderer.send('call-family-numbers', numbers),
  // Window control functions
  minimizeWindow: () => ipcRenderer.send('minimize-window'),
  maximizeWindow: () => ipcRenderer.send('maximize-window'),
  closeWindow: () => ipcRenderer.send('close-window'),
  // Menu-related functions
  onOpenPatientModal: (callback) => ipcRenderer.on('open-patient-modal', callback),
  onOpenBlinkModal: (callback) => ipcRenderer.on('open-blink-modal', callback),
  onCallEmergency: (callback) => ipcRenderer.on('call-emergency', callback),
  // Removed: getModelsPath: getModelsPath
})

contextBridge.exposeInMainWorld('electron', {
  sendEmergencyCall: (patientName, familyNumbers) => ipcRenderer.send('sendEmergencyCall', patientName, familyNumbers),
  // Add other IPC functions as needed later
}) 
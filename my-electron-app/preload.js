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
  // Removed: getModelsPath: getModelsPath
})

contextBridge.exposeInMainWorld('electron', {
  sendEmergencyCall: (patientName, familyNumbers) => ipcRenderer.send('sendEmergencyCall', patientName, familyNumbers),
  // Add other IPC functions as needed later
}) 
document.addEventListener('DOMContentLoaded', () => {
    const reportDistressButton = document.getElementById('reportDistress');
    const distressInput = document.getElementById('distressInput');
    const callEmergencyButton = document.getElementById('callEmergency');

    // Elements for Patient Details Display
    const displayPatientName = document.getElementById('displayPatientName');
    const displayPatientDOB = document.getElementById('displayPatientDOB');
    const displayPatientMedicalID = document.getElementById('displayPatientMedicalID');
    const displayPatientPicture = document.getElementById('displayPatientPicture');
    const displayMedicalRecords = document.getElementById('displayMedicalRecords');
    const patientImage = document.getElementById('patientImage');

    // Modal elements
    const patientDetailsModal = document.getElementById('patientDetailsModal');
    const editPatientDetailsButton = document.getElementById('editPatientDetails');
    const modalCloseButton = patientDetailsModal.querySelector('.modal-close-button');
    const saveModalPatientDetailsButton = document.getElementById('saveModalPatientDetails');
    const cancelModalPatientDetailsButton = document.getElementById('cancelModalPatientDetails');

    // Modal input fields
    const modalPatientName = document.getElementById('modalPatientName');
    const modalPatientDOB = document.getElementById('modalPatientDOB');
    const modalPatientMedicalID = document.getElementById('modalPatientMedicalID');
    const modalPatientPicture = document.getElementById('modalPatientPicture');
    const modalMedicalRecords = document.getElementById('modalMedicalRecords');

    // Function to read file as ArrayBuffer
    function readFileAsArrayBuffer(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
                resolve(reader.result);
            };
            reader.onerror = reject;
            reader.readAsArrayBuffer(file);
        });
    }

    // Function to show the modal
    function showModal() {
        patientDetailsModal.classList.add('show');
    }

    // Function to hide the modal
    function hideModal() {
        patientDetailsModal.classList.remove('show');
    }

    // Function to update displayed patient details
    function updatePatientDetailsDisplay(details, savedPicturePath = '') {
        displayPatientName.textContent = details.name || 'N/A';
        displayPatientDOB.textContent = details.dob || 'N/A';
        displayPatientMedicalID.textContent = details.medicalID || 'N/A';
        displayMedicalRecords.textContent = details.medicalRecords && details.medicalRecords.length > 0 
            ? details.medicalRecords.join(', ') : 'N/A';

        if (savedPicturePath) {
            // Convert file system path to a file:// URL
            const imageUrl = 'file:///' + savedPicturePath.replace(/\\/g, '/');
            patientImage.src = imageUrl;
            patientImage.style.display = 'block';
            displayPatientPicture.textContent = savedPicturePath.split(/[\\/]/).pop(); // Display just the filename
        } else {
            patientImage.src = '';
            patientImage.style.display = 'none';
            displayPatientPicture.textContent = details.picture || 'N/A';
        }
    }

    // Event Listeners for Distress Reporting and Emergency Call
    reportDistressButton.addEventListener('click', () => {
        const distressMessage = distressInput.value;
        if (distressMessage.trim() !== '') {
            window.electronAPI.reportDistress(distressMessage);
            distressInput.value = '';
        } else {
            alert('Please describe your distress.');
        }
    });

    callEmergencyButton.addEventListener('click', () => {
        if (confirm('Are you sure you want to call emergency services?')) {
            window.electronAPI.callEmergency();
        }
    });

    // Event Listeners for Patient Details Modal
    editPatientDetailsButton.addEventListener('click', () => {
        // Optionally pre-fill modal with current displayed data or stored data
        modalPatientName.value = displayPatientName.textContent !== 'N/A' ? displayPatientName.textContent : '';
        modalPatientDOB.value = displayPatientDOB.textContent !== 'N/A' ? displayPatientDOB.textContent : '';
        modalPatientMedicalID.value = displayPatientMedicalID.textContent !== 'N/A' ? displayPatientMedicalID.textContent : '';
        // File inputs cannot be pre-filled for security reasons

        showModal();
    });

    modalCloseButton.addEventListener('click', hideModal);
    cancelModalPatientDetailsButton.addEventListener('click', hideModal);

    saveModalPatientDetailsButton.addEventListener('click', async () => {
        let patientPictureData = null;
        if (modalPatientPicture.files.length > 0) {
            const file = modalPatientPicture.files[0];
            const arrayBuffer = await readFileAsArrayBuffer(file);
            patientPictureData = {
                buffer: Array.from(new Uint8Array(arrayBuffer)), // Convert ArrayBuffer to array for IPC
                name: file.name
            };
        }

        let medicalRecordsData = [];
        if (modalMedicalRecords.files.length > 0) {
            for (const file of Array.from(modalMedicalRecords.files)) {
                const arrayBuffer = await readFileAsArrayBuffer(file);
                medicalRecordsData.push({
                    buffer: Array.from(new Uint8Array(arrayBuffer)), // Convert ArrayBuffer to array for IPC
                    name: file.name
                });
            }
        }

        const patientDetails = {
            name: modalPatientName.value,
            dob: modalPatientDOB.value,
            medicalID: modalPatientMedicalID.value,
            picture: patientPictureData,
            medicalRecords: medicalRecordsData
        };

        const response = await window.electronAPI.savePatientDetails(patientDetails);
        
        updatePatientDetailsDisplay(
            {
                name: modalPatientName.value,
                dob: modalPatientDOB.value,
                medicalID: modalPatientMedicalID.value,
                picture: patientPictureData ? patientPictureData.name : (displayPatientPicture.textContent !== 'N/A' ? displayPatientPicture.textContent : 'No file selected'),
                medicalRecords: medicalRecordsData.map(r => r.name)
            },
            response.savedPicturePath
        );

        hideModal();
    });

    // Initial display update (if data is loaded from storage)
    // For now, it will be N/A until saved via the modal
    updatePatientDetailsDisplay({}); // Initialize display with N/A
}); 
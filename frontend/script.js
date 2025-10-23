// Configuration
const API_BASE_URL = 'http://localhost:8000'; // Adjust this to your gateway service URL

// Utility function to convert file to base64
function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            // Remove the data:image/xxx;base64, prefix
            const base64 = reader.result.split(',')[1];
            resolve(base64);
        };
        reader.onerror = error => reject(error);
    });
}

// Utility function to display results
function displayResult(elementId, data, isError = false) {
    const element = document.getElementById(elementId);
    element.innerHTML = '';
    
    if (isError) {
        element.innerHTML = `<p><strong>Error:</strong> ${data}</p>`;
        return;
    }
    
    const pre = document.createElement('pre');
    pre.textContent = JSON.stringify(data, null, 2);
    element.appendChild(pre);
    
    // If there's an image in the response, display it
    if (data.image_b64) {
        const img = document.createElement('img');
        img.src = `data:image/png;base64,${data.image_b64}`;
        img.style.maxWidth = '500px';
        img.style.marginTop = '10px';
        element.appendChild(img);
    }
}

// Gateway Service - Create Room (Full Pipeline)
async function createRoom() {
    try {
        const imageFile = document.getElementById('gateway-image').files[0];
        const prompt = document.getElementById('gateway-prompt').value;
        const steps = parseInt(document.getElementById('gateway-steps').value) || 20;
        
        if (!imageFile) {
            displayResult('gateway-result', 'Please select an image', true);
            return;
        }
        
        const imageB64 = await fileToBase64(imageFile);
        
        const response = await fetch(`${API_BASE_URL}/rooms`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                image_b64: imageB64,
                prompt: prompt,
                options: { steps: steps }
            })
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        displayResult('gateway-result', result);
        
        // Auto-fill job ID for status checking
        document.getElementById('job-id').value = result.job_id;
        
        // Auto-check status after a few seconds
        setTimeout(() => {
            checkJobStatus();
        }, 3000);
        
    } catch (error) {
        displayResult('gateway-result', error.message, true);
    }
}

// Check Job Status
async function checkJobStatus() {
    try {
        const jobId = document.getElementById('job-id').value.trim();
        
        if (!jobId) {
            displayResult('job-status-result', 'Please enter a job ID', true);
            return;
        }
        
        const response = await fetch(`${API_BASE_URL}/rooms/${jobId}`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        displayResult('job-status-result', result);
        
        // If job is still running, auto-check again
        if (result.status === 'pending' || result.status === 'running') {
            setTimeout(() => {
                checkJobStatus();
            }, 3000);
        }
        
    } catch (error) {
        displayResult('job-status-result', error.message, true);
    }
}

// Detect Objects
async function detectObjects() {
    try {
        const imageFile = document.getElementById('detect-image').files[0];
        
        if (!imageFile) {
            displayResult('detect-result', 'Please select an image', true);
            return;
        }
        
        const imageB64 = await fileToBase64(imageFile);
        
        const response = await fetch(`${API_BASE_URL.replace(':8000', ':8001')}/detect`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                image_b64: imageB64
            })
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        displayResult('detect-result', result);
        
    } catch (error) {
        displayResult('detect-result', error.message, true);
    }
}

// Segment Image
async function segmentImage() {
    try {
        const imageFile = document.getElementById('segment-image').files[0];
        const bboxesText = document.getElementById('segment-bboxes').value.trim();
        
        if (!imageFile) {
            displayResult('segment-result', 'Please select an image', true);
            return;
        }
        
        let bboxes = [];
        if (bboxesText) {
            try {
                bboxes = JSON.parse(bboxesText);
            } catch (e) {
                displayResult('segment-result', 'Invalid JSON format for bounding boxes', true);
                return;
            }
        }
        
        const imageB64 = await fileToBase64(imageFile);
        
        const response = await fetch(`${API_BASE_URL.replace(':8000', ':8002')}/segment`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                image_b64: imageB64,
                bboxes: bboxes
            })
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        displayResult('segment-result', result);
        
    } catch (error) {
        displayResult('segment-result', error.message, true);
    }
}

// Get Advice
async function getAdvice() {
    try {
        const prompt = document.getElementById('advise-prompt').value.trim();
        const masksText = document.getElementById('advise-masks').value.trim();
        
        if (!prompt) {
            displayResult('advise-result', 'Please enter a prompt', true);
            return;
        }
        
        let masks = [];
        if (masksText) {
            try {
                masks = JSON.parse(masksText);
            } catch (e) {
                displayResult('advise-result', 'Invalid JSON format for masks', true);
                return;
            }
        }
        
        const response = await fetch(`${API_BASE_URL.replace(':8000', ':8003')}/advise`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                prompt: prompt,
                masks: masks
            })
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        displayResult('advise-result', result);
        
    } catch (error) {
        displayResult('advise-result', error.message, true);
    }
}

// Generate Image
async function generateImage() {
    try {
        const imageFile = document.getElementById('generate-image').files[0];
        const prompt = document.getElementById('generate-prompt').value.trim();
        const steps = parseInt(document.getElementById('generate-steps').value) || 20;
        const masksText = document.getElementById('generate-masks').value.trim();
        
        if (!imageFile) {
            displayResult('generate-result', 'Please select a control image', true);
            return;
        }
        
        if (!prompt) {
            displayResult('generate-result', 'Please enter a prompt', true);
            return;
        }
        
        let masks = [];
        if (masksText) {
            try {
                masks = JSON.parse(masksText);
            } catch (e) {
                displayResult('generate-result', 'Invalid JSON format for masks', true);
                return;
            }
        }
        
        const imageB64 = await fileToBase64(imageFile);
        
        const response = await fetch(`${API_BASE_URL.replace(':8000', ':8004')}/render`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                image_b64: imageB64,
                prompt: prompt,
                masks: masks,
                options: { steps: steps }
            })
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        displayResult('generate-result', result);
        
    } catch (error) {
        displayResult('generate-result', error.message, true);
    }
}

// Auto-refresh job status every 5 seconds if there's a job ID
setInterval(() => {
    const jobId = document.getElementById('job-id').value.trim();
    if (jobId) {
        const statusElement = document.getElementById('job-status-result');
        const statusText = statusElement.textContent;
        if (statusText.includes('"status": "pending"') || statusText.includes('"status": "running"')) {
            checkJobStatus();
        }
    }
}, 5000);
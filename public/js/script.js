// HealthCare Helper - Elderly-Friendly Healthcare App
class HealthCareHelper {
    constructor() {
        this.currentPage = 'home';
        this.doctors = this.loadDoctors();
        this.medicineDatabase = this.loadMedicineDatabase();
        this.voiceRecognition = null;
        this.isListening = false;
        this.apiBaseUrl = 'http://localhost:3000'; // Backend API URL
        this.currentTheme = 'light'; // Default to light theme
        this.cameraStream = null;
        this.isCameraActive = false;
        this.autoCaptureInterval = null;
        this.analysisCanvas = null;
        this.analysisContext = null;
        this.lastClarityScore = 0;
        this.clarityThreshold = 50; // Minimum clarity score for auto-capture (lowered for better responsiveness)
        this.stableFramesRequired = 2; // Number of consecutive good frames needed (reduced)
        this.stableFrameCount = 0;
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupVoiceRecognition();
        this.loadUserPreferences();
        this.initializeTheme();
        this.initializeLanguage();
        this.showPage('home');
    }

    setupEventListeners() {
        // Navigation
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const page = e.currentTarget.dataset.page;
                this.showPage(page);
            });
        });

        // Quick action buttons
        document.querySelectorAll('.action-btn[data-page]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const page = e.currentTarget.dataset.page;
                console.log('Action button clicked:', page);
                if (page) {
                    this.showPage(page);
                }
            });
        });

        // Medicine photo upload
        const medicinePhotoInput = document.getElementById('medicine-photo');
        if (medicinePhotoInput) {
            medicinePhotoInput.addEventListener('change', (e) => {
                this.handleMedicinePhoto(e.target.files[0]);
            });
        }

        // Doctor search and filters
        const doctorSearch = document.getElementById('doctor-search');
        if (doctorSearch) {
            doctorSearch.addEventListener('input', (e) => {
                this.searchDoctors(e.target.value);
            });
        }

        const specializationFilter = document.getElementById('specialization-filter');
        if (specializationFilter) {
            specializationFilter.addEventListener('change', () => {
                this.filterDoctors();
            });
        }

        const distanceFilter = document.getElementById('distance-filter');
        if (distanceFilter) {
            distanceFilter.addEventListener('change', () => {
                this.filterDoctors();
            });
        }

        const ratingFilter = document.getElementById('rating-filter');
        if (ratingFilter) {
            ratingFilter.addEventListener('change', () => {
                this.filterDoctors();
            });
        }

        // View toggle
        document.querySelectorAll('.view-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.toggleView(e.currentTarget.dataset.view);
            });
        });

        // Voice assistant
        const voiceAssistBtn = document.querySelector('.voice-assist-btn');
        if (voiceAssistBtn) {
            voiceAssistBtn.addEventListener('click', () => {
                this.openVoiceModal();
            });
        }

        // Upload area click
        const uploadArea = document.getElementById('upload-area');
        if (uploadArea) {
            uploadArea.addEventListener('click', () => {
                const medicinePhoto = document.getElementById('medicine-photo');
                if (medicinePhoto) {
                    medicinePhoto.click();
                }
            });
        }

        // Upload button click
        const uploadBtn = document.getElementById('upload-btn');
        if (uploadBtn) {
            uploadBtn.addEventListener('click', (e) => {
                e.stopPropagation(); // Prevent triggering upload area click
                const medicinePhoto = document.getElementById('medicine-photo');
                if (medicinePhoto) {
                    medicinePhoto.click();
                }
            });
        }

        // Camera controls
        const cameraBtn = document.getElementById('camera-btn');
        if (cameraBtn) {
            cameraBtn.addEventListener('click', () => {
                this.startCamera();
            });
        }

        const stopCameraBtn = document.getElementById('stop-camera-btn');
        if (stopCameraBtn) {
            stopCameraBtn.addEventListener('click', () => {
                this.stopCamera();
            });
        }

        const captureBtn = document.getElementById('capture-btn');
        if (captureBtn) {
            captureBtn.addEventListener('click', () => {
                this.captureFromCamera();
            });
        }

        // Add manual auto-capture trigger for testing
        document.addEventListener('keydown', (e) => {
            if (e.key === ' ' && this.isCameraActive) { // Spacebar to trigger auto-capture
                e.preventDefault();
                console.log('Manual auto-capture trigger');
                this.performAutoCapture();
            }
            if (e.key === 't' && this.isCameraActive) { // 't' key to test clarity detection
                e.preventDefault();
                console.log('Testing clarity detection...');
                this.testClarityDetection();
            }
        });

        // Language toggle functionality
        document.addEventListener('click', (e) => {
            if (e.target.closest('.lang-btn')) {
                const langBtn = e.target.closest('.lang-btn');
                const language = langBtn.dataset.lang;
                this.switchLanguage(language);
            }
        });

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            this.handleKeyboardNavigation(e);
        });

        // Focus management for accessibility
        document.addEventListener('focusin', (e) => {
            this.handleFocusManagement(e);
        });

        // Theme toggle
        const themeToggle = document.getElementById('theme-toggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => {
                this.toggleTheme();
            });
        }
    }

    setupVoiceRecognition() {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            this.voiceRecognition = new SpeechRecognition();
            this.voiceRecognition.continuous = false;
            this.voiceRecognition.interimResults = false;
            this.voiceRecognition.lang = 'en-US';

            this.voiceRecognition.onresult = (event) => {
                const command = event.results[0][0].transcript.toLowerCase();
                this.processVoiceCommand(command);
            };

            this.voiceRecognition.onerror = (event) => {
                console.error('Voice recognition error:', event.error);
                this.showNotification('Voice recognition error. Please try again.', 'error');
            };

            this.voiceRecognition.onend = () => {
                this.isListening = false;
                this.updateVoiceButton();
            };
        }
    }

    // Page Navigation
    showPage(pageName) {
        console.log('Navigating to page:', pageName);
        
        // Update navigation
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        const navBtn = document.querySelector(`[data-page="${pageName}"]`);
        if (navBtn) {
            navBtn.classList.add('active');
        }

        // Show page content
        document.querySelectorAll('.page').forEach(page => {
            page.classList.remove('active');
        });
        const targetPage = document.getElementById(pageName);
        if (targetPage) {
            targetPage.classList.add('active');
        } else {
            console.error('Page not found:', pageName);
        }

        this.currentPage = pageName;

        // Load page-specific content
        if (pageName === 'find-doctors') {
            this.renderDoctors();
        }

        // Stop camera if leaving scanner page
        if (this.currentPage === 'scan-medicine' && pageName !== 'scan-medicine') {
            this.stopCamera();
        }

        // Announce page change for screen readers
        this.announcePageChange(pageName);
    }

    announcePageChange(pageName) {
        const pageTitles = {
            'home': 'Home page',
            'scan-medicine': 'Scan Medicine page',
            'find-doctors': 'Find Doctors page'
        };
        
        const announcement = document.createElement('div');
        announcement.setAttribute('aria-live', 'polite');
        announcement.setAttribute('aria-atomic', 'true');
        announcement.className = 'sr-only';
        announcement.textContent = `Navigated to ${pageTitles[pageName]}`;
        
        document.body.appendChild(announcement);
        setTimeout(() => {
            document.body.removeChild(announcement);
        }, 1000);
    }

    // Medicine Scanner
    handleMedicinePhoto(file) {
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            this.processMedicineImage(e.target.result, file.name);
        };
        reader.readAsDataURL(file);
    }

    // Camera Functions
    async startCamera() {
        try {
            this.showNotification('Starting camera...', 'info');
            
            // Request camera access
            this.cameraStream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: 'environment', // Use back camera on mobile
                    width: { ideal: 1280 },
                    height: { ideal: 720 }
                },
                audio: false
            });

            const video = document.getElementById('camera-preview');
            const uploadArea = document.getElementById('upload-area');
            const cameraOverlay = document.getElementById('camera-overlay');
            const viewport = document.getElementById('scanner-viewport');
            
            // Set up video stream
            video.srcObject = this.cameraStream;
            video.style.display = 'block';
            
            // Hide upload area and show camera overlay
            uploadArea.style.display = 'none';
            cameraOverlay.style.display = 'flex';
            viewport.classList.add('camera-active');
            
            // Update button states
            this.updateCameraButtons(true);
            
            // Initialize analysis canvas
            this.initializeAnalysisCanvas();
            
            // Start auto-capture analysis
            this.startAutoCaptureAnalysis();
            
            this.isCameraActive = true;
            this.showNotification('Camera started successfully - Auto-capture enabled', 'success');
            
        } catch (error) {
            console.error('Error starting camera:', error);
            this.showNotification('Failed to start camera. Please check permissions.', 'error');
            
            // Fallback to upload mode
            this.updateCameraButtons(false);
        }
    }

    stopCamera() {
        if (this.cameraStream) {
            // Stop all tracks
            this.cameraStream.getTracks().forEach(track => {
                track.stop();
            });
            this.cameraStream = null;
        }

        const video = document.getElementById('camera-preview');
        const uploadArea = document.getElementById('upload-area');
        const cameraOverlay = document.getElementById('camera-overlay');
        const viewport = document.getElementById('scanner-viewport');
        
        // Hide video and camera overlay, show upload area
        video.style.display = 'none';
        cameraOverlay.style.display = 'none';
        uploadArea.style.display = 'flex';
        viewport.classList.remove('camera-active');
        
        // Stop auto-capture analysis
        this.stopAutoCaptureAnalysis();
        
        // Update button states
        this.updateCameraButtons(false);
        
        this.isCameraActive = false;
        this.showNotification('Camera stopped', 'info');
    }

    captureFromCamera() {
        if (!this.isCameraActive || !this.cameraStream) {
            this.showNotification('Camera is not active', 'error');
            return;
        }

        try {
            const video = document.getElementById('camera-preview');
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            
            // Set canvas dimensions to match video
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            
            // Draw current video frame to canvas
            context.drawImage(video, 0, 0, canvas.width, canvas.height);
            
            // Convert canvas to blob
            canvas.toBlob((blob) => {
                if (blob) {
                    // Create a file from the blob
                    const file = new File([blob], 'camera-capture.jpg', {
                        type: 'image/jpeg',
                        lastModified: Date.now()
                    });
                    
                    // Process the captured image
                    this.handleMedicinePhoto(file);
                    
                    // Stop camera after capture
                    this.stopCamera();
                    
                    this.showNotification('Image captured successfully', 'success');
                } else {
                    this.showNotification('Failed to capture image', 'error');
                }
            }, 'image/jpeg', 0.8);
            
        } catch (error) {
            console.error('Error capturing image:', error);
            this.showNotification('Failed to capture image', 'error');
        }
    }

    updateCameraButtons(isActive) {
        const cameraBtn = document.getElementById('camera-btn');
        const uploadBtn = document.getElementById('upload-btn');
        const captureBtn = document.getElementById('capture-btn');
        const stopBtn = document.getElementById('stop-camera-btn');
        
        if (isActive) {
            // Camera is active - show capture and stop buttons
            cameraBtn.style.display = 'none';
            uploadBtn.style.display = 'none';
            captureBtn.style.display = 'flex';
            stopBtn.style.display = 'flex';
        } else {
            // Camera is not active - show start camera and upload buttons
            cameraBtn.style.display = 'flex';
            uploadBtn.style.display = 'flex';
            captureBtn.style.display = 'none';
            stopBtn.style.display = 'none';
        }
    }

    // Auto-Capture Analysis Methods
    initializeAnalysisCanvas() {
        this.analysisCanvas = document.createElement('canvas');
        this.analysisContext = this.analysisCanvas.getContext('2d');
    }

    startAutoCaptureAnalysis() {
        if (this.autoCaptureInterval) {
            clearInterval(this.autoCaptureInterval);
        }

        console.log('Starting auto-capture analysis...');
        this.autoCaptureInterval = setInterval(() => {
            this.analyzeFrame();
        }, 200); // Analyze every 200ms
    }

    stopAutoCaptureAnalysis() {
        if (this.autoCaptureInterval) {
            clearInterval(this.autoCaptureInterval);
            this.autoCaptureInterval = null;
        }
        this.stableFrameCount = 0;
        this.lastClarityScore = 0;
    }

    analyzeFrame() {
        if (!this.isCameraActive || !this.cameraStream) {
            console.log('Camera not active or stream not available');
            return;
        }

        const video = document.getElementById('camera-preview');
        if (!video || video.videoWidth === 0) {
            console.log('Video not ready:', { video: !!video, width: video?.videoWidth });
            return;
        }

        try {
            // Set canvas size to match video
            this.analysisCanvas.width = video.videoWidth;
            this.analysisCanvas.height = video.videoHeight;

            // Draw current frame to canvas
            this.analysisContext.drawImage(video, 0, 0, this.analysisCanvas.width, this.analysisCanvas.height);

            // Analyze the frame for text clarity
            const clarityScore = this.calculateTextClarity();
            
            console.log('Frame analysis:', { 
                clarityScore, 
                threshold: this.clarityThreshold, 
                stableCount: this.stableFrameCount,
                required: this.stableFramesRequired 
            });
            
            // Update UI with analysis results
            this.updateClarityUI(clarityScore);

            // Check if we should auto-capture
            if (clarityScore >= this.clarityThreshold) {
                this.stableFrameCount++;
                console.log(`Good frame detected! Count: ${this.stableFrameCount}/${this.stableFramesRequired}`);
                if (this.stableFrameCount >= this.stableFramesRequired) {
                    console.log('Triggering auto-capture!');
                    this.performAutoCapture();
                }
            } else {
                this.stableFrameCount = 0;
            }

        } catch (error) {
            console.error('Error analyzing frame:', error);
        }
    }

    calculateTextClarity() {
        if (!this.analysisContext) return 0;

        const imageData = this.analysisContext.getImageData(0, 0, this.analysisCanvas.width, this.analysisCanvas.height);
        const data = imageData.data;

        // Focus on the center region (where medicine name is likely to be)
        const centerX = Math.floor(this.analysisCanvas.width * 0.2);
        const centerY = Math.floor(this.analysisCanvas.height * 0.2);
        const regionWidth = Math.floor(this.analysisCanvas.width * 0.6);
        const regionHeight = Math.floor(this.analysisCanvas.height * 0.6);

        let edgeCount = 0;
        let totalPixels = 0;
        let contrastSum = 0;
        let sharpnessSum = 0;

        // Analyze the center region for text-like features
        for (let y = centerY; y < centerY + regionHeight; y += 1) {
            for (let x = centerX; x < centerX + regionWidth; x += 1) {
                const index = (y * this.analysisCanvas.width + x) * 4;
                
                if (index + 3 < data.length) {
                    const r = data[index];
                    const g = data[index + 1];
                    const b = data[index + 2];
                    const gray = (r + g + b) / 3;

                    // Check for edges (text boundaries) - improved edge detection
                    if (x > centerX && y > centerY && x < centerX + regionWidth - 1 && y < centerY + regionHeight - 1) {
                        // Check horizontal edge
                        const rightIndex = (y * this.analysisCanvas.width + (x + 1)) * 4;
                        if (rightIndex + 2 < data.length) {
                            const rightGray = (data[rightIndex] + data[rightIndex + 1] + data[rightIndex + 2]) / 3;
                            const horizontalEdge = Math.abs(gray - rightGray);
                            
                            if (horizontalEdge > 20) {
                                edgeCount++;
                            }
                        }

                        // Check vertical edge
                        const bottomIndex = ((y + 1) * this.analysisCanvas.width + x) * 4;
                        if (bottomIndex + 2 < data.length) {
                            const bottomGray = (data[bottomIndex] + data[bottomIndex + 1] + data[bottomIndex + 2]) / 3;
                            const verticalEdge = Math.abs(gray - bottomGray);
                            
                            if (verticalEdge > 20) {
                                edgeCount++;
                            }
                        }
                    }

                    // Calculate contrast
                    const contrast = Math.abs(gray - 128) / 128;
                    contrastSum += contrast;
                    
                    // Calculate sharpness (local variance)
                    if (x > centerX && y > centerY && x < centerX + regionWidth - 1 && y < centerY + regionHeight - 1) {
                        const neighbors = [];
                        for (let dy = -1; dy <= 1; dy++) {
                            for (let dx = -1; dx <= 1; dx++) {
                                const neighborIndex = ((y + dy) * this.analysisCanvas.width + (x + dx)) * 4;
                                if (neighborIndex + 2 < data.length) {
                                    const neighborGray = (data[neighborIndex] + data[neighborIndex + 1] + data[neighborIndex + 2]) / 3;
                                    neighbors.push(neighborGray);
                                }
                            }
                        }
                        
                        if (neighbors.length > 0) {
                            const mean = neighbors.reduce((a, b) => a + b, 0) / neighbors.length;
                            const variance = neighbors.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / neighbors.length;
                            sharpnessSum += Math.sqrt(variance);
                        }
                    }
                    
                    totalPixels++;
                }
            }
        }

        // Calculate clarity score based on edge density, contrast, and sharpness
        const edgeDensity = totalPixels > 0 ? (edgeCount / totalPixels) * 100 : 0;
        const averageContrast = totalPixels > 0 ? (contrastSum / totalPixels) * 100 : 0;
        const averageSharpness = totalPixels > 0 ? (sharpnessSum / totalPixels) * 2 : 0;
        
        // Combine metrics for overall clarity score (adjusted weights)
        const clarityScore = Math.min(100, (edgeDensity * 0.4) + (averageContrast * 0.3) + (averageSharpness * 0.3));
        
        // Boost score if we detect good text-like features
        let finalScore = Math.round(clarityScore);
        
        // Additional boost for high contrast text
        if (averageContrast > 30 && edgeDensity > 5) {
            finalScore = Math.min(100, finalScore + 15);
        }
        
        return finalScore;
    }

    updateClarityUI(clarityScore) {
        const statusIndicator = document.getElementById('status-indicator');
        const statusIcon = document.getElementById('status-icon');
        const statusText = document.getElementById('status-text');
        const clarityFill = document.getElementById('clarity-fill');
        const clarityText = document.getElementById('clarity-text');

        if (!statusIndicator || !clarityFill) return;

        // Update clarity meter
        clarityFill.style.width = `${clarityScore}%`;
        clarityText.textContent = `${clarityScore}%`;

        // Update status based on clarity score
        if (clarityScore < 30) {
            statusIndicator.className = 'status-indicator analyzing';
            statusIcon.className = 'fas fa-search';
            statusText.textContent = 'Analyzing...';
            clarityFill.className = 'clarity-fill analyzing';
        } else if (clarityScore < 60) {
            statusIndicator.className = 'status-indicator detected';
            statusIcon.className = 'fas fa-eye';
            statusText.textContent = 'Text detected';
            clarityFill.className = 'clarity-fill detected';
        } else if (clarityScore < this.clarityThreshold) {
            statusIndicator.className = 'status-indicator ready';
            statusIcon.className = 'fas fa-check-circle';
            statusText.textContent = 'Almost ready...';
            clarityFill.className = 'clarity-fill ready';
        } else {
            statusIndicator.className = 'status-indicator capturing';
            statusIcon.className = 'fas fa-camera';
            statusText.textContent = 'Capturing...';
            clarityFill.className = 'clarity-fill ready';
        }
    }

    performAutoCapture() {
        if (!this.isCameraActive) {
            console.log('Cannot auto-capture: camera not active');
            return;
        }

        console.log('Performing auto-capture...');
        
        // Stop auto-analysis to prevent multiple captures
        this.stopAutoCaptureAnalysis();
        
        // Show capturing status
        this.updateClarityUI(100);
        
        // Small delay to show the capturing state
        setTimeout(() => {
            this.captureFromCamera();
        }, 500);
    }

    testClarityDetection() {
        if (!this.isCameraActive) return;
        
        console.log('Running clarity detection test...');
        
        // Simulate a good clarity score for testing
        const testScore = 80;
        console.log(`Test clarity score: ${testScore}`);
        
        this.updateClarityUI(testScore);
        this.stableFrameCount = this.stableFramesRequired;
        
        setTimeout(() => {
            console.log('Test auto-capture triggered');
            this.performAutoCapture();
        }, 1000);
    }

    async processMedicineImage(imageData, fileName) {
        // Show loading state
        this.showNotification('Processing medicine image...', 'info');

        try {
            // Convert data URL to blob for API upload
            const response = await fetch(imageData);
            const blob = await response.blob();
            
            // Create FormData for API request
            const formData = new FormData();
            formData.append('image', blob, fileName);
            formData.append('platform', 'web');
            
            // Add user ID if available (for scan history)
            const userId = localStorage.getItem('userId');
            if (userId) {
                formData.append('userId', userId);
            }

            // Call backend API
            const apiResponse = await fetch(`${this.apiBaseUrl}/api/medicine/scan`, {
                method: 'POST',
                body: formData
            });

            const result = await apiResponse.json();

            if (result.success) {
                this.displayMedicineResults(result.data.imageUrl, result.data.medicine);
                this.showNotification('Medicine identified successfully!', 'success');
            } else {
                this.showNotification(result.message || 'Could not identify medicine', 'error');
            }
        } catch (error) {
            console.error('Error processing medicine image:', error);
            this.showNotification('Error processing image. Please try again.', 'error');
            
            // Fallback to local identification
            const medicineInfo = this.identifyMedicine(imageData, fileName);
            this.displayMedicineResults(imageData, medicineInfo);
        }
    }

    identifyMedicine(imageData, fileName) {
        // Simulate AI medicine identification
        // In a real app, this would use computer vision APIs
        const medicines = [
            {
                name: 'Paracetamol 500mg',
                nameHindi: 'पैरासिटामोल 500mg',
                description: 'Pain reliever and fever reducer. Used to treat mild to moderate pain and reduce fever.',
                descriptionHindi: 'दर्द निवारक और बुखार कम करने वाली दवा। हल्के से मध्यम दर्द और बुखार के इलाज के लिए उपयोगी।',
                precautions: 'Do not exceed 4 grams per day. Consult doctor if symptoms persist for more than 3 days.',
                precautionsHindi: 'प्रतिदिन 4 ग्राम से अधिक न लें। यदि लक्षण 3 दिन से अधिक बने रहें तो डॉक्टर से सलाह लें।',
                usage: 'Take 1-2 tablets every 4-6 hours as needed. Take with food to avoid stomach upset.',
                usageHindi: 'आवश्यकतानुसार हर 4-6 घंटे में 1-2 गोली लें। पेट की परेशानी से बचने के लिए भोजन के साथ लें।',
                composition: 'Acetaminophen - Analgesic and antipyretic agent',
                compositionHindi: 'एसिटामिनोफेन - दर्द निवारक और ज्वरनाशक एजेंट',
                contraindications: 'Avoid if allergic to acetaminophen. Do not exceed recommended dose. Consult doctor if pregnant or breastfeeding.',
                contraindicationsHindi: 'यदि एसिटामिनोफेन से एलर्जी है तो बचें। अनुशंसित खुराक से अधिक न लें। गर्भवती या स्तनपान कराने वाली महिलाएं डॉक्टर से सलाह लें।',
                dosageProtocol: 'Adults: 500-1000mg every 4-6 hours. Maximum 4g per day. Children: 10-15mg/kg every 4-6 hours.',
                dosageProtocolHindi: 'वयस्क: हर 4-6 घंटे में 500-1000mg। प्रतिदिन अधिकतम 4g। बच्चे: हर 4-6 घंटे में 10-15mg/kg।',
                image: imageData
            },
            {
                name: 'Aspirin 100mg',
                nameHindi: 'एस्पिरिन 100mg',
                description: 'Anti-inflammatory and pain reliever. Also used for heart protection in low doses.',
                descriptionHindi: 'सूजनरोधी और दर्द निवारक। कम खुराक में हृदय सुरक्षा के लिए भी उपयोगी।',
                precautions: 'May cause stomach irritation. Avoid if allergic to aspirin. Do not give to children under 16.',
                precautionsHindi: 'पेट में जलन हो सकती है। एस्पिरिन से एलर्जी हो तो बचें। 16 साल से कम उम्र के बच्चों को न दें।',
                usage: 'Take 1 tablet daily with food. Take at the same time each day for best results.',
                usageHindi: 'भोजन के साथ प्रतिदिन 1 गोली लें। बेहतर परिणाम के लिए हर दिन एक ही समय पर लें।',
                composition: 'Acetylsalicylic acid - NSAID with antiplatelet effects',
                compositionHindi: 'एसिटाइलसैलिसिलिक एसिड - एंटीप्लेटलेट प्रभाव के साथ NSAID',
                contraindications: 'Avoid if allergic to aspirin. Do not use in children under 16. Avoid if bleeding disorders or stomach ulcers.',
                contraindicationsHindi: 'एस्पिरिन से एलर्जी हो तो बचें। 16 साल से कम उम्र में न लें। रक्तस्राव विकार या पेट के अल्सर में बचें।',
                dosageProtocol: 'Adults: 75-100mg daily for heart protection. 300-600mg for pain relief. Maximum 4g per day.',
                dosageProtocolHindi: 'वयस्क: हृदय सुरक्षा के लिए प्रतिदिन 75-100mg। दर्द निवारण के लिए 300-600mg। प्रतिदिन अधिकतम 4g।',
                image: imageData
            },
            {
                name: 'Ibuprofen 400mg',
                nameHindi: 'आइबुप्रोफेन 400mg',
                description: 'Non-steroidal anti-inflammatory drug (NSAID) for pain, inflammation, and fever.',
                descriptionHindi: 'दर्द, सूजन और बुखार के लिए गैर-स्टेरॉयडल सूजनरोधी दवा (NSAID)।',
                precautions: 'May cause stomach problems. Take with food. Avoid if you have heart or kidney problems.',
                precautionsHindi: 'पेट की समस्याएं हो सकती हैं। भोजन के साथ लें। हृदय या गुर्दे की समस्याओं में बचें।',
                usage: 'Take 1 tablet every 6-8 hours with food. Do not exceed 6 tablets in 24 hours.',
                usageHindi: 'भोजन के साथ हर 6-8 घंटे में 1 गोली लें। 24 घंटे में 6 गोलियों से अधिक न लें।',
                composition: 'Ibuprofen - Non-steroidal anti-inflammatory drug',
                compositionHindi: 'आइबुप्रोफेन - गैर-स्टेरॉयडल सूजनरोधी दवा',
                contraindications: 'Avoid if allergic to NSAIDs. Do not use if stomach ulcers, heart problems, or kidney disease.',
                contraindicationsHindi: 'NSAIDs से एलर्जी हो तो बचें। पेट के अल्सर, हृदय समस्याओं या गुर्दे की बीमारी में न लें।',
                dosageProtocol: 'Adults: 200-400mg every 6-8 hours. Maximum 2400mg per day. Take with food.',
                dosageProtocolHindi: 'वयस्क: हर 6-8 घंटे में 200-400mg। प्रतिदिन अधिकतम 2400mg। भोजन के साथ लें।',
                image: imageData
            }
        ];

        // Return a random medicine for demo purposes
        return medicines[Math.floor(Math.random() * medicines.length)];
    }

    displayMedicineResults(imageData, medicineInfo) {
        const resultsContainer = document.getElementById('medicine-results');
        const imageElement = document.getElementById('scanned-image');
        
        // Handle both data URLs and API URLs
        if (imageData.startsWith('data:')) {
            imageElement.src = imageData;
        } else {
            imageElement.src = `${this.apiBaseUrl}${imageData}`;
        }
        
        imageElement.alt = `Scanned image of ${medicineInfo.name}`;
        
        // Update English content
        this.updateMedicineContent(medicineInfo, 'english');
        
        // Update Hindi content if available
        if (medicineInfo.nameHindi) {
            this.updateMedicineContent(medicineInfo, 'hindi');
        }

        resultsContainer.style.display = 'block';
        resultsContainer.scrollIntoView({ behavior: 'smooth' });

        // Save to recent activity
        this.saveRecentActivity('medicine', medicineInfo.name);
    }

    updateMedicineContent(medicineInfo, language) {
        const suffix = language === 'hindi' ? '-hindi' : '';
        
        // Update medicine name
        const nameElement = document.getElementById(`medicine-name${suffix}`);
        if (nameElement) {
            nameElement.textContent = language === 'hindi' ? medicineInfo.nameHindi : medicineInfo.name;
        }
        
        // Update composition
        const compositionElement = document.getElementById(`medicine-composition${suffix}`);
        if (compositionElement) {
            const composition = language === 'hindi' ? medicineInfo.compositionHindi : medicineInfo.composition;
            compositionElement.textContent = composition || 'Composition information not available';
        }
        
        // Update contraindications
        const contraindicationsElement = document.getElementById(`medicine-contraindications${suffix}`);
        if (contraindicationsElement) {
            const contraindications = language === 'hindi' ? medicineInfo.contraindicationsHindi : medicineInfo.contraindications;
            contraindicationsElement.textContent = contraindications || 'Contraindications information not available';
        }
        
        // Update dosage protocol
        const dosageElement = document.getElementById(`medicine-dosage-protocol${suffix}`);
        if (dosageElement) {
            const dosage = language === 'hindi' ? medicineInfo.dosageProtocolHindi : medicineInfo.dosageProtocol;
            dosageElement.textContent = dosage || 'Dosage protocol not available';
        }
        
        // Update precautions
        const precautionsElement = document.getElementById(`medicine-precautions${suffix}`);
        if (precautionsElement) {
            const precautions = language === 'hindi' ? medicineInfo.precautionsHindi : medicineInfo.precautions;
            precautionsElement.textContent = precautions || 'Precautions information not available';
        }
        
        // Update usage instructions
        const usageElement = document.getElementById(`medicine-usage${suffix}`);
        if (usageElement) {
            const usage = language === 'hindi' ? medicineInfo.usageHindi : medicineInfo.usage;
            usageElement.textContent = usage || 'Usage instructions not available';
        }
    }

    switchLanguage(language) {
        // Update button states
        document.querySelectorAll('.lang-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.getElementById(`lang-${language}`).classList.add('active');
        
        // Show/hide content
        document.querySelectorAll('.language-content').forEach(content => {
            content.style.display = 'none';
        });
        document.getElementById(`content-${language}`).style.display = 'block';
        
        // Save language preference
        localStorage.setItem('preferred-language', language);
        
        // Show notification
        const langName = language === 'hindi' ? 'Hindi' : 'English';
        this.showNotification(`Switched to ${langName}`, 'info');
    }

    // Doctor Management
    loadDoctors() {
        // Simulate loading from database (both online and offline)
        return [
            {
                id: 1,
                name: 'Dr. Sarah Johnson',
                specialization: 'Cardiology',
                rating: 4.9,
                reviews: 127,
                distance: '0.8 miles',
                phone: '(555) 123-4567',
                availability: 'Available today',
                photo: 'https://via.placeholder.com/150x150/4F46E5/FFFFFF?text=Dr.SJ',
                isOnline: true,
                isBestSuited: true,
                location: '123 Main St, City, State'
            },
            {
                id: 2,
                name: 'Dr. Michael Chen',
                specialization: 'General Practice',
                rating: 4.7,
                reviews: 89,
                distance: '1.2 miles',
                phone: '(555) 234-5678',
                availability: 'Available tomorrow',
                photo: 'https://via.placeholder.com/150x150/10B981/FFFFFF?text=Dr.MC',
                isOnline: false,
                isBestSuited: false,
                location: '456 Oak Ave, City, State'
            },
            {
                id: 3,
                name: 'Dr. Emily Davis',
                specialization: 'Dermatology',
                rating: 4.8,
                reviews: 156,
                distance: '2.1 miles',
                phone: '(555) 345-6789',
                availability: 'Available this week',
                photo: 'https://via.placeholder.com/150x150/F59E0B/FFFFFF?text=Dr.ED',
                isOnline: true,
                isBestSuited: false,
                location: '789 Pine St, City, State'
            },
            {
                id: 4,
                name: 'Dr. Robert Wilson',
                specialization: 'Neurology',
                rating: 4.6,
                reviews: 98,
                distance: '3.5 miles',
                phone: '(555) 456-7890',
                availability: 'Available next week',
                photo: 'https://via.placeholder.com/150x150/EF4444/FFFFFF?text=Dr.RW',
                isOnline: false,
                isBestSuited: false,
                location: '321 Elm St, City, State'
            },
            {
                id: 5,
                name: 'Dr. Lisa Anderson',
                specialization: 'Pediatrics',
                rating: 4.9,
                reviews: 203,
                distance: '1.8 miles',
                phone: '(555) 567-8901',
                availability: 'Available today',
                photo: 'https://via.placeholder.com/150x150/8B5CF6/FFFFFF?text=Dr.LA',
                isOnline: true,
                isBestSuited: false,
                location: '654 Maple Dr, City, State'
            },
            {
                id: 6,
                name: 'Dr. James Brown',
                specialization: 'Orthopedics',
                rating: 4.5,
                reviews: 76,
                distance: '4.2 miles',
                phone: '(555) 678-9012',
                availability: 'Available tomorrow',
                photo: 'https://via.placeholder.com/150x150/06B6D4/FFFFFF?text=Dr.JB',
                isOnline: false,
                isBestSuited: false,
                location: '987 Cedar Ln, City, State'
            }
        ];
    }

    loadMedicineDatabase() {
        // Simulate offline medicine database with Hindi translations
        return {
            'paracetamol': {
                name: 'Paracetamol 500mg',
                nameHindi: 'पैरासिटामोल 500mg',
                description: 'Pain reliever and fever reducer',
                descriptionHindi: 'दर्द निवारक और बुखार कम करने वाली दवा',
                precautions: 'Do not exceed 4 grams per day',
                precautionsHindi: 'प्रतिदिन 4 ग्राम से अधिक न लें',
                usage: 'Take 1-2 tablets every 4-6 hours',
                usageHindi: 'हर 4-6 घंटे में 1-2 गोली लें',
                composition: 'Acetaminophen - Analgesic and antipyretic',
                compositionHindi: 'एसिटामिनोफेन - दर्द निवारक और ज्वरनाशक',
                contraindications: 'Avoid if allergic to acetaminophen. Do not exceed recommended dose.',
                contraindicationsHindi: 'यदि एसिटामिनोफेन से एलर्जी है तो बचें। अनुशंसित खुराक से अधिक न लें।',
                dosageProtocol: 'Adults: 500-1000mg every 4-6 hours. Maximum 4g per day.',
                dosageProtocolHindi: 'वयस्क: हर 4-6 घंटे में 500-1000mg। प्रतिदिन अधिकतम 4g।'
            },
            'aspirin': {
                name: 'Aspirin 100mg',
                nameHindi: 'एस्पिरिन 100mg',
                description: 'Anti-inflammatory and pain reliever. Also used for heart protection in low doses.',
                descriptionHindi: 'सूजनरोधी और दर्द निवारक। कम खुराक में हृदय सुरक्षा के लिए भी उपयोगी।',
                precautions: 'May cause stomach irritation. Avoid if allergic to aspirin. Do not give to children under 16.',
                precautionsHindi: 'पेट में जलन हो सकती है। एस्पिरिन से एलर्जी हो तो बचें। 16 साल से कम उम्र के बच्चों को न दें।',
                usage: 'Take 1 tablet daily with food',
                usageHindi: 'भोजन के साथ प्रतिदिन 1 गोली लें',
                composition: 'Acetylsalicylic acid - NSAID with antiplatelet effects',
                compositionHindi: 'एसिटाइलसैलिसिलिक एसिड - एंटीप्लेटलेट प्रभाव के साथ NSAID',
                contraindications: 'Avoid if allergic to aspirin. Do not use in children under 16. Avoid if bleeding disorders.',
                contraindicationsHindi: 'एस्पिरिन से एलर्जी हो तो बचें। 16 साल से कम उम्र में न लें। रक्तस्राव विकार में बचें।',
                dosageProtocol: 'Adults: 75-100mg daily for heart protection. 300-600mg for pain relief.',
                dosageProtocolHindi: 'वयस्क: हृदय सुरक्षा के लिए प्रतिदिन 75-100mg। दर्द निवारण के लिए 300-600mg।'
            },
            'ibuprofen': {
                name: 'Ibuprofen 400mg',
                nameHindi: 'आइबुप्रोफेन 400mg',
                description: 'NSAID for pain and inflammation',
                descriptionHindi: 'दर्द और सूजन के लिए NSAID',
                precautions: 'Take with food to avoid stomach problems',
                precautionsHindi: 'पेट की समस्याओं से बचने के लिए भोजन के साथ लें',
                usage: 'Take 1 tablet every 6-8 hours',
                usageHindi: 'हर 6-8 घंटे में 1 गोली लें',
                composition: 'Ibuprofen - Non-steroidal anti-inflammatory drug',
                compositionHindi: 'आइबुप्रोफेन - गैर-स्टेरॉयडल सूजनरोधी दवा',
                contraindications: 'Avoid if allergic to NSAIDs. Do not use if stomach ulcers or heart problems.',
                contraindicationsHindi: 'NSAIDs से एलर्जी हो तो बचें। पेट के अल्सर या हृदय समस्याओं में न लें।',
                dosageProtocol: 'Adults: 200-400mg every 6-8 hours. Maximum 2400mg per day.',
                dosageProtocolHindi: 'वयस्क: हर 6-8 घंटे में 200-400mg। प्रतिदिन अधिकतम 2400mg।'
            }
        };
    }

    renderDoctors() {
        const container = document.getElementById('doctors-container');
        const filteredDoctors = this.getFilteredDoctors();
        
        if (filteredDoctors.length === 0) {
            container.innerHTML = `
                <div class="no-results">
                    <i class="fas fa-search" aria-hidden="true"></i>
                    <h3>No doctors found</h3>
                    <p>Try adjusting your search criteria or filters</p>
                </div>
            `;
            return;
        }

        const html = filteredDoctors.map(doctor => this.createDoctorCard(doctor)).join('');
        container.innerHTML = html;

        // Add click handlers to doctor cards
        container.querySelectorAll('.doctor-card').forEach(card => {
            card.addEventListener('click', () => {
                const doctorId = parseInt(card.dataset.doctorId);
                this.showDoctorProfile(doctorId);
            });
        });
    }

    createDoctorCard(doctor) {
        const stars = this.generateStars(doctor.rating);
        const bestSuitedClass = doctor.isBestSuited ? 'best-suited' : '';
        
        return `
            <div class="doctor-card ${bestSuitedClass}" data-doctor-id="${doctor.id}" tabindex="0" role="button" aria-label="View profile of ${doctor.name}">
                <div class="doctor-photo">
                    <img src="${doctor.photo}" alt="Photo of ${doctor.name}">
                </div>
                <div class="doctor-info">
                    <h3 class="doctor-name">${doctor.name}</h3>
                    <p class="doctor-specialization">${doctor.specialization}</p>
                    <div class="doctor-rating">
                        <div class="stars">${stars}</div>
                        <span class="rating-text">${doctor.rating} (${doctor.reviews} reviews)</span>
                    </div>
                    <div class="doctor-details">
                        <div class="detail-item">
                            <i class="fas fa-map-marker-alt" aria-hidden="true"></i>
                            <span>${doctor.distance} away</span>
                        </div>
                        <div class="detail-item">
                            <i class="fas fa-clock" aria-hidden="true"></i>
                            <span>${doctor.availability}</span>
                        </div>
                        <div class="detail-item">
                            <i class="fas fa-phone" aria-hidden="true"></i>
                            <span>${doctor.phone}</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    generateStars(rating) {
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 !== 0;
        let stars = '';

        for (let i = 0; i < fullStars; i++) {
            stars += '<i class="fas fa-star" aria-hidden="true"></i>';
        }

        if (hasHalfStar) {
            stars += '<i class="fas fa-star-half-alt" aria-hidden="true"></i>';
        }

        const emptyStars = 5 - Math.ceil(rating);
        for (let i = 0; i < emptyStars; i++) {
            stars += '<i class="far fa-star" aria-hidden="true"></i>';
        }

        return stars;
    }

    getFilteredDoctors() {
        let doctors = [...this.doctors];
        
        // Apply search filter
        const searchTerm = document.getElementById('doctor-search').value.toLowerCase();
        if (searchTerm) {
            doctors = doctors.filter(doctor => 
                doctor.name.toLowerCase().includes(searchTerm) ||
                doctor.specialization.toLowerCase().includes(searchTerm)
            );
        }

        // Apply specialization filter
        const specialization = document.getElementById('specialization-filter').value;
        if (specialization) {
            doctors = doctors.filter(doctor => 
                doctor.specialization.toLowerCase() === specialization.toLowerCase()
            );
        }

        // Apply distance filter
        const maxDistance = document.getElementById('distance-filter').value;
        if (maxDistance) {
            doctors = doctors.filter(doctor => {
                const distance = parseFloat(doctor.distance);
                return distance <= parseFloat(maxDistance);
            });
        }

        // Apply rating filter
        const minRating = document.getElementById('rating-filter').value;
        if (minRating) {
            doctors = doctors.filter(doctor => doctor.rating >= parseFloat(minRating));
        }

        return doctors;
    }

    async searchDoctors(query) {
        try {
            if (query && query.length >= 2) {
                const response = await fetch(`${this.apiBaseUrl}/api/doctors/search?q=${encodeURIComponent(query)}&limit=20`);
                const result = await response.json();
                
                if (result.success) {
                    this.doctors = result.data.doctors;
                    this.renderDoctors();
                } else {
                    console.error('Search error:', result.message);
                    this.renderDoctors(); // Fallback to local data
                }
            } else {
                this.renderDoctors();
            }
        } catch (error) {
            console.error('Error searching doctors:', error);
            this.renderDoctors(); // Fallback to local data
        }
    }

    filterDoctors() {
        this.renderDoctors();
    }

    toggleView(viewType) {
        const container = document.getElementById('doctors-container');
        const buttons = document.querySelectorAll('.view-btn');
        
        buttons.forEach(btn => btn.classList.remove('active'));
        document.querySelector(`[data-view="${viewType}"]`).classList.add('active');
        
        container.className = `doctors-container ${viewType}-view`;
    }

    showDoctorProfile(doctorId) {
        const doctor = this.doctors.find(d => d.id === doctorId);
        if (!doctor) return;

        const modal = document.getElementById('doctor-modal');
        const photo = document.getElementById('modal-doctor-photo');
        const name = document.getElementById('modal-doctor-name');
        const specialization = document.getElementById('modal-doctor-specialization');
        const stars = document.getElementById('modal-doctor-stars');
        const ratingText = document.getElementById('modal-doctor-rating-text');
        const location = document.getElementById('modal-doctor-location');
        const phone = document.getElementById('modal-doctor-phone');
        const availability = document.getElementById('modal-doctor-availability');
        const bestSuitedBadge = document.getElementById('best-suited-badge');

        photo.src = doctor.photo;
        photo.alt = `Photo of ${doctor.name}`;
        name.textContent = doctor.name;
        specialization.textContent = doctor.specialization;
        stars.innerHTML = this.generateStars(doctor.rating);
        ratingText.textContent = `${doctor.rating} (${doctor.reviews} reviews)`;
        location.textContent = doctor.location;
        phone.textContent = doctor.phone;
        availability.textContent = doctor.availability;

        if (doctor.isBestSuited) {
            bestSuitedBadge.style.display = 'inline-flex';
        } else {
            bestSuitedBadge.style.display = 'none';
        }

        modal.classList.add('active');
        modal.setAttribute('aria-hidden', 'false');
        
        // Focus management
        modal.querySelector('.close-btn').focus();
    }

    closeModal() {
        const modal = document.getElementById('doctor-modal');
        modal.classList.remove('active');
        modal.setAttribute('aria-hidden', 'true');
    }

    contactDoctor() {
        this.showNotification('Opening phone dialer...', 'info');
        // In a real app, this would open the phone dialer
    }

    bookAppointment() {
        this.showNotification('Opening appointment booking...', 'info');
        // In a real app, this would open appointment booking
    }

    // Voice Assistant
    openVoiceModal() {
        const modal = document.getElementById('voice-modal');
        modal.classList.add('active');
        modal.setAttribute('aria-hidden', 'false');
    }

    closeVoiceModal() {
        const modal = document.getElementById('voice-modal');
        modal.classList.remove('active');
        modal.setAttribute('aria-hidden', 'true');
        
        if (this.isListening) {
            this.voiceRecognition.stop();
        }
    }

    toggleVoiceRecognition() {
        if (!this.voiceRecognition) {
            this.showNotification('Voice recognition not supported in your browser', 'error');
            return;
        }

        if (this.isListening) {
            this.voiceRecognition.stop();
        } else {
            this.voiceRecognition.start();
            this.isListening = true;
            this.updateVoiceButton();
            this.showNotification('Listening... Speak your command', 'info');
        }
    }

    updateVoiceButton() {
        const button = document.getElementById('voice-btn');
        const status = document.getElementById('voice-status');
        
        if (this.isListening) {
            button.classList.add('listening');
            status.textContent = 'Listening... Speak your command';
        } else {
            button.classList.remove('listening');
            status.textContent = 'Click the microphone to start speaking';
        }
    }

    processVoiceCommand(command) {
        this.showNotification(`Command received: ${command}`, 'info');
        
        if (command.includes('scan medicine') || command.includes('medicine')) {
            this.showPage('scan-medicine');
        } else if (command.includes('find doctors') || command.includes('doctors')) {
            this.showPage('find-doctors');
        } else if (command.includes('go home') || command.includes('home')) {
            this.showPage('home');
        } else if (command.includes('help')) {
            this.showNotification('Available commands: scan medicine, find doctors, go home, help', 'info');
        } else {
            this.showNotification('Command not recognized. Try: scan medicine, find doctors, go home', 'error');
        }
        
        this.closeVoiceModal();
    }

    // Accessibility Features
    handleKeyboardNavigation(e) {
        // ESC key closes modals
        if (e.key === 'Escape') {
            this.closeModal();
            this.closeVoiceModal();
        }
        
        // Enter key activates focused elements
        if (e.key === 'Enter' && e.target.classList.contains('doctor-card')) {
            e.target.click();
        }
    }

    handleFocusManagement(e) {
        // Ensure focus is visible
        if (e.target.matches('button, input, select, textarea, [tabindex]')) {
            e.target.style.outline = '3px solid var(--light-blue)';
        }
    }

    // Utility Functions
    saveRecentActivity(type, name) {
        const activities = JSON.parse(localStorage.getItem('recent-activities') || '[]');
        activities.unshift({
            type,
            name,
            timestamp: new Date().toISOString()
        });
        
        // Keep only last 10 activities
        activities.splice(10);
        localStorage.setItem('recent-activities', JSON.stringify(activities));
        
        this.updateRecentActivity();
    }

    updateRecentActivity() {
        const activities = JSON.parse(localStorage.getItem('recent-activities') || '[]');
        const container = document.querySelector('.activity-list');
        
        if (activities.length === 0) {
            container.innerHTML = `
                <div class="no-activity">
                    <p>No recent activity</p>
                </div>
            `;
            return;
        }

        const html = activities.slice(0, 2).map(activity => {
            const icon = activity.type === 'medicine' ? 'fas fa-pills' : 'fas fa-user-md';
            const timeAgo = this.getTimeAgo(activity.timestamp);
            
            return `
                <div class="activity-item">
                    <div class="activity-icon">
                        <i class="${icon}" aria-hidden="true"></i>
                    </div>
                    <div class="activity-content">
                        <h4>${activity.type === 'medicine' ? 'Medicine Scanned' : 'Doctor Found'}</h4>
                        <p>${activity.name} - ${timeAgo}</p>
                    </div>
                </div>
            `;
        }).join('');
        
        container.innerHTML = html;
    }

    getTimeAgo(timestamp) {
        const now = new Date();
        const time = new Date(timestamp);
        const diffInHours = Math.floor((now - time) / (1000 * 60 * 60));
        
        if (diffInHours < 1) return 'Just now';
        if (diffInHours < 24) return `${diffInHours} hours ago`;
        
        const diffInDays = Math.floor(diffInHours / 24);
        if (diffInDays < 7) return `${diffInDays} days ago`;
        
        return time.toLocaleDateString();
    }

    loadUserPreferences() {
        // Load user preferences from localStorage
        const preferences = JSON.parse(localStorage.getItem('user-preferences') || '{}');
        
        // Apply font size preference
        if (preferences.fontSize) {
            document.documentElement.style.setProperty('--font-size-base', preferences.fontSize);
        }
        
        // Apply high contrast preference
        if (preferences.highContrast) {
            document.body.classList.add('high-contrast');
        }

        // Load theme preference
        if (preferences.theme) {
            this.currentTheme = preferences.theme;
        }
    }

    initializeTheme() {
        // Set initial theme
        this.applyTheme(this.currentTheme);
        this.updateThemeIcon();
    }

    toggleTheme() {
        this.currentTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        this.applyTheme(this.currentTheme);
        this.updateThemeIcon();
        this.saveThemePreference();
        
        // Show notification
        const themeName = this.currentTheme === 'light' ? 'Light' : 'Dark';
        this.showNotification(`Switched to ${themeName} theme`, 'info');
    }

    applyTheme(theme) {
        const html = document.documentElement;
        
        if (theme === 'dark') {
            html.setAttribute('data-theme', 'dark');
        } else {
            html.removeAttribute('data-theme');
        }
        
        this.currentTheme = theme;
    }

    updateThemeIcon() {
        const themeIcon = document.getElementById('theme-icon');
        if (themeIcon) {
            if (this.currentTheme === 'light') {
                themeIcon.className = 'fas fa-sun';
            } else {
                themeIcon.className = 'fas fa-moon';
            }
        }
    }

    saveThemePreference() {
        const preferences = JSON.parse(localStorage.getItem('user-preferences') || '{}');
        preferences.theme = this.currentTheme;
        localStorage.setItem('user-preferences', JSON.stringify(preferences));
    }

    initializeLanguage() {
        const savedLanguage = localStorage.getItem('preferred-language') || 'english';
        this.switchLanguage(savedLanguage);
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.setAttribute('role', 'alert');
        notification.setAttribute('aria-live', 'polite');
        
        const icons = {
            success: 'check-circle',
            error: 'exclamation-circle',
            info: 'info-circle',
            warning: 'exclamation-triangle'
        };
        
        notification.innerHTML = `
            <i class="fas fa-${icons[type]}" aria-hidden="true"></i>
            <span>${message}</span>
        `;

        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${this.getNotificationColor(type)};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 12px;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
            z-index: 10000;
            display: flex;
            align-items: center;
            gap: 0.75rem;
            font-weight: 500;
            font-size: 1.125rem;
            animation: slideInRight 0.3s ease;
            max-width: 400px;
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => {
                if (document.body.contains(notification)) {
                    document.body.removeChild(notification);
                }
            }, 300);
        }, 4000);
    }

    getNotificationColor(type) {
        const colors = {
            success: '#059669',
            error: '#dc2626',
            info: '#2563eb',
            warning: '#d97706'
        };
        return colors[type] || colors.info;
    }
}

// Global functions for HTML onclick handlers
function showPage(pageName) {
    healthcareHelper.showPage(pageName);
}

function closeModal() {
    healthcareHelper.closeModal();
}

function closeVoiceModal() {
    healthcareHelper.closeVoiceModal();
}

function toggleVoiceRecognition() {
    healthcareHelper.toggleVoiceRecognition();
}

function contactDoctor() {
    healthcareHelper.contactDoctor();
}

function bookAppointment() {
    healthcareHelper.bookAppointment();
}

// Initialize the application
let healthcareHelper;
document.addEventListener('DOMContentLoaded', () => {
    healthcareHelper = new HealthCareHelper();
});

// Add CSS animations for notifications
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOutRight {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
    
    .no-results {
        text-align: center;
        padding: 3rem;
        color: var(--gray-500);
    }
    
    .no-results i {
        font-size: 3rem;
        margin-bottom: 1rem;
        color: var(--gray-300);
    }
    
    .no-results h3 {
        font-size: 1.5rem;
        margin-bottom: 0.5rem;
        color: var(--gray-600);
    }
    
    .no-activity {
        text-align: center;
        padding: 2rem;
        color: var(--gray-500);
    }
    
    .sr-only {
        position: absolute;
        width: 1px;
        height: 1px;
        padding: 0;
        margin: -1px;
        overflow: hidden;
        clip: rect(0, 0, 0, 0);
        white-space: nowrap;
        border: 0;
    }
`;
document.head.appendChild(style);

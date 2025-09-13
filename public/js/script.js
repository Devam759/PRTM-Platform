// HealthCare Helper - Elderly-Friendly Healthcare App
class HealthCareHelper {
    constructor() {
        this.currentPage = 'home';
        this.doctors = this.loadDoctors();
        this.medicineDatabase = this.loadMedicineDatabase();
        this.voiceRecognition = null;
        this.isListening = false;
        this.apiBaseUrl = 'http://localhost:3000'; // Backend API URL
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupVoiceRecognition();
        this.loadUserPreferences();
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

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            this.handleKeyboardNavigation(e);
        });

        // Focus management for accessibility
        document.addEventListener('focusin', (e) => {
            this.handleFocusManagement(e);
        });
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
                description: 'Pain reliever and fever reducer. Used to treat mild to moderate pain and reduce fever.',
                precautions: 'Do not exceed 4 grams per day. Consult doctor if symptoms persist for more than 3 days.',
                usage: 'Take 1-2 tablets every 4-6 hours as needed. Take with food to avoid stomach upset.',
                image: imageData
            },
            {
                name: 'Aspirin 100mg',
                description: 'Anti-inflammatory and pain reliever. Also used for heart protection in low doses.',
                precautions: 'May cause stomach irritation. Avoid if allergic to aspirin. Do not give to children under 16.',
                usage: 'Take 1 tablet daily with food. Take at the same time each day for best results.',
                image: imageData
            },
            {
                name: 'Ibuprofen 400mg',
                description: 'Non-steroidal anti-inflammatory drug (NSAID) for pain, inflammation, and fever.',
                precautions: 'May cause stomach problems. Take with food. Avoid if you have heart or kidney problems.',
                usage: 'Take 1 tablet every 6-8 hours with food. Do not exceed 6 tablets in 24 hours.',
                image: imageData
            }
        ];

        // Return a random medicine for demo purposes
        return medicines[Math.floor(Math.random() * medicines.length)];
    }

    displayMedicineResults(imageData, medicineInfo) {
        const resultsContainer = document.getElementById('medicine-results');
        const imageElement = document.getElementById('scanned-image');
        const nameElement = document.getElementById('medicine-name');
        const descriptionElement = document.getElementById('medicine-description');
        const precautionsElement = document.getElementById('medicine-precautions');
        const usageElement = document.getElementById('medicine-usage');

        // Handle both data URLs and API URLs
        if (imageData.startsWith('data:')) {
            imageElement.src = imageData;
        } else {
            imageElement.src = `${this.apiBaseUrl}${imageData}`;
        }
        
        imageElement.alt = `Scanned image of ${medicineInfo.name}`;
        nameElement.textContent = medicineInfo.name;
        
        // Handle different data structures from API vs local
        if (typeof medicineInfo.description === 'string') {
            descriptionElement.textContent = medicineInfo.description;
        } else if (Array.isArray(medicineInfo.uses)) {
            descriptionElement.textContent = medicineInfo.uses.join(', ');
        }
        
        if (typeof medicineInfo.precautions === 'string') {
            precautionsElement.textContent = medicineInfo.precautions;
        } else if (Array.isArray(medicineInfo.precautions)) {
            precautionsElement.textContent = medicineInfo.precautions.join(', ');
        }
        
        if (medicineInfo.dosageInstructions) {
            usageElement.textContent = medicineInfo.dosageInstructions;
        } else if (medicineInfo.usage) {
            usageElement.textContent = medicineInfo.usage;
        }

        resultsContainer.style.display = 'block';
        resultsContainer.scrollIntoView({ behavior: 'smooth' });

        // Save to recent activity
        this.saveRecentActivity('medicine', medicineInfo.name);
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
        // Simulate offline medicine database
        return {
            'paracetamol': {
                name: 'Paracetamol 500mg',
                description: 'Pain reliever and fever reducer',
                precautions: 'Do not exceed 4 grams per day',
                usage: 'Take 1-2 tablets every 4-6 hours'
            },
            'aspirin': {
                name: 'Aspirin 100mg',
                description: 'Anti-inflammatory and pain reliever',
                precautions: 'May cause stomach irritation',
                usage: 'Take 1 tablet daily with food'
            },
            'ibuprofen': {
                name: 'Ibuprofen 400mg',
                description: 'NSAID for pain and inflammation',
                precautions: 'Take with food to avoid stomach problems',
                usage: 'Take 1 tablet every 6-8 hours'
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

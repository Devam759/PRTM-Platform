# HealthCare Helper - Elderly-Friendly Healthcare App

A comprehensive healthcare application designed specifically for elderly users, featuring medicine scanning and doctor finder functionality with MongoDB database integration.

## 🏥 Features

### Core Functionality
- **Medicine Scanner**: Upload/take photos of medicine bottles/strips for AI-powered identification
- **Doctor Finder**: Search and filter nearby doctors by specialization, rating, and distance
- **Voice Assistant**: Hands-free navigation using voice commands
- **Offline Support**: Local database for medicines and doctors when internet is unavailable

### Elderly-Friendly Design
- **Large Text**: 18px base font size for better readability
- **High Contrast**: White background with soft blue/green highlights
- **Simple Navigation**: Only 3 main sections (Home, Scan Medicine, Find Doctors)
- **Touch-Friendly**: Large buttons and clear visual feedback
- **Accessibility**: Full ARIA support, keyboard navigation, screen reader compatible

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or cloud)
- Modern web browser

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd healthcare-helper
   ```

2. **Install backend dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env
   # Edit .env with your configuration
   ```

4. **Start MongoDB**
   ```bash
   # Local MongoDB
   mongod
   
   # Or use MongoDB Atlas (cloud)
   # Update MONGODB_URI in .env
   ```

5. **Start the backend server**
   ```bash
   npm run dev
   ```

6. **Open the frontend**
   - Open `index.html` in your web browser
   - Or serve it using a local server:
   ```bash
   # Using Python
   python -m http.server 8000
   
   # Using Node.js
   npx serve .
   ```

## 📁 Project Structure

```
healthcare-helper/
├── index.html              # Frontend HTML
├── style.css               # Frontend CSS
├── script.js               # Frontend JavaScript
├── package.json            # Backend dependencies
├── server.js               # Backend server
├── models/                 # MongoDB models
│   ├── Medicine.js         # Medicine schema
│   ├── Doctor.js           # Doctor schema
│   └── ScanHistory.js      # Scan history schema
├── routes/                 # API routes
│   ├── medicine.js         # Medicine endpoints
│   └── doctor.js           # Doctor endpoints
├── middleware/             # Middleware functions
│   └── validation.js       # Input validation
├── uploads/                # Uploaded images
└── env.example             # Environment variables template
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file based on `env.example`:

```env
# Server
PORT=3000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/healthcare-helper

# Frontend
FRONTEND_URL=http://localhost:3000

# Optional: External APIs
GOOGLE_VISION_API_KEY=your-api-key
```

### MongoDB Setup

#### Local MongoDB
1. Install MongoDB Community Edition
2. Start MongoDB service: `mongod`
3. The app will create the database automatically

#### MongoDB Atlas (Cloud)
1. Create a free account at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a new cluster
3. Get your connection string
4. Update `MONGODB_URI` in `.env`

## 📱 API Endpoints

### Medicine Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/medicine/scan` | Scan medicine image |
| POST | `/api/medicine/barcode` | Scan medicine by barcode |
| GET | `/api/medicine/search` | Search medicines |
| GET | `/api/medicine/:id` | Get medicine by ID |
| POST | `/api/medicine` | Create medicine (Admin) |
| PUT | `/api/medicine/:id` | Update medicine (Admin) |
| DELETE | `/api/medicine/:id` | Delete medicine (Admin) |

### Doctor Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/doctors/search` | Search doctors |
| GET | `/api/doctors/nearby` | Find nearby doctors |
| GET | `/api/doctors/:id` | Get doctor by ID |
| POST | `/api/doctors/:id/review` | Add doctor review |
| POST | `/api/doctors` | Create doctor (Admin) |
| PUT | `/api/doctors/:id` | Update doctor (Admin) |
| DELETE | `/api/doctors/:id` | Delete doctor (Admin) |

## 🗄️ Database Schema

### Medicine Schema
```javascript
{
  name: String,              // Medicine name
  genericName: String,       // Generic name
  brandName: String,         // Brand name
  dosage: String,            // Dosage information
  form: String,              // tablet, capsule, syrup, etc.
  description: String,       // Medicine description
  uses: [String],            // Array of uses
  precautions: [String],     // Array of precautions
  dosageInstructions: String, // How to take
  warnings: [String],        // Array of warnings
  category: String,          // Medicine category
  prescriptionRequired: Boolean,
  barcode: String,           // Barcode for scanning
  images: [Object],          // Medicine images
  isActive: Boolean
}
```

### Doctor Schema
```javascript
{
  name: String,              // Doctor name
  email: String,             // Contact email
  phone: String,             // Contact phone
  specialization: String,    // Medical specialization
  licenseNumber: String,     // Medical license
  experience: Number,        // Years of experience
  address: Object,           // Clinic address
  consultationFee: Number,   // Consultation fee
  rating: Object,            // Average rating and count
  reviews: [Object],         // Patient reviews
  availability: Object,      // Weekly schedule
  isOnline: Boolean,         // Online status
  isVerified: Boolean,       // Verification status
  isActive: Boolean
}
```

## 🔍 Medicine Scanning

### Image Upload
- Supports JPG, PNG, GIF formats
- Maximum file size: 10MB
- Automatic image optimization
- AI-powered medicine identification

### Barcode Scanning
- Supports common barcode formats
- Direct database lookup
- 100% accuracy for registered medicines

### Search Functionality
- Text-based search across medicine names
- Category filtering
- Prescription requirement filtering
- Fuzzy matching for typos

## 👨‍⚕️ Doctor Finder

### Search Options
- Name and specialization search
- Location-based filtering
- Rating and experience filters
- Availability status

### Features
- "Best Suited for You" recommendations
- Detailed doctor profiles
- Patient reviews and ratings
- Contact information
- Appointment booking (ready for integration)

## 🎤 Voice Assistant

### Supported Commands
- "Scan medicine" - Navigate to medicine scanner
- "Find doctors" - Navigate to doctor finder
- "Go home" - Return to home page
- "Help" - Show available commands

### Browser Support
- Chrome/Edge: Full support
- Firefox: Limited support
- Safari: Limited support

## ♿ Accessibility Features

### Screen Reader Support
- Complete ARIA labels
- Semantic HTML structure
- Live regions for dynamic content
- Focus management

### Keyboard Navigation
- Full keyboard accessibility
- Logical tab order
- ESC key for modal closing
- Enter key for activation

### Visual Accessibility
- High contrast mode support
- Large, readable fonts
- Clear visual hierarchy
- Color-blind friendly palette

## 🚀 Deployment

### Backend Deployment

#### Heroku
```bash
# Install Heroku CLI
npm install -g heroku

# Login and create app
heroku login
heroku create your-app-name

# Set environment variables
heroku config:set MONGODB_URI=your-mongodb-uri
heroku config:set NODE_ENV=production

# Deploy
git push heroku main
```

#### Vercel
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod
```

### Frontend Deployment

#### Netlify
1. Connect your GitHub repository
2. Set build command: (none needed)
3. Set publish directory: `/`
4. Deploy

#### GitHub Pages
1. Push to GitHub repository
2. Go to Settings > Pages
3. Select source branch
4. Deploy

## 🔧 Development

### Adding New Features

1. **Backend**: Add routes in `routes/` directory
2. **Frontend**: Update `script.js` with new functionality
3. **Database**: Update models in `models/` directory
4. **Styling**: Update `style.css` for new UI elements

### Testing

```bash
# Run backend tests (when implemented)
npm test

# Test API endpoints
curl http://localhost:3000/api/health
```

### Debugging

- Backend logs: Check console output
- Frontend logs: Open browser developer tools
- Database: Use MongoDB Compass for GUI access

## 📊 Performance Optimization

### Backend
- Image compression with Sharp
- Database indexing
- Rate limiting
- Caching strategies

### Frontend
- Lazy loading images
- Local storage for preferences
- Optimized CSS and JavaScript
- Progressive Web App features

## 🔒 Security

### Implemented Security
- Helmet.js for security headers
- Rate limiting
- Input validation with Joi
- File upload restrictions
- CORS configuration

### Additional Recommendations
- JWT authentication for user sessions
- HTTPS in production
- Regular security updates
- Database access controls

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

### Common Issues

**Medicine not identified**
- Ensure good lighting
- Keep medicine label clearly visible
- Try different angles
- Check if medicine is in database

**Doctor search not working**
- Check internet connection
- Verify search terms
- Try different filters
- Use offline mode

**Voice assistant not responding**
- Check microphone permissions
- Use supported browsers
- Speak clearly and slowly
- Try different commands

### Getting Help

- Check the documentation
- Search existing issues
- Create a new issue with details
- Contact support team

## 🔮 Future Enhancements

- [ ] User authentication and profiles
- [ ] Appointment booking system
- [ ] Prescription management
- [ ] Health reminders
- [ ] Multi-language support
- [ ] Advanced AI recognition
- [ ] Mobile app development
- [ ] Integration with health devices
- [ ] Telemedicine features
- [ ] Insurance integration

---

**HealthCare Helper** - Making healthcare accessible for everyone, especially our elderly community. 💙

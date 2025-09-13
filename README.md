# HealthCare Helper Platform

A comprehensive healthcare platform designed to assist elderly users with medicine identification and doctor finding. Built with Express.js, MongoDB, and modern web technologies.

## 🚀 Features

### Medicine Management
- **AI-Powered Medicine Scanning**: Upload medicine images for intelligent identification
- **Barcode Scanning**: Quick medicine lookup using barcode scanning
- **Comprehensive Medicine Database**: Detailed information about medicines including uses, precautions, and interactions
- **Search & Filter**: Advanced search capabilities with category and prescription filters

### Doctor Finder
- **Location-Based Search**: Find doctors near your location
- **Specialization Filtering**: Search by medical specialization
- **Rating & Reviews**: View doctor ratings and patient reviews
- **Availability Check**: See doctor availability and consultation fees

### User Experience
- **Elderly-Friendly Design**: Large fonts, clear navigation, and intuitive interface
- **Voice Assistant**: Voice commands for hands-free navigation
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Accessibility**: WCAG compliant with screen reader support

## 🏗️ Architecture

### Backend Structure
```
src/
├── app.js                 # Main application setup
├── config/               # Configuration files
│   ├── database.js       # Database connection
│   └── index.js          # App configuration
├── controllers/          # Business logic controllers
│   ├── medicineController.js
│   └── doctorController.js
├── middleware/           # Custom middleware
│   ├── errorHandler.js   # Error handling
│   ├── logger.js         # Request logging
│   └── validation.js     # Input validation
├── models/              # Database models
│   ├── Doctor.js
│   ├── Medicine.js
│   └── ScanHistory.js
├── routes/              # API routes
│   ├── doctor.js
│   └── medicine.js
├── services/            # Business services
│   ├── imageService.js
│   └── medicineService.js
├── utils/               # Utility functions
│   ├── helpers.js
│   └── response.js
└── scripts/             # Database scripts
    └── seed-database.js
```

### Frontend Structure
```
public/
├── index.html           # Main application page
├── css/
│   └── style.css        # Application styles
├── js/
│   └── script.js        # Client-side JavaScript
├── images/              # Static images
└── uploads/             # User uploaded files
```

## 🛠️ Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **Multer** - File upload handling
- **Sharp** - Image processing
- **Joi** - Data validation
- **Helmet** - Security middleware
- **CORS** - Cross-origin resource sharing

### Frontend
- **HTML5** - Semantic markup
- **CSS3** - Modern styling with CSS Grid and Flexbox
- **Vanilla JavaScript** - No framework dependencies
- **Font Awesome** - Icons
- **Google Fonts** - Typography

## 📦 Installation

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or Atlas)
- npm or yarn

### Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/healthcare-helper-platform.git
   cd healthcare-helper-platform
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment configuration**
   ```bash
   cp env.example .env
   # Edit .env with your configuration
   ```

4. **Database setup**
   ```bash
   # Start MongoDB (if running locally)
   mongod
   
   # Seed the database with sample data
   npm run seed
   ```

5. **Start the application**
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm start
   ```

6. **Access the application**
   - Open your browser to `http://localhost:3000`
   - API health check: `http://localhost:3000/api/health`

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `development` |
| `PORT` | Server port | `3000` |
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/healthcare-helper` |
| `FRONTEND_URL` | Frontend URL for CORS | `http://localhost:3000` |
| `JWT_SECRET` | JWT secret key | `your-super-secret-jwt-key` |
| `MAX_FILE_SIZE` | Maximum file upload size | `10485760` (10MB) |

### Database Models

#### Medicine
- Basic information (name, dosage, form)
- Medical details (uses, precautions, side effects)
- Images and barcode support
- Category and prescription requirements

#### Doctor
- Personal information and credentials
- Specialization and experience
- Location and availability
- Ratings and reviews
- Contact information

#### ScanHistory
- User scan records
- Medicine identification results
- Confidence scores and metadata

## 📚 API Documentation

### Medicine Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| POST | `/api/medicine/scan` | Scan medicine image | Public |
| POST | `/api/medicine/barcode` | Scan by barcode | Public |
| GET | `/api/medicine/search` | Search medicines | Public |
| GET | `/api/medicine/:id` | Get medicine details | Public |
| GET | `/api/medicine/categories/list` | Get categories | Public |
| POST | `/api/medicine` | Create medicine | Admin |
| PUT | `/api/medicine/:id` | Update medicine | Admin |
| DELETE | `/api/medicine/:id` | Delete medicine | Admin |

### Doctor Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| GET | `/api/doctors/search` | Search doctors | Public |
| GET | `/api/doctors/nearby` | Find nearby doctors | Public |
| GET | `/api/doctors/:id` | Get doctor details | Public |
| GET | `/api/doctors/specializations/list` | Get specializations | Public |
| POST | `/api/doctors/:id/review` | Add review | Private |
| POST | `/api/doctors` | Create doctor | Admin |
| PUT | `/api/doctors/:id` | Update doctor | Admin |
| DELETE | `/api/doctors/:id` | Delete doctor | Admin |

## 🧪 Testing

```bash
# Run tests (when implemented)
npm test

# Run linting
npm run lint

# Fix linting issues
npm run lint:fix
```

## 🚀 Deployment

### Production Checklist
- [ ] Set `NODE_ENV=production`
- [ ] Configure MongoDB Atlas or production database
- [ ] Set secure JWT secret
- [ ] Configure CORS for production domain
- [ ] Set up file storage (AWS S3 or similar)
- [ ] Configure rate limiting
- [ ] Set up monitoring and logging
- [ ] Configure SSL/TLS

### Docker Deployment
```bash
# Build Docker image
docker build -t healthcare-helper .

# Run container
docker run -p 3000:3000 healthcare-helper
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow the existing code style
- Write meaningful commit messages
- Add tests for new features
- Update documentation as needed
- Ensure all tests pass before submitting PR

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Font Awesome for icons
- Google Fonts for typography
- MongoDB for database
- Express.js community for excellent documentation

## 📞 Support

For support, email support@healthcare-helper.com or create an issue in the repository.

## 🔮 Roadmap

- [ ] User authentication and profiles
- [ ] Appointment booking system
- [ ] Push notifications
- [ ] Mobile app (React Native)
- [ ] Advanced AI medicine recognition
- [ ] Integration with pharmacy APIs
- [ ] Multi-language support
- [ ] Offline functionality
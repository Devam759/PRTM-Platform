const mongoose = require('mongoose');
const Medicine = require('../models/Medicine');
const Doctor = require('../models/Doctor');
require('dotenv').config();

// Sample medicine data
const sampleMedicines = [
  {
    name: 'Paracetamol 500mg',
    genericName: 'Acetaminophen',
    brandName: 'Tylenol',
    dosage: '500mg',
    form: 'tablet',
    description: 'Pain reliever and fever reducer. Used to treat mild to moderate pain and reduce fever.',
    uses: [
      'Pain relief',
      'Fever reduction',
      'Headache treatment',
      'Muscle pain relief'
    ],
    precautions: [
      'Do not exceed 4 grams per day',
      'Consult doctor if symptoms persist for more than 3 days',
      'Avoid if allergic to acetaminophen',
      'Do not take with other acetaminophen-containing products'
    ],
    sideEffects: [
      'Rare: Allergic reactions',
      'Very rare: Liver damage with overdose'
    ],
    dosageInstructions: 'Take 1-2 tablets every 4-6 hours as needed. Take with food to avoid stomach upset.',
    warnings: [
      'Do not exceed recommended dose',
      'Keep out of reach of children',
      'Store at room temperature'
    ],
    contraindications: [
      'Severe liver disease',
      'Allergy to acetaminophen'
    ],
    drugInteractions: [
      'Warfarin (increased bleeding risk)',
      'Alcohol (increased liver damage risk)'
    ],
    pregnancyCategory: 'B',
    storageInstructions: 'Store at room temperature, away from moisture and heat',
    manufacturer: 'Johnson & Johnson',
    barcode: '1234567890123',
    keywords: ['pain', 'fever', 'headache', 'tylenol', 'acetaminophen'],
    category: 'analgesic',
    prescriptionRequired: false,
    images: [{
      url: '/uploads/paracetamol.jpg',
      alt: 'Paracetamol 500mg tablets',
      isPrimary: true
    }]
  },
  {
    name: 'Aspirin 100mg',
    genericName: 'Acetylsalicylic Acid',
    brandName: 'Bayer Aspirin',
    dosage: '100mg',
    form: 'tablet',
    description: 'Anti-inflammatory and pain reliever. Also used for heart protection in low doses.',
    uses: [
      'Pain relief',
      'Anti-inflammatory',
      'Heart attack prevention',
      'Stroke prevention'
    ],
    precautions: [
      'May cause stomach irritation',
      'Avoid if allergic to aspirin',
      'Do not give to children under 16',
      'Consult doctor before use if pregnant'
    ],
    sideEffects: [
      'Stomach upset',
      'Nausea',
      'Heartburn',
      'Rare: Stomach bleeding'
    ],
    dosageInstructions: 'Take 1 tablet daily with food. Take at the same time each day for best results.',
    warnings: [
      'May increase bleeding risk',
      'Avoid alcohol while taking',
      'Do not crush or chew'
    ],
    contraindications: [
      'Active stomach ulcers',
      'Bleeding disorders',
      'Allergy to aspirin',
      'Children under 16'
    ],
    drugInteractions: [
      'Warfarin (increased bleeding)',
      'Methotrexate (increased toxicity)',
      'ACE inhibitors (reduced effectiveness)'
    ],
    pregnancyCategory: 'D',
    storageInstructions: 'Store in a cool, dry place',
    manufacturer: 'Bayer',
    barcode: '1234567890124',
    keywords: ['aspirin', 'heart', 'pain', 'anti-inflammatory', 'bayer'],
    category: 'analgesic',
    prescriptionRequired: false,
    images: [{
      url: '/uploads/aspirin.jpg',
      alt: 'Aspirin 100mg tablets',
      isPrimary: true
    }]
  },
  {
    name: 'Ibuprofen 400mg',
    genericName: 'Ibuprofen',
    brandName: 'Advil',
    dosage: '400mg',
    form: 'tablet',
    description: 'Non-steroidal anti-inflammatory drug (NSAID) for pain, inflammation, and fever.',
    uses: [
      'Pain relief',
      'Anti-inflammatory',
      'Fever reduction',
      'Arthritis pain'
    ],
    precautions: [
      'May cause stomach problems',
      'Take with food',
      'Avoid if you have heart or kidney problems',
      'Do not exceed 6 tablets in 24 hours'
    ],
    sideEffects: [
      'Stomach upset',
      'Dizziness',
      'Headache',
      'Rare: Stomach bleeding'
    ],
    dosageInstructions: 'Take 1 tablet every 6-8 hours with food. Do not exceed 6 tablets in 24 hours.',
    warnings: [
      'May increase heart attack risk',
      'May cause kidney problems',
      'Avoid alcohol'
    ],
    contraindications: [
      'Active stomach ulcers',
      'Severe heart failure',
      'Severe kidney disease',
      'Allergy to NSAIDs'
    ],
    drugInteractions: [
      'ACE inhibitors (reduced effectiveness)',
      'Diuretics (reduced effectiveness)',
      'Warfarin (increased bleeding risk)'
    ],
    pregnancyCategory: 'C',
    storageInstructions: 'Store at room temperature',
    manufacturer: 'Pfizer',
    barcode: '1234567890125',
    keywords: ['ibuprofen', 'advil', 'pain', 'inflammation', 'nsaid'],
    category: 'analgesic',
    prescriptionRequired: false,
    images: [{
      url: '/uploads/ibuprofen.jpg',
      alt: 'Ibuprofen 400mg tablets',
      isPrimary: true
    }]
  },
  {
    name: 'Amoxicillin 500mg',
    genericName: 'Amoxicillin',
    brandName: 'Amoxil',
    dosage: '500mg',
    form: 'capsule',
    description: 'Antibiotic used to treat bacterial infections.',
    uses: [
      'Bacterial infections',
      'Respiratory infections',
      'Urinary tract infections',
      'Skin infections'
    ],
    precautions: [
      'Complete full course as prescribed',
      'May cause diarrhea',
      'Avoid if allergic to penicillin',
      'Take with or without food'
    ],
    sideEffects: [
      'Diarrhea',
      'Nausea',
      'Vomiting',
      'Rash'
    ],
    dosageInstructions: 'Take 1 capsule every 8 hours for 7-10 days as prescribed by doctor.',
    warnings: [
      'Do not stop taking early',
      'May reduce effectiveness of birth control',
      'Inform doctor of any side effects'
    ],
    contraindications: [
      'Allergy to penicillin',
      'Severe kidney disease'
    ],
    drugInteractions: [
      'Warfarin (increased bleeding risk)',
      'Methotrexate (increased toxicity)',
      'Birth control pills (reduced effectiveness)'
    ],
    pregnancyCategory: 'B',
    storageInstructions: 'Store at room temperature',
    manufacturer: 'GlaxoSmithKline',
    barcode: '1234567890126',
    keywords: ['amoxicillin', 'antibiotic', 'infection', 'penicillin', 'amoxil'],
    category: 'antibiotic',
    prescriptionRequired: true,
    images: [{
      url: '/uploads/amoxicillin.jpg',
      alt: 'Amoxicillin 500mg capsules',
      isPrimary: true
    }]
  }
];

// Sample doctor data
const sampleDoctors = [
  {
    name: 'Dr. Sarah Johnson',
    email: 'sarah.johnson@healthcare.com',
    phone: '(555) 123-4567',
    specialization: 'cardiology',
    licenseNumber: 'MD123456',
    experience: 15,
    education: [
      {
        degree: 'MD',
        institution: 'Harvard Medical School',
        year: 2008
      },
      {
        degree: 'Residency in Internal Medicine',
        institution: 'Johns Hopkins Hospital',
        year: 2011
      },
      {
        degree: 'Fellowship in Cardiology',
        institution: 'Mayo Clinic',
        year: 2014
      }
    ],
    certifications: [
      {
        name: 'Board Certified in Internal Medicine',
        issuingOrganization: 'American Board of Internal Medicine',
        date: new Date('2011-06-15')
      },
      {
        name: 'Board Certified in Cardiology',
        issuingOrganization: 'American Board of Internal Medicine',
        date: new Date('2014-08-20')
      }
    ],
    address: {
      street: '123 Main Street',
      city: 'New York',
      state: 'NY',
      zipCode: '10001',
      country: 'USA',
      coordinates: {
        latitude: 40.7589,
        longitude: -73.9851
      }
    },
    clinic: {
      name: 'Heart Care Center',
      phone: '(555) 123-4567',
      website: 'https://heartcarecenter.com'
    },
    availability: {
      monday: { start: '09:00', end: '17:00', isAvailable: true },
      tuesday: { start: '09:00', end: '17:00', isAvailable: true },
      wednesday: { start: '09:00', end: '17:00', isAvailable: true },
      thursday: { start: '09:00', end: '17:00', isAvailable: true },
      friday: { start: '09:00', end: '17:00', isAvailable: true },
      saturday: { start: '10:00', end: '14:00', isAvailable: true },
      sunday: { start: '', end: '', isAvailable: false }
    },
    consultationFee: 250,
    rating: {
      average: 4.9,
      count: 127
    },
    reviews: [
      {
        patientId: new mongoose.Types.ObjectId(),
        rating: 5,
        comment: 'Excellent cardiologist, very thorough and caring.',
        date: new Date('2023-10-15')
      },
      {
        patientId: new mongoose.Types.ObjectId(),
        rating: 5,
        comment: 'Dr. Johnson saved my life. Highly recommended!',
        date: new Date('2023-09-20')
      }
    ],
    languages: ['English', 'Spanish'],
    photo: 'https://via.placeholder.com/150x150/4F46E5/FFFFFF?text=Dr.SJ',
    isOnline: true,
    isVerified: true,
    isActive: true,
    bio: 'Dr. Sarah Johnson is a board-certified cardiologist with over 15 years of experience in treating heart conditions. She specializes in preventive cardiology and interventional procedures.',
    services: [
      'Cardiac consultation',
      'Echocardiogram',
      'Stress testing',
      'Cardiac catheterization',
      'Preventive cardiology'
    ],
    insuranceAccepted: [
      'Blue Cross Blue Shield',
      'Aetna',
      'Cigna',
      'UnitedHealth',
      'Medicare'
    ]
  },
  {
    name: 'Dr. Michael Chen',
    email: 'michael.chen@healthcare.com',
    phone: '(555) 234-5678',
    specialization: 'general',
    licenseNumber: 'MD234567',
    experience: 12,
    education: [
      {
        degree: 'MD',
        institution: 'Stanford Medical School',
        year: 2011
      },
      {
        degree: 'Residency in Family Medicine',
        institution: 'UCSF Medical Center',
        year: 2014
      }
    ],
    certifications: [
      {
        name: 'Board Certified in Family Medicine',
        issuingOrganization: 'American Board of Family Medicine',
        date: new Date('2014-07-10')
      }
    ],
    address: {
      street: '456 Oak Avenue',
      city: 'San Francisco',
      state: 'CA',
      zipCode: '94102',
      country: 'USA',
      coordinates: {
        latitude: 37.7749,
        longitude: -122.4194
      }
    },
    clinic: {
      name: 'Family Health Center',
      phone: '(555) 234-5678',
      website: 'https://familyhealthcenter.com'
    },
    availability: {
      monday: { start: '08:00', end: '18:00', isAvailable: true },
      tuesday: { start: '08:00', end: '18:00', isAvailable: true },
      wednesday: { start: '08:00', end: '18:00', isAvailable: true },
      thursday: { start: '08:00', end: '18:00', isAvailable: true },
      friday: { start: '08:00', end: '18:00', isAvailable: true },
      saturday: { start: '', end: '', isAvailable: false },
      sunday: { start: '', end: '', isAvailable: false }
    },
    consultationFee: 180,
    rating: {
      average: 4.7,
      count: 89
    },
    reviews: [
      {
        patientId: new mongoose.Types.ObjectId(),
        rating: 5,
        comment: 'Great family doctor, very patient and understanding.',
        date: new Date('2023-10-10')
      },
      {
        patientId: new mongoose.Types.ObjectId(),
        rating: 4,
        comment: 'Good doctor, sometimes hard to get appointments.',
        date: new Date('2023-09-15')
      }
    ],
    languages: ['English', 'Mandarin'],
    photo: 'https://via.placeholder.com/150x150/10B981/FFFFFF?text=Dr.MC',
    isOnline: false,
    isVerified: true,
    isActive: true,
    bio: 'Dr. Michael Chen is a family medicine physician dedicated to providing comprehensive healthcare for patients of all ages. He focuses on preventive care and chronic disease management.',
    services: [
      'General consultation',
      'Annual physicals',
      'Chronic disease management',
      'Vaccinations',
      'Minor procedures'
    ],
    insuranceAccepted: [
      'Blue Cross Blue Shield',
      'Aetna',
      'Kaiser Permanente',
      'Medicare',
      'Medicaid'
    ]
  }
];

async function seedDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/healthcare-helper');
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await Medicine.deleteMany({});
    await Doctor.deleteMany({});
    console.log('🗑️ Cleared existing data');

    // Insert sample medicines
    const medicines = await Medicine.insertMany(sampleMedicines);
    console.log(`💊 Inserted ${medicines.length} medicines`);

    // Insert sample doctors
    const doctors = await Doctor.insertMany(sampleDoctors);
    console.log(`👨‍⚕️ Inserted ${doctors.length} doctors`);

    console.log('🎉 Database seeded successfully!');
    console.log('\nSample data includes:');
    console.log('- 4 medicines (Paracetamol, Aspirin, Ibuprofen, Amoxicillin)');
    console.log('- 2 doctors (Dr. Sarah Johnson - Cardiology, Dr. Michael Chen - General)');
    console.log('\nYou can now test the medicine scanning and doctor search features!');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    await mongoose.disconnect();
    console.log('📡 Disconnected from MongoDB');
  }
}

// Run the seed function
seedDatabase();

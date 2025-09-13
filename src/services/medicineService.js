const Medicine = require('../models/Medicine');

/**
 * Identify medicine from image using AI/ML
 * @param {Buffer} imageBuffer - Image buffer
 * @returns {Promise<Object|null>} - Identified medicine or null
 */
const identifyMedicineFromImage = async (imageBuffer) => {
  // This is a simulation - in a real app, you would use computer vision APIs
  // For demo purposes, we'll return a random medicine from the database
  
  try {
    const medicines = await Medicine.find({ isActive: true }).limit(10);
    
    if (medicines.length === 0) {
      return null;
    }
    
    // Return a random medicine with some confidence score
    const randomMedicine = medicines[Math.floor(Math.random() * medicines.length)];
    
    return {
      _id: randomMedicine._id,
      name: randomMedicine.name,
      genericName: randomMedicine.genericName,
      brandName: randomMedicine.brandName,
      dosage: randomMedicine.dosage,
      form: randomMedicine.form,
      description: randomMedicine.description,
      uses: randomMedicine.uses,
      precautions: randomMedicine.precautions,
      dosageInstructions: randomMedicine.dosageInstructions,
      warnings: randomMedicine.warnings,
      images: randomMedicine.images,
      category: randomMedicine.category,
      prescriptionRequired: randomMedicine.prescriptionRequired,
      confidence: Math.floor(Math.random() * 20) + 80 // 80-100% confidence
    };
    
  } catch (error) {
    console.error('Error in medicine identification:', error);
    return null;
  }
};

/**
 * Search medicines with advanced filtering
 * @param {string} query - Search query
 * @param {Object} options - Search options
 * @returns {Promise<Array>} - Search results
 */
const searchMedicines = async (query, options = {}) => {
  try {
    const {
      category,
      prescriptionRequired,
      limit = 20,
      skip = 0,
      sortBy = 'relevance'
    } = options;
    
    let searchQuery = {
      isActive: true,
      $text: { $search: query }
    };
    
    if (category) {
      searchQuery.category = category;
    }
    
    if (prescriptionRequired !== undefined) {
      searchQuery.prescriptionRequired = prescriptionRequired;
    }
    
    let sortOptions = {};
    switch (sortBy) {
      case 'name':
        sortOptions = { name: 1 };
        break;
      case 'category':
        sortOptions = { category: 1, name: 1 };
        break;
      case 'relevance':
      default:
        sortOptions = { score: { $meta: 'textScore' } };
        break;
    }
    
    const medicines = await Medicine.find(searchQuery)
      .select('name genericName brandName dosage form description uses precautions dosageInstructions images category prescriptionRequired')
      .sort(sortOptions)
      .limit(limit)
      .skip(skip);
    
    return medicines;
  } catch (error) {
    console.error('Error searching medicines:', error);
    throw error;
  }
};

/**
 * Get medicine statistics
 * @returns {Promise<Object>} - Statistics
 */
const getMedicineStats = async () => {
  try {
    const stats = await Medicine.aggregate([
      {
        $match: { isActive: true }
      },
      {
        $group: {
          _id: null,
          totalMedicines: { $sum: 1 },
          prescriptionRequired: {
            $sum: { $cond: ['$prescriptionRequired', 1, 0] }
          },
          overTheCounter: {
            $sum: { $cond: ['$prescriptionRequired', 0, 1] }
          },
          categories: { $addToSet: '$category' }
        }
      },
      {
        $project: {
          totalMedicines: 1,
          prescriptionRequired: 1,
          overTheCounter: 1,
          categoryCount: { $size: '$categories' }
        }
      }
    ]);
    
    return stats[0] || {
      totalMedicines: 0,
      prescriptionRequired: 0,
      overTheCounter: 0,
      categoryCount: 0
    };
  } catch (error) {
    console.error('Error getting medicine stats:', error);
    throw error;
  }
};

/**
 * Get popular medicines
 * @param {number} limit - Number of medicines to return
 * @returns {Promise<Array>} - Popular medicines
 */
const getPopularMedicines = async (limit = 10) => {
  try {
    // This would typically be based on scan history or usage data
    // For now, we'll return random medicines
    const medicines = await Medicine.find({ isActive: true })
      .select('name genericName brandName dosage form description images category')
      .limit(limit)
      .sort({ createdAt: -1 });
    
    return medicines;
  } catch (error) {
    console.error('Error getting popular medicines:', error);
    throw error;
  }
};

/**
 * Get medicine recommendations based on category
 * @param {string} category - Medicine category
 * @param {number} limit - Number of recommendations
 * @returns {Promise<Array>} - Recommended medicines
 */
const getMedicineRecommendations = async (category, limit = 5) => {
  try {
    const medicines = await Medicine.find({
      isActive: true,
      category: category
    })
      .select('name genericName brandName dosage form description images category')
      .limit(limit);
    
    return medicines;
  } catch (error) {
    console.error('Error getting medicine recommendations:', error);
    throw error;
  }
};

module.exports = {
  identifyMedicineFromImage,
  searchMedicines,
  getMedicineStats,
  getPopularMedicines,
  getMedicineRecommendations
};

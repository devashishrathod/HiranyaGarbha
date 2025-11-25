// const mongoose = require('mongoose');
// const MainCategory = require('../models/MainCategory');
// const ImageCategory = require('../models/ImageCategory');
// const VideoCategory = require('../models/VideoCategory');
// const Image = require('../models/Image');
// const Video = require('../models/Video');
// const connectDB = require('../config/dbConnection');

// const mainCategories = [
//   {
//     _id: new mongoose.Types.ObjectId(),
//     title: "Pregnancy Journey",
//     description: "Comprehensive guides and content for your pregnancy journey",
//     image: "https://example.com/images/pregnancy-journey.jpg"
//   },
//   {
//     _id: new mongoose.Types.ObjectId(),
//     title: "Prenatal Development",
//     description: "Week by week development of your baby during pregnancy",
//     image: "https://example.com/images/prenatal-development.jpg"
//   },
//   {
//     _id: new mongoose.Types.ObjectId(),
//     title: "Maternal Wellness",
//     description: "Health and wellness guidance for expectant mothers",
//     image: "https://example.com/images/maternal-wellness.jpg"
//   },
//   {
//     _id: new mongoose.Types.ObjectId(),
//     title: "Birthing Preparation",
//     description: "Essential information and preparation for childbirth",
//     image: "https://example.com/images/birthing-prep.jpg"
//   }
// ];

// const generateImageCategories = () => {
//     return[
//   {
//     title: "First Trimester Milestones",
//     description: "Visual guide to baby's development in first trimester",
//     url: "https://example.com/images/first-trimester.jpg",
//     category: mainCategories[0]._id
//   },
//   {
//     title: "Pregnancy Exercise Guide",
//     description: "Safe exercises during pregnancy with visual demonstrations",
//     url: "https://example.com/images/pregnancy-exercise.jpg",
//     category: mainCategories[2]._id
//   },
//   {
//     title: "Fetal Development Stages",
//     description: "Weekly images of fetal development progress",
//     url: "https://example.com/images/fetal-development.jpg",
//     category: mainCategories[1]._id
//   },
//   {
//     title: "Labor Positions",
//     description: "Different positions for labor and delivery",
//     url: "https://example.com/images/labor-positions.jpg",
//     category: mainCategories[3]._id
//   },
//   {
//     title: "Pregnancy Nutrition",
//     description: "Visual guides for healthy pregnancy diet",
//     url: "https://example.com/images/pregnancy-nutrition.jpg",
//     category: mainCategories[2]._id
//   },
//   {
//     title: "Baby Growth Chart",
//     description: "Visual representation of baby's growth during pregnancy",
//     url: "https://example.com/images/baby-growth.jpg",
//     category: mainCategories[1]._id
//   }
// ]};

// const generateVideoCategories = () => {
//     return [
//   {
//     title: "Pregnancy Yoga Sessions",
//     description: "Guided yoga sessions for different stages of pregnancy",
//     url: "https://example.com/videos/pregnancy-yoga.mp4",
//     category: mainCategories[2]._id
//   },
//   {
//     title: "Childbirth Education",
//     description: "Educational videos about the birthing process",
//     url: "https://example.com/videos/childbirth-education.mp4",
//     category: mainCategories[3]._id
//   },
//   {
//     title: "Prenatal Exercises",
//     description: "Safe workout routines for pregnant women",
//     url: "https://example.com/videos/prenatal-exercises.mp4",
//     category: mainCategories[2]._id
//   },
//   {
//     title: "Baby Development Series",
//     description: "Weekly videos showing fetal development",
//     url: "https://example.com/videos/baby-development.mp4",
//     category: mainCategories[1]._id
//   },
//   {
//     title: "Pregnancy Diet Tips",
//     description: "Nutritional advice and meal preparation guides",
//     url: "https://example.com/videos/pregnancy-diet.mp4",
//     category: mainCategories[2]._id
//   },
//   {
//     title: "Relaxation Techniques",
//     description: "Meditation and relaxation guides for pregnant women",
//     url: "https://example.com/videos/relaxation.mp4",
//     category: mainCategories[0]._id
//   }
// ]};

// // New image data
// const generateImages = (imageCategories) => {
//     return [
//     {
//       title: "Week 1-4 Development",
//       description: "Early stages of fetal development in the first month",
//       url: "https://example.com/images/content/week-1-4.jpg",
//       category: imageCategories[0]._id  // First Trimester Milestones
//     },
//     {
//       title: "Week 5-8 Development",
//       description: "Formation of major organs and structures",
//       url: "https://example.com/images/content/week-5-8.jpg",
//       category: imageCategories[0]._id
//     },
//     {
//       title: "Safe Stretching Exercises",
//       description: "Gentle stretching exercises for pregnant women",
//       url: "https://example.com/images/content/stretching.jpg",
//       category: imageCategories[1]._id  // Pregnancy Exercise Guide
//     },
//     {
//       title: "Pregnancy Yoga Poses",
//       description: "Basic yoga positions safe during pregnancy",
//       url: "https://example.com/images/content/yoga-poses.jpg",
//       category: imageCategories[1]._id
//     },
//     {
//       title: "First Trimester Development",
//       description: "Complete guide to first trimester fetal growth",
//       url: "https://example.com/images/content/first-trimester.jpg",
//       category: imageCategories[2]._id  // Fetal Development Stages
//     },
//     {
//       title: "Second Trimester Changes",
//       description: "Visual guide to second trimester development",
//       url: "https://example.com/images/content/second-trimester.jpg",
//       category: imageCategories[2]._id
//     },
//     {
//       title: "Standing Labor Positions",
//       description: "Effective standing positions during labor",
//       url: "https://example.com/images/content/standing-labor.jpg",
//       category: imageCategories[3]._id  // Labor Positions
//     },
//     {
//       title: "Birth Ball Positions",
//       description: "Using a birth ball during labor",
//       url: "https://example.com/images/content/birth-ball.jpg",
//       category: imageCategories[3]._id
//     },
//     {
//       title: "Healthy Pregnancy Foods",
//       description: "Essential nutrients and food groups during pregnancy",
//       url: "https://example.com/images/content/healthy-foods.jpg",
//       category: imageCategories[4]._id  // Pregnancy Nutrition
//     },
//     {
//       title: "Meal Planning Guide",
//       description: "Weekly meal planning for pregnant mothers",
//       url: "https://example.com/images/content/meal-planning.jpg",
//       category: imageCategories[4]._id
//     }
//   ]};
  
//   // New video data
//   const generateVideos = (videoCategories) => {
//     return[
//     {
//       title: "Morning Yoga Routine",
//       description: "15-minute gentle morning yoga sequence",
//       url: "https://example.com/videos/content/morning-yoga.mp4",
//       category: videoCategories[0]._id  // Pregnancy Yoga Sessions
//     },
//     {
//       title: "Evening Relaxation Yoga",
//       description: "Calming yoga sequence for better sleep",
//       url: "https://example.com/videos/content/evening-yoga.mp4",
//       category: videoCategories[0]._id
//     },
//     {
//       title: "Understanding Labor Stages",
//       description: "Detailed explanation of the three stages of labor",
//       url: "https://example.com/videos/content/labor-stages.mp4",
//       category: videoCategories[1]._id  // Childbirth Education
//     },
//     {
//       title: "Pain Management Techniques",
//       description: "Natural methods for managing labor pain",
//       url: "https://example.com/videos/content/pain-management.mp4",
//       category: videoCategories[1]._id
//     },
//     {
//       title: "Safe Cardio Workout",
//       description: "30-minute pregnancy-safe cardio routine",
//       url: "https://example.com/videos/content/cardio.mp4",
//       category: videoCategories[2]._id  // Prenatal Exercises
//     },
//     {
//       title: "Strength Training Basics",
//       description: "Essential strength exercises during pregnancy",
//       url: "https://example.com/videos/content/strength.mp4",
//       category: videoCategories[2]._id
//     },
//     {
//       title: "First Trimester Overview",
//       description: "Weekly development guide for first trimester",
//       url: "https://example.com/videos/content/first-trimester-dev.mp4",
//       category: videoCategories[3]._id  // Baby Development Series
//     },
//     {
//       title: "Second Trimester Changes",
//       description: "Key developmental milestones in second trimester",
//       url: "https://example.com/videos/content/second-trimester-dev.mp4",
//       category: videoCategories[3]._id
//     },
//     {
//       title: "Nutrition Essentials",
//       description: "Key nutrients needed during pregnancy",
//       url: "https://example.com/videos/content/nutrition.mp4",
//       category: videoCategories[4]._id  // Pregnancy Diet Tips
//     },
//     {
//       title: "Healthy Meal Prep",
//       description: "Meal preparation guide for busy moms-to-be",
//       url: "https://example.com/videos/content/meal-prep.mp4",
//       category: videoCategories[4]._id
//     }
//   ]};
  
//   async function seedDatabase() {
//     try {
//         // Connect to database
//         await connectDB();
//         console.log('Connected to database');
    
//         // Clear existing data
//         await Promise.all([
//           MainCategory.deleteMany({}),
//           ImageCategory.deleteMany({}),
//           VideoCategory.deleteMany({}),
//           Image.deleteMany({}),
//           Video.deleteMany({})
//         ]);
//         console.log('Cleared existing data');
    
//         // Insert main categories first
//         await MainCategory.insertMany(mainCategories);
//         console.log('Main categories inserted');
    
//         // Generate and insert image categories
//         const imageCategoriesData = generateImageCategories();
//         await ImageCategory.insertMany(imageCategoriesData);
//         console.log('Image categories inserted');
    
//         // Generate and insert video categories
//         const videoCategoriesData = generateVideoCategories();
//         await VideoCategory.insertMany(videoCategoriesData);
//         console.log('Video categories inserted');
    
//         // Generate and insert images
//         const imagesData = generateImages(imageCategoriesData);
//         await Image.insertMany(imagesData);
//         console.log('Images inserted');
    
//         // Generate and insert videos
//         const videosData = generateVideos(videoCategoriesData);
//         await Video.insertMany(videosData);
//         console.log('Videos inserted');
    
//         console.log('Database seeded successfully');
    
//       } catch (error) {
//         console.error('Error seeding database:', error);
//       } finally {
//         try {
//           await mongoose.connection.close();
//           console.log('Database connection closed');
//           process.exit(0);
//         } catch (error) {
//           console.error('Error closing database connection:', error);
//           process.exit(1);
//         }
//       }
//     }
    
//     // Run seeding
//     seedDatabase();

//=========================================================================================================
const mongoose = require('mongoose');
const MainCategory = require('../models/MainCategory');
const ImageCategory = require('../models/ImageCategory');
const VideoCategory = require('../models/VideoCategory');
const Image = require('../models/Image');
const Video = require('../models/Video');
const connectDB = require('../config/dbConnection');

// Main Categories with explicit IDs
const mainCategories = [
  {
    _id: new mongoose.Types.ObjectId(),
    title: "Pregnancy Journey",
    description: "Comprehensive guides and content for your pregnancy journey",
    image: "https://example.com/images/pregnancy-journey.jpg"
  },
  {
    _id: new mongoose.Types.ObjectId(),
    title: "Prenatal Development",
    description: "Week by week development of your baby during pregnancy",
    image: "https://example.com/images/prenatal-development.jpg"
  },
  {
    _id: new mongoose.Types.ObjectId(),
    title: "Maternal Wellness",
    description: "Health and wellness guidance for expectant mothers",
    image: "https://example.com/images/maternal-wellness.jpg"
  },
  {
    _id: new mongoose.Types.ObjectId(),
    title: "Birthing Preparation",
    description: "Essential information and preparation for childbirth",
    image: "https://example.com/images/birthing-prep.jpg"
  }
];

// Image Categories with explicit IDs and references
const imageCategories = mainCategories.map(mainCat => {
  return {
    _id: new mongoose.Types.ObjectId(),
    title: `${mainCat.title} Images`,
    description: `Image collection for ${mainCat.title}`,
    url: "https://example.com/images/category-default.jpg",
    category: mainCat._id
  };
});

// Video Categories with explicit IDs and references
const videoCategories = mainCategories.map(mainCat => {
  return {
    _id: new mongoose.Types.ObjectId(),
    title: `${mainCat.title} Videos`,
    description: `Video collection for ${mainCat.title}`,
    url: "https://example.com/videos/category-default.mp4",
    category: mainCat._id
  };
});

// Generate images with proper category references
const generateImages = () => {
  const images = [];
  imageCategories.forEach(imgCat => {
    // Add two images per category
    images.push(
      {
        title: `${imgCat.title} - Image 1`,
        description: `First image for ${imgCat.title}`,
        url: "https://example.com/images/content/image1.jpg",
        category: imgCat._id // Reference to ImageCategory
      },
      {
        title: `${imgCat.title} - Image 2`,
        description: `Second image for ${imgCat.title}`,
        url: "https://example.com/images/content/image2.jpg",
        category: imgCat._id // Reference to ImageCategory
      }
    );
  });
  return images;
};

// Generate videos with proper category references
const generateVideos = () => {
  const videos = [];
  videoCategories.forEach(vidCat => {
    // Add two videos per category
    videos.push(
      {
        title: `${vidCat.title} - Video 1`,
        description: `First video for ${vidCat.title}`,
        url: "https://example.com/videos/content/video1.mp4",
        category: vidCat._id // Reference to VideoCategory
      },
      {
        title: `${vidCat.title} - Video 2`,
        description: `Second video for ${vidCat.title}`,
        url: "https://example.com/videos/content/video2.mp4",
        category: vidCat._id // Reference to VideoCategory
      }
    );
  });
  return videos;
};

async function seedDatabase() {
  let session;
  try {
    // Connect to database
    await connectDB();
    console.log('Connected to database');

    // Start transaction
    session = await mongoose.startSession();
    session.startTransaction();

    // Clear all existing data
    await Promise.all([
      MainCategory.deleteMany({}, { session }),
      ImageCategory.deleteMany({}, { session }),
      VideoCategory.deleteMany({}, { session }),
      Image.deleteMany({}, { session }),
      Video.deleteMany({}, { session })
    ]);
    console.log('Cleared existing data');

    // Insert categories
    await MainCategory.insertMany(mainCategories, { session });
    await ImageCategory.insertMany(imageCategories, { session });
    await VideoCategory.insertMany(videoCategories, { session });
    
    // Generate and insert content
    const imagesData = generateImages();
    const videosData = generateVideos();
    
    await Image.insertMany(imagesData, { session });
    await Video.insertMany(videosData, { session });

    // Commit transaction
    await session.commitTransaction();
    
    console.log('Successfully seeded database with:');
    console.log(`- ${mainCategories.length} main categories`);
    console.log(`- ${imageCategories.length} image categories`);
    console.log(`- ${videoCategories.length} video categories`);
    console.log(`- ${imagesData.length} images`);
    console.log(`- ${videosData.length} videos`);

  } catch (error) {
    console.error('Error seeding database:', error);
    if (session) {
      await session.abortTransaction();
    }
    process.exit(1);
  } finally {
    if (session) {
      session.endSession();
    }
    try {
      await mongoose.connection.close();
      console.log('Database connection closed');
      process.exit(0);
    } catch (error) {
      console.error('Error closing database connection:', error);
      process.exit(1);
    }
  }
}

// Run seeding
seedDatabase();
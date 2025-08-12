// Script to update existing users with new avatar URLs
const mongoose = require('mongoose');
require('dotenv').config();

// Import User model
const User = require('../src/models/User');

async function updateUserAvatars() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('Connected to MongoDB');
    
    // Get all users
    const users = await User.find({});
    console.log(`Found ${users.length} users to update`);
    
    let updatedCount = 0;
    
    for (const user of users) {
      try {
        // Generate new avatar URL
        const newAvatarUrl = user.generateAvatar();
        
        // Update user if avatar is different
        if (user.profilePicture !== newAvatarUrl) {
          user.profilePicture = newAvatarUrl;
          await user.save();
          updatedCount++;
          console.log(`Updated avatar for ${user.fullName} (${user.email})`);
        }
      } catch (error) {
        console.error(`Error updating user ${user.email}:`, error.message);
      }
    }
    
    console.log(`\n✅ Successfully updated ${updatedCount} user avatars`);
    console.log(`📊 Total users processed: ${users.length}`);
    
  } catch (error) {
    console.error('Error updating avatars:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the script
if (require.main === module) {
  updateUserAvatars();
}

module.exports = updateUserAvatars;

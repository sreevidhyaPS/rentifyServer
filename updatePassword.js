const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
require('dotenv').config(); // Load environment variables from .env file

async function updatePassword() {
  try {
    // Connect to MongoDB using MONGO_URI from environment variables
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
      throw new Error('MONGO_URI is not defined in the environment variables');
    }

    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');

    // Generate new hash for the password 'Admin123!'
    const newPassword = 'Admin123!'; // Replace with the correct password
    const newHash = await bcrypt.hash(newPassword, 10);
    console.log('Generated new hash:', newHash);

    // Update the user
    const result = await User.updateOne(
      { email: 'admin@rentify.com' },
      { password: newHash }
    );

    if (result.modifiedCount === 1) {
      console.log('Password updated successfully for admin@rentify.com');
    } else {
      console.log('No user found or password not updated');
    }
  } catch (error) {
    console.error('Error updating password:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
    process.exit();
  }
}

updatePassword();
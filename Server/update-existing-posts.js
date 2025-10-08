/**
 * Script to update existing posts with authorEmail field
 * This is a one-time migration script to add email support for notifications
 * 
 * Run this with: node update-existing-posts.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Post = require('./models/Post');
const Poll = require('./models/Poll');

const DB_URL = process.env.DB_URL;

async function updateExistingPosts() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(DB_URL);
    console.log('✅ Connected to MongoDB\n');

    // Note: Since we can't automatically determine the email from the display name,
    // we'll just log posts that need manual review
    
    console.log('Checking Posts without authorEmail...');
    const postsWithoutEmail = await Post.find({ 
      authorEmail: { $in: [null, undefined] },
      isAnonymous: false 
    });
    
    console.log(`Found ${postsWithoutEmail.length} posts without authorEmail`);
    
    if (postsWithoutEmail.length > 0) {
      console.log('\n⚠️ WARNING: These posts will NOT generate notifications when commented on:');
      postsWithoutEmail.forEach((post, index) => {
        console.log(`${index + 1}. "${post.title}" by ${post.author} (ID: ${post._id})`);
      });
      console.log('\nOnly new posts created after this update will support notifications.\n');
    }

    console.log('\nChecking Polls without authorEmail...');
    const pollsWithoutEmail = await Poll.find({ 
      authorEmail: { $in: [null, undefined] },
      isAnonymous: false 
    });
    
    console.log(`Found ${pollsWithoutEmail.length} polls without authorEmail`);
    
    if (pollsWithoutEmail.length > 0) {
      console.log('\n⚠️ WARNING: These polls will NOT generate notifications:');
      pollsWithoutEmail.forEach((poll, index) => {
        console.log(`${index + 1}. "${poll.topic}" by ${poll.author} (ID: ${poll._id})`);
      });
    }

    console.log('\n✅ Database check complete!');
    console.log('📝 Summary:');
    console.log(`   - Posts without email: ${postsWithoutEmail.length}`);
    console.log(`   - Polls without email: ${pollsWithoutEmail.length}`);
    console.log('\n💡 Recommendation: Only new posts/polls will support comment notifications.');
    console.log('   Existing posts can still be commented on, but won\'t trigger notifications.\n');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed.');
  }
}

// Run the script
updateExistingPosts();


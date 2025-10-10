const mongoose = require('mongoose');
const Document = require('./models/Document');

mongoose.connect('mongodb://localhost:27017/legal-aid', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(async () => {
  console.log('Connected to MongoDB');
  
  // Find a few documents with AI explanations in Sinhala or Tamil
  const docs = await Document.find({ 
    aiExplanation: { $exists: true, $ne: '' },
    explanationLanguage: { $in: ['sinhala', 'tamil'] }
  }).limit(3);
  
  console.log('Found', docs.length, 'documents with non-English explanations');
  
  docs.forEach((doc, index) => {
    console.log(`\n--- Document ${index + 1} ---`);
    console.log('Language:', doc.explanationLanguage);
    console.log('AI Status:', doc.aiStatus);
    console.log('Explanation length:', doc.aiExplanation ? doc.aiExplanation.length : 0);
    console.log('First 200 chars of explanation:');
    console.log(doc.aiExplanation ? doc.aiExplanation.substring(0, 200) + '...' : 'No explanation');
    
    // Check for Unicode characters
    if (doc.aiExplanation) {
      const hasUnicode = /[\u0080-\uFFFF]/.test(doc.aiExplanation);
      console.log('Contains Unicode characters:', hasUnicode);
      
      // Show actual bytes for the first few characters
      const firstChars = doc.aiExplanation.substring(0, 50);
      console.log('First 50 chars:', firstChars);
      console.log('Character codes:', firstChars.split('').map(c => c.charCodeAt(0)).join(', '));
    }
  });
  
  // Also check for any recent documents
  console.log('\n=== Recent Documents ===');
  const recentDocs = await Document.find({
    aiExplanation: { $exists: true, $ne: '' }
  }).sort({ createdAt: -1 }).limit(5);
  
  recentDocs.forEach((doc, index) => {
    console.log(`\nRecent Doc ${index + 1}:`);
    console.log('Language:', doc.explanationLanguage);
    console.log('Status:', doc.aiStatus);
    console.log('Explanation preview:', doc.aiExplanation ? doc.aiExplanation.substring(0, 100) + '...' : 'No explanation');
  });
  
  process.exit(0);
}).catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
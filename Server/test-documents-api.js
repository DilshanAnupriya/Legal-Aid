const fs = require('fs');
const path = require('path');
const FormData = require('form-data');
const http = require('http');

// Configuration
const SERVER_URL = 'http://localhost:3000';
const TEST_PDF_PATH = process.argv[2] || './test-document.pdf';

console.log('🧪 Testing Document API with AI Explanation\n');

// Test 1: Health Check
async function testHealthCheck() {
  return new Promise((resolve, reject) => {
    console.log('1️⃣ Testing Health Check...');
    http.get(`${SERVER_URL}/health`, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        const json = JSON.parse(data);
        console.log('   ✅ Server is healthy:', json.status);
        console.log('   ⏱️  Uptime:', Math.round(json.uptime), 'seconds\n');
        resolve();
      });
    }).on('error', reject);
  });
}

// Test 2: Get Supported Languages
async function testGetLanguages() {
  return new Promise((resolve, reject) => {
    console.log('2️⃣ Testing Get Supported Languages...');
    http.get(`${SERVER_URL}/api/documents/languages`, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        const json = JSON.parse(data);
        console.log('   ✅ Supported languages:', json.data.languages.map(l => l.name).join(', '));
        console.log('   🌐 Default language:', json.data.default, '\n');
        resolve();
      });
    }).on('error', reject);
  });
}

// Test 3: Upload and Explain Document
async function testExplainDocument(language = 'english') {
  return new Promise((resolve, reject) => {
    console.log(`3️⃣ Testing Document Explanation (${language})...`);
    
    // Check if test PDF exists
    if (!fs.existsSync(TEST_PDF_PATH)) {
      console.log('   ⚠️  Test PDF not found:', TEST_PDF_PATH);
      console.log('   💡 Usage: node test-documents-api.js <path-to-pdf>');
      console.log('   ⏭️  Skipping this test\n');
      return resolve();
    }

    const form = new FormData();
    form.append('document', fs.createReadStream(TEST_PDF_PATH));
    form.append('language', language);

    const options = {
      method: 'POST',
      host: 'localhost',
      port: 3000,
      path: '/api/documents/explain',
      headers: form.getHeaders()
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          if (json.success) {
            console.log('   ✅ Document explained successfully!');
            console.log('   📄 Document ID:', json.data.document.id);
            console.log('   🌐 Language:', json.data.language);
            console.log('   📊 Confidence:', json.data.confidence + '%');
            console.log('   📝 Word count:', json.data.wordCount);
            console.log('   📏 Character count:', json.data.characterCount);
            console.log('   📋 Explanation preview:', json.data.explanation.substring(0, 200) + '...\n');
            resolve(json.data.document.id);
          } else {
            console.log('   ❌ Error:', json.message);
            console.log('   ℹ️  Details:', json.error || 'No details provided\n');
            resolve();
          }
        } catch (e) {
          console.log('   ❌ Parse error:', e.message);
          console.log('   📄 Raw response:', data.substring(0, 500), '\n');
          resolve();
        }
      });
    });

    req.on('error', (e) => {
      console.log('   ❌ Request error:', e.message, '\n');
      resolve();
    });

    form.pipe(req);
  });
}

// Test 4: Get All Documents
async function testGetAllDocuments() {
  return new Promise((resolve, reject) => {
    console.log('4️⃣ Testing Get All Documents...');
    http.get(`${SERVER_URL}/api/documents?page=1&limit=5`, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          if (json.success) {
            console.log('   ✅ Documents retrieved successfully!');
            console.log('   📊 Total documents:', json.data.pagination.totalDocuments);
            console.log('   📄 Current page:', json.data.pagination.currentPage);
            console.log('   📚 Documents on this page:', json.data.documents.length, '\n');
          } else {
            console.log('   ❌ Error:', json.message, '\n');
          }
          resolve();
        } catch (e) {
          console.log('   ❌ Parse error:', e.message, '\n');
          resolve();
        }
      });
    }).on('error', reject);
  });
}

// Test 5: Get Document by ID
async function testGetDocumentById(documentId) {
  if (!documentId) {
    console.log('5️⃣ Skipping Get Document by ID (no document ID available)\n');
    return;
  }

  return new Promise((resolve, reject) => {
    console.log('5️⃣ Testing Get Document by ID...');
    http.get(`${SERVER_URL}/api/documents/${documentId}`, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          if (json.success) {
            console.log('   ✅ Document retrieved successfully!');
            console.log('   📄 Filename:', json.data.originalFilename);
            console.log('   💾 File size:', (json.data.fileSize / 1024).toFixed(2), 'KB');
            console.log('   📅 Uploaded:', new Date(json.data.createdAt).toLocaleString());
            console.log('   🤖 AI Status:', json.data.aiStatus);
            if (json.data.aiExplanation) {
              console.log('   📝 Has AI explanation:', json.data.aiExplanation.length > 0 ? 'Yes' : 'No');
            }
            console.log();
          } else {
            console.log('   ❌ Error:', json.message, '\n');
          }
          resolve();
        } catch (e) {
          console.log('   ❌ Parse error:', e.message, '\n');
          resolve();
        }
      });
    }).on('error', reject);
  });
}

// Run all tests
async function runTests() {
  console.log('═══════════════════════════════════════════════════════\n');
  
  try {
    await testHealthCheck();
    await testGetLanguages();
    
    // Test with English
    const documentId = await testExplainDocument('english');
    
    await testGetAllDocuments();
    await testGetDocumentById(documentId);
    
    console.log('═══════════════════════════════════════════════════════');
    console.log('✅ All tests completed!');
    console.log('\n💡 To test with a specific PDF:');
    console.log('   node test-documents-api.js path/to/your/document.pdf');
    console.log('\n💡 To test other languages:');
    console.log('   Modify the testExplainDocument() call in this script');
    console.log('═══════════════════════════════════════════════════════\n');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error('\n💡 Make sure the server is running on', SERVER_URL);
    console.error('   Start server with: npm start\n');
  }
}

// Check if server is running
console.log('🔍 Checking if server is running...');
http.get(`${SERVER_URL}/health`, () => {
  console.log('✅ Server is running!\n');
  runTests();
}).on('error', () => {
  console.error('❌ Cannot connect to server at', SERVER_URL);
  console.error('\n💡 Please start the server first:');
  console.error('   cd Server');
  console.error('   npm start\n');
  process.exit(1);
});

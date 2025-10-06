#!/usr/bin/env node

/**
 * Quick health check for multilingual AI document analysis
 * Run this to verify everything is configured correctly
 */

const fs = require('fs');
const path = require('path');

console.log('\n🔍 Legal-Aid Multilingual AI - Health Check');
console.log('='.repeat(60));

let allGood = true;
const issues = [];
const warnings = [];

// Check 1: Node modules
console.log('\n📦 Checking dependencies...');
try {
  require('@google/generative-ai');
  console.log('   ✅ @google/generative-ai installed');
} catch (e) {
  console.log('   ❌ @google/generative-ai NOT installed');
  issues.push('Run: npm install @google/generative-ai');
  allGood = false;
}

try {
  require('pdf-parse');
  console.log('   ✅ pdf-parse installed');
} catch (e) {
  console.log('   ❌ pdf-parse NOT installed');
  issues.push('Run: npm install pdf-parse');
  allGood = false;
}

// Check 2: Environment variables
console.log('\n🔑 Checking environment configuration...');
require('dotenv').config();

if (process.env.GEMINI_API_KEY) {
  console.log('   ✅ GEMINI_API_KEY is set');
  console.log('   📝 Key starts with:', process.env.GEMINI_API_KEY.substring(0, 10) + '...');
} else {
  console.log('   ❌ GEMINI_API_KEY is NOT set');
  issues.push('Set GEMINI_API_KEY in your .env file');
  allGood = false;
}

// Check 3: Required files
console.log('\n📄 Checking required files...');
const requiredFiles = [
  'Services/geminiService.js',
  'controllers/documentController.js',
  'models/Document.js',
  'Routes/documentRoutes.js',
];

requiredFiles.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    console.log(`   ✅ ${file}`);
  } else {
    console.log(`   ❌ ${file} NOT FOUND`);
    issues.push(`Missing file: ${file}`);
    allGood = false;
  }
});

// Check 4: GeminiService functionality
console.log('\n🤖 Checking GeminiService...');
try {
  const geminiService = require('./Services/geminiService');
  
  // Check if configured
  if (geminiService.isConfigured()) {
    console.log('   ✅ GeminiService is configured');
  } else {
    console.log('   ⚠️  GeminiService is NOT configured');
    warnings.push('Gemini AI is not configured - check your API key');
  }
  
  // Check supported languages
  const languages = geminiService.getSupportedLanguages();
  console.log('   ✅ Supported languages:', languages.map(l => l.code).join(', '));
  
  if (languages.length === 3) {
    console.log('   ✅ All 3 languages supported (English, Sinhala, Tamil)');
  } else {
    console.log('   ⚠️  Expected 3 languages, found', languages.length);
    warnings.push('Language count mismatch');
  }
  
  // Check methods exist
  const requiredMethods = [
    'extractTextFromPDF',
    'explainLegalDocument',
    'getLanguageInstructions',
    'getLanguageHeadings',
    'validateLanguage',
    'generateQuickSummary',
    'getSupportedLanguages'
  ];
  
  let missingMethods = 0;
  requiredMethods.forEach(method => {
    if (typeof geminiService[method] === 'function') {
      // Method exists (don't spam console)
    } else {
      console.log(`   ❌ Missing method: ${method}`);
      issues.push(`GeminiService missing method: ${method}`);
      missingMethods++;
      allGood = false;
    }
  });
  
  if (missingMethods === 0) {
    console.log(`   ✅ All ${requiredMethods.length} required methods present`);
  }
  
} catch (error) {
  console.log('   ❌ Error loading GeminiService:', error.message);
  issues.push('GeminiService has errors: ' + error.message);
  allGood = false;
}

// Check 5: Upload directory
console.log('\n📁 Checking upload directory...');
const uploadDir = path.join(__dirname, 'uploads', 'documents');
if (fs.existsSync(uploadDir)) {
  console.log('   ✅ Upload directory exists:', uploadDir);
  
  // Check if writable
  const testFile = path.join(uploadDir, '.test');
  try {
    fs.writeFileSync(testFile, 'test');
    fs.unlinkSync(testFile);
    console.log('   ✅ Upload directory is writable');
  } catch (e) {
    console.log('   ❌ Upload directory is NOT writable');
    issues.push('Upload directory is not writable');
    allGood = false;
  }
} else {
  console.log('   ⚠️  Upload directory does not exist (will be created automatically)');
  warnings.push('Upload directory will be created on first upload');
}

// Check 6: Test language validation
console.log('\n🌍 Testing language validation...');
try {
  const geminiService = require('./Services/geminiService');
  
  const testCases = [
    { input: 'english', expected: 'english' },
    { input: 'ENGLISH', expected: 'english' },
    { input: 'sinhala', expected: 'sinhala' },
    { input: 'tamil', expected: 'tamil' },
    { input: 'invalid', expected: 'english' },
    { input: 'French', expected: 'english' },
  ];
  
  let validationPassed = 0;
  testCases.forEach(test => {
    const result = geminiService.validateLanguage(test.input);
    if (result === test.expected) {
      validationPassed++;
    } else {
      console.log(`   ❌ Validation failed: "${test.input}" → "${result}" (expected "${test.expected}")`);
      issues.push(`Language validation error for: ${test.input}`);
      allGood = false;
    }
  });
  
  if (validationPassed === testCases.length) {
    console.log(`   ✅ Language validation working (${validationPassed}/${testCases.length} tests passed)`);
  }
} catch (error) {
  console.log('   ❌ Language validation test failed:', error.message);
  issues.push('Language validation has errors');
  allGood = false;
}

// Check 7: Unicode support
console.log('\n🔤 Testing Unicode support...');
const sinhalaTest = 'සිංහල';
const tamilTest = 'தமிழ்';

if (sinhalaTest.length === 6) {
  console.log('   ✅ Sinhala Unicode supported:', sinhalaTest);
} else {
  console.log('   ⚠️  Sinhala Unicode may have issues');
  warnings.push('Sinhala Unicode encoding issues detected');
}

if (tamilTest.length === 6) {
  console.log('   ✅ Tamil Unicode supported:', tamilTest);
} else {
  console.log('   ⚠️  Tamil Unicode may have issues');
  warnings.push('Tamil Unicode encoding issues detected');
}

// Summary
console.log('\n' + '='.repeat(60));
console.log('📊 HEALTH CHECK SUMMARY');
console.log('='.repeat(60));

if (allGood && warnings.length === 0) {
  console.log('\n✅ ALL CHECKS PASSED! System is ready to use.');
  console.log('\n🎉 You can now:');
  console.log('   1. Start the server: npm start');
  console.log('   2. Test languages: node test-multilingual-ai.js');
  console.log('   3. Upload documents via the client app');
  console.log('\n🌍 Full support for: English, සිංහල, தமிழ்\n');
} else {
  if (issues.length > 0) {
    console.log('\n❌ CRITICAL ISSUES FOUND:');
    issues.forEach((issue, index) => {
      console.log(`   ${index + 1}. ${issue}`);
    });
  }
  
  if (warnings.length > 0) {
    console.log('\n⚠️  WARNINGS:');
    warnings.forEach((warning, index) => {
      console.log(`   ${index + 1}. ${warning}`);
    });
  }
  
  console.log('\n🔧 Please fix the issues above before using the system.\n');
}

// Exit code
process.exit(allGood ? 0 : 1);

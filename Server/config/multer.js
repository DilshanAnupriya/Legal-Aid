const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('./cloudinary');
const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../uploads');
const documentsDir = path.join(uploadsDir, 'documents');

if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}
if (!fs.existsSync(documentsDir)) {
    fs.mkdirSync(documentsDir, { recursive: true });
}

// Cloudinary storage for NGO images
const ngoStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'ngo_logos',
        allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
        transformation: [
            { width: 1000, height: 1000, crop: 'limit' }, // Resize large images
            { quality: 'auto' } // Auto optimize quality
        ]
    }
});

// Cloudinary storage for Lawyer images
const lawyerStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'lawyer_logos',
        allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
        transformation: [
            { width: 1000, height: 1000, crop: 'limit' }, // Resize large images
            { quality: 'auto' } // Auto optimize quality
        ]
    }
});

// Multer instance
const lawyerUpload = multer({
  storage: lawyerStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Only image files allowed!'), false);
  }
});

// Local storage for documents (needed for OCR processing)
const documentStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, documentsDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

// NGO upload configuration
const ngoUpload = multer({
    storage: ngoStorage,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit per file
        files: 11 // Maximum 11 files (1 logo + 10 images)
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed!'), false);
        }
    }
});

// Document upload configuration
const documentUpload = multer({
    storage: documentStorage,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit for documents
        files: 1
    },
    fileFilter: (req, file, cb) => {
        const allowedMimes = [
            'image/jpeg',
            'image/png',
            'image/jpg',
            'image/gif',
            'image/bmp',
            'image/tiff',
            'application/pdf'
        ];
        
        if (allowedMimes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Only images and PDF files are allowed for document scanning!'), false);
        }
    }
});



module.exports = {
    // For NGO uploads (cloudinary)
    ngo: ngoUpload,
    fields: ngoUpload.fields.bind(ngoUpload),
    
    // For document uploads (local storage for OCR)
    document: documentUpload,
    single: documentUpload.single.bind(documentUpload),

    lawyer: lawyerUpload,
    single: lawyerUpload.single.bind(lawyerUpload),
};
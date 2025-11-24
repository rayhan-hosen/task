const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Magic number signatures for real images
const IMAGE_SIGNATURES = {
    jpg: [0xFF, 0xD8, 0xFF],
    png: [0x89, 0x50, 0x4E, 0x47],
    gif: [0x47, 0x49, 0x46, 0x38],
    webp: [0x52, 0x49, 0x46, 0x46]
};

// Check real magic number
function isRealImage(filePath) {
    const file = fs.readFileSync(filePath);
    const bytes = file.slice(0, 4);

    return (
        bytes[0] === 0xFF && bytes[1] === 0xD8 && bytes[2] === 0xFF ||                  // JPG
        (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4E && bytes[3] === 0x47) || // PNG
        (bytes[0] === 0x47 && bytes[1] === 0x49 && bytes[2] === 0x46) ||              // GIF
        (bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46)    // WEBP
    );
}

// Multer storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, unique + path.extname(file.originalname));
    }
});

// Filter based on mimetype (basic)
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Not an image'), false);
};

const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});

// Main upload controller
const uploadImage = (req, res) => {
    if (!req.file)
        return res.status(400).json({ message: 'No file uploaded' });

    const filePath = req.file.path;

    // Validate real image by signature
    if (!isRealImage(filePath)) {
        fs.unlinkSync(filePath); // delete fake file
        return res.status(400).json({ message: 'Invalid or corrupted image file' });
    }

    // Build image URL
    const imageUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    res.json({ imageUrl });
};

module.exports = { upload, uploadImage };

const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;

const uploadPath = path.join('public/', 'uploads');
let fileData = {};

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const userId = req.params.id;
    const timestamp = Date.now();
    const originalname = file.originalname;
    const newFilename = `${userId}_${timestamp}_${originalname}`;
    cb(null, newFilename);
  },
});

const fileFilter = (req, file, cb) => {
  cb(null, true);
};

const upload = multer({ storage, fileFilter });

const uploadProfilePicture = upload?.single('profilePicture');
const uploadCoverPicture = upload?.single('coverPicture');

// Middleware to delete existing profile image
const deleteExistingProfilePicture = async (user) => {
  if (user.profilePicture) {
    const imagePath = path.join(uploadPath, user.profilePicture);
    await fs.unlink(imagePath);
  }
};

const deleteExistingCoverPicture = async (user) => {
  if (user.coverPicture) {
    const imagePath = path.join(uploadPath, user.coverPicture);
    await fs.unlink(imagePath);
  }
};

module.exports = {
  uploadProfilePicture,
  uploadCoverPicture,
  deleteExistingProfilePicture,
  deleteExistingCoverPicture,
};

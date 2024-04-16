 const multer = require('multer');
const express = require('express');
const { Credential, User } = require('../models');

const router = express.Router();
const initializeCredentialModel = require('../models/credential');
const initializeUserModel = require('../models/user');


const authenticateToken = require('../middleware/auth.user.middleware');

// Function to broadcast Socket.IO messages
const broadcastSocketIoMessage = (io, header, body) => {
  io.emit(header, body);
};

module.exports = (app, io, sequelize) => {
  const path = require('path');
  const fs = require('fs');
  const Credential = initializeCredentialModel(sequelize, require('sequelize').DataTypes);
  const User = initializeUserModel(sequelize, require('sequelize').DataTypes);

  // Function to generate random 6-digit numbers
  const generateRandomNumbers = () => Math.floor(100000 + Math.random() * 900000);
  const allowedFileTypes = new Set(['image/jpeg', 'image/jpg', 'image/png']);

  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      const uploadPath = path.join('public/', 'uploads');
      cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
      const userId = req.body.userId;
      const timestamp = Date.now();
      const randomNumbers = generateRandomNumbers();
      const originalname = file.originalname;

      const newFilename = `${userId}_${timestamp}_${randomNumbers}_${originalname}`;

      cb(null, newFilename);
    },
  });

  const fileFilter = (req, file, cb) => {
    if (allowedFileTypes.has(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, DOC, DOCX, JPG, JPEG, or PNG files are allowed.'));
    }
  };

  const limits = {
    fileSize: 100 * 1024, // 100 KB limit
  };

  const upload = multer({ storage, fileFilter, limits });

  // Create a new credential
  router.post('/create', authenticateToken, (req, res) => {
    upload.fields([{ name: 'credentialFiles', maxCount: 1 }])(req, res, async (err) => {
      if (err) {
        return res.status(400).json({ status: 'failed', message: err.message });
      }
      try {
        console.log(req.body);
        console.log(req.user);
        const userId = req.body.userId;
        if ((req.user.id != userId) && (req.user.role != "admin")) {
          res.status(500).send({ status: "failed", message: 'Unknown user can not fetch credentials' });
        }
        
        const user = await User.findByPk(userId);

        if (!user) {
          return res.status(404).send({ status: "failed", message: 'User not found!' });
        }

        const credentialFile = req.files['credentialFiles'][0];

        if (!credentialFile ) {
          return res.status(400).send({ status: "failed", message: 'Credential are required.' });
        }

        const fileUrl = credentialFile.filename;
        console.log(fileUrl);

        const myCredentialData = {
          userId: userId,
          credentialName: req.body.credentialName,
          credentialDetails: req.body.credentialDetails,
          credentialFiles: fileUrl,
          credentialStatus: 'Uploaded' // Set the initial status as needed
        };

        const credential = await Credential.create(myCredentialData);

        res.status(201).send({ credential: credential, status: "success", message: 'Credential uploaded successfully!' });
      } catch (error) {
        console.error(error);
        res.status(400).send({ status: "failed", message: 'Credentials creation failed', error });
      }
    });
  });

  // Fetch all credentials of a user                                
  router.get('/user/:userId', authenticateToken, async (req, res) => {
    try {
      console.log(req.user);
      const userId = req.params.userId;
      if ((req.user.id != userId) && (req.user.role != "admin")) {
        res.status(500).send({ status: "failed", message: 'Unknown user can not fetch credentials' });
      }
      
      const credentials = await Credential.findAll({ where: { userId: userId } });
      res.send({ status: "success", credentials });
    } catch (error) {
      console.log(error);
      res.status(500).send({ status: "failed", message: 'Failed to fetch credentials', error });
    }
  });

  // Delete a credential by ID
  router.delete('/:id', async (req, res) => {
    try {
      console.log(req.user);
      const credentialId = req.params.id;
      const credential = await Credential.findByPk(credentialId);
      
      if (!credential) {
        return res.status(404).send({ status: "failed", message: 'Credential not found!' });
      }

      // checking if user have the right to delete credentials
      if ((req.user.id !== credential.userId) && (req.user.role !== "admin")) {
        res.status(500).send({ status: "failed", message: 'Unknown user can not delete credentials', error });
      }

      // Delete associated files
      const filePath = path.join('public/uploads', credential.credentialFiles);
      
      // Assuming synchronous deletion for simplicity, consider using asynchronous methods for production
      if (!fs.unlinkSync(filePath))
      {
        // Delete the credential
        await credential.destroy();
      }

      res.send({ status: "success", message: 'Credential deleted successfully!' });
    } catch (error) {
      console.error(error);
      res.status(500).send({ status: "failed", message: 'Failed to delete credential', error });
    }
  });

  app.use('/api/credentials', router);
};
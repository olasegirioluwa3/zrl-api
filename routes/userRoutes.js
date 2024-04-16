const express = require('express');
const router = express.Router();
const authenticateToken = require('../middlewares/auth.user.middleware');
const { uploadProfilePicture, deleteExistingProfilePicture, uploadCoverPicture, deleteExistingCoverPicture } = require('../middlewares/upload.user.middleware');
const phoneNumber = require('phone-number');

module.exports = (app, io, sequelize) => {
  const userController = require('../controllers/userController');
  const validateUserData = require("../middlewares/validator/userValidator");

  // Registration (handled by userController)
  router.post('/register', async (req, res) => {
    try {
      const { email, password, phoneNumber, firstName, middleName, lastName, username } = req.body;
      const { data, errors } = await validateUserData(email, password, phoneNumber, firstName, middleName, lastName, username);
      if (errors.length > 0) {
        return res.status(400).json({ errors });
      }
      await userController.registerUser(req, res, data);
    } catch (error) {
      console.error(error);
      res.status(500).send({ status: "failed", message: 'Register failed on R', error: error.message });
    }
  });

  router.post('/login', async (req, res) => {
    try {
      const { email, password } = req.body;
      const { data, errors } = await validateUserData(email, password);
      if (errors.length > 0) {
        return res.status(400).json({ errors });
      }
      await userController.loginUser(req, res, data);
    } catch (error) {
      console.error(error);
      res.status(500).send({ status: "failed", message: 'Login failed', error: error.message });
    }
  });

  router.post('/profile', authenticateToken, async (req, res) => {
    try {
      await userController.getProfile(req, res);
    } catch (error) {
      console.error(error);
      res.status(500).json({ status: "failed", message: 'Failed to fetch profile', error: error.message });
    }
  });

  router.put('/:id', authenticateToken, async (req, res) => {
    try {
      await userController.updateProfile(req, res);
    } catch (error) {
      console.error(error);
      res.status(500).send({ status: "failed", message: 'Failed to update user profile', error });
    }
  });

  router.put('/:id/profilepicture', authenticateToken, uploadProfilePicture, async (req, res) => {
    try {
      await userController.updateProfilePicture(req, res);
    } catch (error) {
      console.error(error);
      res.status(500).send({ status: "failed", message: 'Failed to update user profile picture', error });
    }
  });

  router.put('/:id/coverpicture', authenticateToken, uploadCoverPicture, async (req, res) => {
    try {
      await userController.updateCoverPicture(req, res);
    } catch (error) {
      console.error(error);
      res.status(500).send({ status: "failed", message: 'Failed to update user profile cover picture', error });
    }
  });

  router.post('/username/:username', async (req, res) => {
    try {
      await userController.getUserByUsername(req, res);
    } catch (error) {
      console.error(error);
      res.status(500).send({ status: "failed", message: 'Failed to fetch profile', error: error.message });
    }
  });
  
  router.post('/forgot-password', async (req, res) => {
    try {
      const { email } = req.body;
      const { data, errors } = await validateUserData(email);
      if (errors.length > 0) {
        return res.status(400).json({ errors });
      }
      await userController.forgotPassword(req, res, data);
    } catch (error) {
      console.error(error);
      res.status(500).send({ status: "failed", message: 'Failed to send reset password link', error: error.message });
    }
  });

  router.post('/verify-account-email/:emailVerificationToken', async (req, res, data) => {
    try {
      const { emailVerificationToken } = req.params;
      const { data, errors } = await validateUserData(null, null, null, null, null, null, null, null, emailVerificationToken);
      if (errors.length > 0) {
        return res.status(400).json({ errors });
      }
      await userController.verifyAccountEmail(req, res, data);
    } catch (error) {
      console.error(error);
      res.status(500).send({ status: "failed", message: 'Failed to reset password', error: error.message });
    }
  });

  router.post('/forgot-password-init/:resetPasswordToken', async (req, res) => {
    try {
      const { resetPasswordToken } = req.params;
      const { data, errors } = await validateUserData(null, null, null, null, null, null, null, null, null, resetPasswordToken);
      if (errors.length > 0) {
        return res.status(400).json({ errors });
      }
      await userController.resetPasswordInit(req, res, data);
    } catch (error) {
      console.error(error);
      res.status(500).send({ status: "failed", message: 'Failed to reset password', error: error.message });
    }
  });

  router.post('/forgot-password-final', async (req, res) => {
    try {
      const { resetPasswordToken, password } = req.body;
      const { data, errors } = await validateUserData(null, password, null, null, null, null, null, null, null, resetPasswordToken);
      if (errors.length > 0) {
        return res.status(400).json({ errors });
      }
      await userController.resetPasswordFinal(req, res, data);
    } catch (error) {
      console.error(error);
      res.status(500).send({ status: "failed", message: 'Failed to reset password', error: error.message });
    }
  });

  router.post('/reset-password', authenticateToken, async (req, res) => {
    try {
      await userController.resetPassword(req, res);
    } catch (error) {
      console.error(error);
      res.status(500).send({ status: "failed", message: 'Failed to reset password', error: error.message });
    }
  });
  
  router.get('/', (req, res) => {
    res.status(200).send({ status: "success", message: 'API user called' });
  });

  app.use('/api/users', router);
};
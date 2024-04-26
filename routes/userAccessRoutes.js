const express = require('express');
const router = express.Router();
const authenticateToken = require('../middlewares/auth.user.middleware');
const { sendSMS } = require('../utils/sms');

module.exports = (app, io, sequelize) => {
  const userController = require('../controllers/userController');
  const userAccessController = require('../controllers/userAccessController');
  const validateUserAccessData = require("../middlewares/validator/userAccessValidator");

  // Registration (handled by userController)
  router.post('/invite', authenticateToken, async (req, res) => {
    try {
      // check if the request is from a verified user
      const { data, errors } = await validateUserAccessData( req.body );
      if (errors.length > 0) {
        return res.status(400).json({ errors });
      }
      data.inviteBy = req.user.id;
      await userAccessController.invite(req, res, data);
    } catch (error) {
      console.error(error);
      res.status(500).send({ status: "failed", message: 'Register failed on R', error: error.message });
    }
  });

  // Registration (handled by userController)
  router.post('/get-all', authenticateToken, async (req, res) => {
    try {
      // check if the request is from a verified user
      const data = {};
      data.userId = req.user.id;
      await userAccessController.getAll(req, res, data);
    } catch (error) {
      console.error(error);
      res.status(500).send({ status: "failed", message: 'Register failed on R', error: error.message });
    }
  });

  router.get('/', (req, res) => {
    res.status(200).send({ status: "success", message: 'Whatsapp API called' });
  });

  app.use('/api/useraccess', router);
};
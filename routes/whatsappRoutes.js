const express = require('express');
const router = express.Router();
const authenticateToken = require('../middlewares/auth.user.middleware');
const { sendSMS } = require('../utils/sms');

module.exports = (app, io, sequelize) => {
  const userController = require('../controllers/userController');
  const whatsappController = require('../controllers/whatsappController');
  const validateWhatsappData = require("../middlewares/validator/whatsappValidator");

  // Registration (handled by userController)
  router.post('/create-init', authenticateToken, async (req, res) => {
    try {
      // check if the user is real      
      console.log(req.user);
      // check if the request is from a verified user
      const { whatsappNumber, svId } = req.body;
      const { data, errors } = await validateWhatsappData( whatsappNumber, null, null, null, null, null, null, svId );
      if (errors.length > 0) {
        return res.status(400).json({ errors });
      }
      await whatsappController.sendWhatsappVerifyToken(req, res, data);
    } catch (error) {
      console.error(error);
      res.status(500).send({ status: "failed", message: 'Register failed on R', error: error.message });
    }
  });

  // Registration (handled by userController)
  router.post('/create', authenticateToken, async (req, res) => {
    try {
      // check if the request is from a verified user
      const { whatsappNumber, whatsappNumberToken, businessName, businessDesc, businessEmail } = req.body;
      const { data, errors } = await validateWhatsappData( whatsappNumber, whatsappNumberToken, businessName, businessDesc, businessEmail );
      data.userId = req.user.id;
      if (errors.length > 0) {
        return res.status(400).json({ errors });
      }
      await whatsappController.registerWhatsapp(req, res, data);
    } catch (error) {
      console.error(error);
      res.status(500).send({ status: "failed", message: 'Register failed on R', error: error.message });
    }
  });

  // Registration (handled by userController)
  router.post('/view-all', authenticateToken, async (req, res) => {
    try {
      // check if the request is from a verified user
      const data = {};
      data.userId = req.user.id;
      await whatsappController.getAllWhatsapp(req, res, data);
    } catch (error) {
      console.error(error);
      res.status(500).send({ status: "failed", message: 'Register failed on R', error: error.message });
    }
  });

  router.post('/:id/webhook', async (req, res) => {
    try {
      const { id } = req.params;
      const input = {};
      input.id = id;
      const { data, errors } = await validateWhatsappData( input );
      if (errors.length > 0) {
        return res.status(400).json({ errors });
      }
      await whatsappController.incomingMessage(req, res, data, openai);
    } catch (error) {
      console.error(error);
      res.status(500).send({ status: "failed", message: 'Verify failed on R', error: error.message });
    }
  });

  router.get('/:id/webhook', async (req, res) => {
    try {
      const { id } = req.params;
      const input = {};
      input.id = id;
      const { data, errors } = await validateWhatsappData( input );
      if (errors.length > 0) {
        return res.status(400).json({ errors });
      }
      await whatsappController.verifyWhatsapp(req, res, data);
    } catch (error) {
      console.error(error);
      res.status(500).send({ status: "failed", message: 'Verify failed on R', error: error.message });
    }
  });

  router.get('/', (req, res) => {
    res.status(200).send({ status: "success", message: 'Whatsapp API called' });
  });

  app.use('/api/whatsapp', router);
};
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
      console.log("/api/whatsapp/create-init");
      const { data, errors } = await validateWhatsappData( req.body );
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
      console.log("/api/whatsapp/create");
      const { data, errors } = await validateWhatsappData( req.body );
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
      console.log("/api/whatsapp/view-all");
      const data = {};
      data.userId = req.user.id;
      await whatsappController.getAllWhatsapp(req, res, data);
    } catch (error) {
      console.error(error);
      res.status(500).send({ status: "failed", message: 'Register failed on R', error: error.message });
    }
  });

  router.post('/:saId/webhook', async (req, res) => {
    try {
      const { saId } = req.params; 
      const input = {};
      input.saId = saId;
      const { data, errors } = await validateWhatsappData( input );
      if (errors.length > 0) {
        return res.status(400).json({ errors });
      }
      await whatsappController.incomingMessage(req, res, data);
    } catch (error) {
      console.error(error);
      res.status(500).send({ status: "failed", message: 'Verify failed on R', error: error.message });
    }
  });

  router.get('/:saId/webhook', async (req, res) => {
    try {
      const { saId } = req.params; 
      const input = {};
      input.saId = saId;
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
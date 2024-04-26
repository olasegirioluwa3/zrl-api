const express = require('express');
const router = express.Router();
const authenticateToken = require('../middlewares/auth.user.middleware');
const phoneNumber = require('phone-number');

module.exports = (app, io, sequelize) => {
  const serviceAccessController = require('../controllers/serviceAccessController');
  const validateServiceAccessData = require("../middlewares/validator/serviceAccessValidator");

  router.post('/', authenticateToken, async (req, res) => { 
    try {
      let data = {};
      const serviceaccess = await serviceAccessController.getAll(req, res, data);
    } catch (error) {
      console.log(error);
      res.status(500).send({ status: "failed", message: 'Failed to fetch services', error });
    }
  });

  router.post('/create', async (req, res) => { 
    try {
      const { svId, productId, amountPaid, paymentReference, paymentAuthorizer, currency } = req.body;
      const { data, errors } = await validateServiceAccessData(req.body);
      if (errors.length > 0) {
        return res.status(400).json({ errors });
      }
      console.log(data);
      await serviceAccessController.createServiceAccess(req, res, data);
    } catch (error) {
      console.log(error);
      res.status(500).send({ status: "failed", message: 'Failed to create service access', error });
    }
  });
  
  app.use('/api/serviceaccess', router);
}
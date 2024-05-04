const express = require('express');
const router = express.Router();
const authenticateToken = require('../middlewares/auth.user.middleware');

module.exports = (app, io, sequelize) => {
  const paymentController = require('../controllers/paymentController');
  const serviceAccessController = require('../controllers/serviceAccessController');
  const validatePaymentData = require("../middlewares/validator/paymentValidator");


  router.post('/create', authenticateToken, async (req, res) => {
    try {
      const { data, errors } = await validatePaymentData(req.body);
      if (errors.length > 0) {
        return res.status(400).json({ errors });
      }
      console.log(data);
      await paymentController.create(req, res, data);
    } catch (error) {
      console.log(error);
      res.status(400).send({ status: "failed", message: 'Failed to record payment', error });
    }
  });

  // Update payment status by payment reference
  router.post('/:paymentReference', async (req, res) => {
    try {
      const { paymentReference } = req.params;
      let data = {};
      data.paymentReference = paymentReference;
      const payment = await paymentController.getOne(req, res, data);
    } catch (error) {
      console.log(error);
      res.status(500).send({ status: "failed", message: 'Failed to update payment status', error });
    }
  });

  // Update payment status by payment reference
  router.post('/payment-status/:paymentReference', async (req, res) => {
    try {
      const { paymentReference } = req.params;
      let data = {};
      data.paymentReference = paymentReference;
      const payment = await paymentController.verify(req, res, data);
    } catch (error) {
      console.log(error);
      res.status(500).send({ status: "failed", message: 'Failed to update payment status', error });
    }
  });

  app.use('/api/payment', router);
};
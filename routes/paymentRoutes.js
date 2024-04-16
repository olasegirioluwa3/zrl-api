const express = require('express');
const router = express.Router();
const initializeApplicationModel = require('../models/whatsapp');
const initializeUserModel = require('../models/user');
const initializePaymentModel = require('../models/serviceaccess');
const initializeServiceTypeModel = require('../models/service');

module.exports = (app, io, sequelize) => {
  const PaystackGateway = require('../services/gateways/paystackGateway');
  const StripeGateway = require('../services/gateways/stripeGateway');
  const PaymentGateway = require('../services/gateways/paymentGateway');
  const Application = initializeApplicationModel(sequelize, require('sequelize').DataTypes);
  const User = initializeUserModel(sequelize, require('sequelize').DataTypes);
  const Payment = initializePaymentModel(sequelize, require('sequelize').DataTypes);
  const ServiceType = initializeServiceTypeModel(sequelize, require('sequelize').DataTypes);
  // Record a new payment
  router.post('/record', async (req, res) => {
    try {
      const applicationId = req.body.applicationId;
      const callbackURL = req.body.callbackURL;
      const application = await Application.findByPk(applicationId);
      
      if (!application) return res.status(404).send({ status: "failed", message: 'Application not found!' });
      
      const user = await User.findByPk(application.userId);
      if (!user) return res.status(404).send({ status: "failed", message: 'User not found!' });
      var data = {
        email: user.email,
        full_name: user.firstName+' '+user.lastName
      }
      const { amount, currency, gateway } = req.body;

      let paymentGateway = PaymentGateway;
      if (gateway === 'Paystack') {
          paymentGateway = new PaystackGateway();
      } else if (gateway === 'Stripe') {
        console.log('sp');
          paymentGateway = new StripeGateway();
      } else {
          return res.status(400).send({ status: "failed", error: 'Invalid payment gateway' });
      }

      const callbackUrl = callbackURL || process.env.PAYMENT_CALLBACK_URL;
      const paymentDetails = await paymentGateway.initiatePayment(amount, currency, data, callbackUrl);
      // console.log(paymentDetails.data);

      // Create a payment
      req.body.paymentReference = paymentDetails.data.reference;
      
      const payment = await Payment.create(req.body);

      res.status(201).send({ payment, paymentDetails, status: "success", message: 'Payment recorded successfully!' });
    } catch (error) {
      console.log(error);
      res.status(400).send({ status: "failed", message: 'Failed to record payment', error });
    }
  });

  // Update payment status by payment reference
  router.patch('/update-status/:paymentReference', async (req, res) => {
    try {
      const { paymentReference } = req.params;
      // const paymentReference = req.params.paymentReference;
      const payment = await Payment.findOne({ where: { paymentReference: paymentReference } });
      if (!payment) return res.status(404).send({ status: "failed", message: 'Payment not found!' });
      var application = await Application.findByPk(payment.applicationId);

      const { gateway } = req.body;  // Assuming you send the gateway as part of the request body

      let paymentGateway;
      if (gateway === 'Paystack') { 
          paymentGateway = new PaystackGateway();
      } else if (gateway === 'Stripe') {
          paymentGateway = new StripeGateway();
      } else {
          return res.status(400).send({ status: "failed", error: 'Invalid payment gateway' });
      }

      // check paystack for payment status
      const verificationDetails = await paymentGateway.verifyPayment(paymentReference);

      // checking my payment status
      if (verificationDetails.data.status === 'success') {
        payment.paymentStatus = "Completed";
        payment.amount = verificationDetails.data.amount / 100;
        console.log(verificationDetails.data);
        application.applicationStatus = "Processing";
        await application.save();
      } else if (verificationDetails.status === 'failed') {
        payment.paymentStatus = "Failed";
      }

      // saving to database
      await payment.save();
       

      res.send({ payment, verificationDetails, status: "success", message: 'Payment status updated successfully!' });
    } catch (error) {
      console.log(error);
      res.status(500).send({ status: "failed", message: 'Failed to update payment status', error });
    }
  });

  // Update payment status by payment reference
  router.patch('/payment-status/:paymentReference', async (req, res) => {
    try {
      const { paymentReference } = req.params;
      // const paymentReference = req.params.paymentReference;
      const payment = await Payment.findOne({ where: { paymentReference: paymentReference } });
      if (!payment) return res.status(404).send({ status: "failed", message: 'Payment not found!' });
      var application = await Application.findByPk(payment.applicationId);

      const { gateway } = req.body;  // Assuming you send the gateway as part of the request body

      let paymentGateway;
      if (gateway === 'Paystack') { 
          paymentGateway = new PaystackGateway();
      } else if (gateway === 'Stripe') {
          paymentGateway = new StripeGateway();
      } else {
          return res.status(400).send({ status: "failed", error: 'Invalid payment gateway' });
      }

      // check paystack for payment status
      const verificationDetails = await paymentGateway.verifyPayment(paymentReference);

      // checking my payment status
      if (verificationDetails.data.status === 'success') {
        payment.paymentStatus = "Completed";
        payment.amount = verificationDetails.data.amount / 100 ;
      } else if (verificationDetails.status === 'failed') {
        payment.paymentStatus = "Failed";
      }

      // saving to database
      await payment.save();
       

      res.send({ payment, verificationDetails, status: "success", message: 'Payment status updated successfully!' });
    } catch (error) {
      console.log(error);
      res.status(500).send({ status: "failed", message: 'Failed to update payment status', error });
    }
  });

  // // Update payment status by payment reference
  // router.patch('/validate/:paymentReference', async (req, res) => {
  //   try {
  //     const { paymentReference } = req.params;
  //     const payment = await Payment.findOne({ where: { paymentReference: paymentReference } });
  //     if (!payment) return res.status(404).send({ status: "failed", message: 'Payment not found!' });
  //     var application = await Application.findByPk(payment.applicationId);

  //     var data = {
  //       email: user.email,
  //       full_name: user.firstName+' '+user.lastName
  //     }
  //     const { amount, currency, gateway } = req.body;

  //     let paymentGateway;
  //     if (gateway === 'Paystack') { 
  //         paymentGateway = new PaystackGateway();
  //     } else if (gateway === 'Stripe') {
  //         paymentGateway = new StripeGateway();
  //     } else {
  //       return res.status(400).send({ status: "failed", error: 'Invalid payment gateway'});
  //     }

  //     // check paystack for payment status
  //     const verificationDetails = await paymentGateway.verifyPayment(paymentReference);

  //     // checking my payment status
  //     if (verificationDetails.data.status === 'success') {
  //       payment.paymentStatus = "Completed";
  //       payment.amount = verificationDetails.data.amount;
  //       application.applicationStatus = "Processing";
  //       await application.save();
  //     } else if (verificationDetails.status === 'failed') {
  //       const callbackUrl = callbackURL || process.env.PAYMENT_CALLBACK_URL;
  //       const paymentDetails = await paymentGateway.initiatePayment(amount, currency, data, callbackUrl);
  //       req.body.paymentReference = paymentDetails.data.reference;
  //     }
      
  //     // saving to database
  //     await payment.save();

  //     res.send({ payment, verificationDetails, status: "success", message: 'Payment status updated successfully!'});
  //   } catch (error) {
  //     console.log(error);
  //     res.status(500).send({ status: "failed", message: 'Failed to update payment status', error });
  //   }
  // });
  
  // Fetch all payments type for a user
  router.post('/payment-type/:programId', async (req, res) => { 
    try {
      const programId = req.params.programId;
      console.log(programId);
      const paymentsTypes = await ServiceType.findAll({ where: { programId: programId } });
      res.send({ status: "success", paymentsTypes });
    } catch (error) {
      res.status(500).send({ status: "failed", message: 'Failed to fetch paymentsTypes', error });
    }
  });
  router.get('/payment-type/:programId', async (req, res) => { 
    try {
      const programId = req.params.programId;
      console.log(programId);
      const paymentsTypes = await ServiceType.findAll({ where: { programId: programId } });
      res.send({ status: "success", paymentsTypes });
    } catch (error) {
      res.status(500).send({ status: "failed", message: 'Failed to fetch paymentsTypes', error });
    }
  });

  // Fetch all payments of a user's application
  router.post('/application/:applicationId', async (req, res) => { 
    try {
      const applicationId = req.params.applicationId;
      console.log(applicationId);
      const payments = await Payment.findAll({ where: { applicationId: applicationId } });
      res.send({ status: "success", payments });
    } catch (error) {
      res.status(500).send({ status: "failed", message: 'Failed to fetch payments', error });
    }
  });
  router.get('/application/:applicationId', async (req, res) => { 
    try {
      const applicationId = req.params.applicationId;
      console.log(applicationId);
      const payments = await Payment.findAll({ where: { applicationId: applicationId } });
      res.send({ status: "success", payments });
    } catch (error) {
      res.status(500).send({ status: "failed", message: 'Failed to fetch payments', error });
    }
  });
  
  app.use('/api/payments', router);
};
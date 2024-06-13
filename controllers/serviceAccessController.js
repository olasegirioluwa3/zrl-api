const Sequelize = require('sequelize'); // Import Sequelize
const { sequelize } = require('../models');
const User = sequelize.models.user;
const ServiceType = sequelize.models.service;
const ServiceAccess = sequelize.models.serviceaccess;
const Payment = sequelize.models.payment
const { sendEmail } = require("../utils/email");
const PaymentGateway = require("../services/gateways/paymentGateway");
const PaystackGateway = require("../services/gateways/paystackGateway");
const StripeGateway = require("../services/gateways/stripeGateway");

async function getAll(req, res, data) {
  try {
    const serviceaccess = await ServiceAccess.findAll();
    if (!serviceaccess){
      return res.status(401).json({ message: 'No Service Access was found, try again' });
    }
    return res.status(200).json({ status: "success", serviceaccess });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Registration failed on C" });
  }
}

async function getOne(req, res, data) {
  try {
    const serviceaccess = await ServiceAccess.findByPk(data.id);
    if (!serviceaccess){
      return res.status(401).json({ message: 'No Service Access was found, try again' });
    }
    return res.status(200).json({ status: "success", serviceaccess });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: "Registration failed on C" });
  }
}

async function activateServiceAccess(req, res, data) {
  try {
    const userId = req.user.id;
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(400).send({ status: "failed", error: 'Unknown user' });
    }

    // get data from service
    const serviceaccess = await ServiceAccess.findByPk(data.saId);
    if (!serviceaccess) {
      return res.status(400).send({ status: "failed", error: 'Unknown service access' });
    }

    if (serviceaccess.status !== "Init") {
      return res.status(400).send({ status: "failed", error: 'service access do not need to be reactivated' });
    }

    // get data from service
    const service = await ServiceType.findByPk(serviceaccess.svId);
    if (!service) {
      return res.status(400).send({ status: "failed", error: 'Unknown service' });
    }

    // switch to check if user have access to svProductId
    const paymentData = {};
    if (serviceaccess) {
      // initiate payment
      paymentData.userId = req.user.id;
      paymentData.email = user.email;
      paymentData.full_name = user.firstName+' '+user.lastName
      paymentData.saId = serviceaccess.id;

      // get cost info of the service
      paymentData.gateway = data.gateway || service.svPaymentGateway;
      paymentData.currency = data.currency || service.svPaymentCurrency;
      
      // Calculate price and paymentNextDate
      let quantity = parseInt(data.quantity, 10) || 1;
      quantity = Math.max(quantity, 1);
      paymentData.quantity = quantity;
      let price;
      let paymentNextDate = new Date();
      paymentNextDate.setMonth(paymentNextDate.getMonth() + quantity);
      if (quantity>1){
        price = (parseInt(service.svFirstPaymentAmount, 10)) + (parseInt(service.svPaymentAmount, 10) * (quantity-1));
      } else {
        price = parseInt(service.svFirstPaymentAmount, 10);
      }
      
      let paymentGateway = PaymentGateway;
      let finalAmount;

      if (paymentData.gateway === 'Paystack') {
        paymentGateway = new PaystackGateway();
        const decimalFee = 1.95 / 100.0;
        const flatFee = (parseInt(price, 10) * (1.5 / 100)) + 100;
        const capFee = 2000.0;
        const applicableFees = (parseInt(decimalFee, 10) * parseInt(price, 10)) + parseInt(flatFee, 10);
        finalAmount = applicableFees >= capFee ? parseInt(price, 10) + parseInt(capFee, 10) : ((parseInt(price, 10) + parseInt(flatFee, 10)) / (1 - parseInt(decimalFee, 10))) + 0.01;
      } else if (paymentData.gateway === 'Stripe') {
        paymentGateway = new StripeGateway();
      } else {
        return res.status(400).send({ status: "failed", error: 'Invalid payment gateway' });
      }
      paymentData.amount = finalAmount;
      const callbackUrl = process.env.PAYMENT_CALLBACK_URL || callbackURL;
      const paymentDetails = await paymentGateway.initiatePayment(paymentData.amount, paymentData.currency, paymentData, callbackUrl);
      if (!paymentDetails){
        return res.status(400).send({ status: "failed", error: 'Initiating payment failed' });
      }
      // Create a payment
      paymentData.amountPaid = '0';
      paymentData.paymentReference = paymentDetails.data.reference;
      paymentData.paymentNextDate = paymentNextDate;
      const payment = await Payment.create(paymentData);
      if (!payment){
        return res.status(400).send({ status: "failed", error: 'Create payment failed' });
      } else {
        return res.status(201).send({ payment, paymentDetails, status: "success", message: 'Registration and Payment recorded successfully!' });
      }
    } else {
      return res.status(401).json({ status: "failed", message: "serviceaccess creation failed, try again" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Create Service Access failed on C" });
  }
}

module.exports = {
  getAll,
  getOne,
  activateServiceAccess
};

const crypto = require('crypto');
const Sequelize = require('sequelize'); // Import Sequelize
const { sequelize } = require('../models');
const { sendEmail } = require("../utils/email");
const domain = process.env.APP_WEBSITE_URL || "localhost:3000";
const { generateRandomNumber } = require("../utils/encrypt");
const generateToken = () => {
  return crypto.randomBytes(20).toString('hex');
};
const Payment = sequelize.models.payment;
const User = sequelize.models.user;
const ServiceAccess = sequelize.models.serviceaccess;
const ServiceType = sequelize.models.service;
const PaymentGateway = require("../services/gateways/paymentGateway");
const PaystackGateway = require("../services/gateways/paystackGateway");
const StripeGateway = require("../services/gateways/stripeGateway");

async function create(req, res, data) {
  try {
    const user = await User.findByPk(req.user.id);
    if (!user) return res.status(400).send({ status: "failed", error: 'Unknown user' });

    // get cost info of the service
    let paymentData = {};
    const serviceaccess = await ServiceAccess.findByPk(data.saId);
    if (serviceaccess) {
      // get data from service
      const service = await ServiceType.findByPk(serviceaccess.svId);
      if (!service) {
        return res.status(400).send({ status: "failed", error: 'Unknown service' });
      }
      
      // initiate payment
      paymentData.userId = req.user.id;
      paymentData.email = user.email;
      paymentData.full_name = user.firstName+' '+user.lastName
      paymentData.saId = serviceaccess.id;
      
      // get cost info of the service
      paymentData.gateway = data.gateway || service.svPaymentGateway;
      paymentData.currency = data.currency || service.svPaymentCurrency;
      
      // Calculate price and paymentNextDate
      let quantity = parseInt(data.quantity, 10);
      let price = parseInt(service.svPaymentAmount, 10);;
      let paymentNextDate = new Date();
      if (!quantity || isNaN(quantity) || quantity < 2) {
        console.log(serviceaccess.paymentNextMonth)
        paymentNextDate.setMonth(paymentNextDate.getMonth() + 1);
      } else {
        paymentNextDate.setMonth(paymentNextDate.getMonth() + (1 * quantity));
        price = parseInt(service.svPaymentAmount, 10) * quantity;
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

      // Create a payment
      paymentData.amountPaid = '0';
      paymentData.paymentReference = paymentDetails.data.reference;
      paymentData.paymentNextDate = paymentNextDate;
      console.log(paymentData);
      const payment = await Payment.create(paymentData);
      if (!payment){
        return res.status(400).send({ status: "failed", error: 'Create payment failed' });
      } else {
        return res.status(201).send({ payment, paymentDetails, status: "success", message: 'Payment recorded successfully!' });
      }
    } else {
      return res.status(400).send({ status: "failed", error: 'Invalid Service Access Id saId' });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Create payment failed on C", error });
  }
}

async function getAll(req, res, data) {
  try {
    const user = await User.findByPk(data.userId);
    const whatsapp = await Whatsapp.findAll({ userId: user.id });
    
    if (!whatsapp){
      return res.status(401).json({ message: 'Whatsapp registration failed, Invalid Token, try again' });
    }

    return res.status(200).json({ status: "success", whatsapp });
  } catch (error) {
    console.error(error.message);
    if (error instanceof Sequelize.UniqueConstraintError) {
      res.status(400).json({ message: "Email already exists" });
    } else {
      res.status(500).json({ message: "Registration failed on C" });
    }
  }
}

async function getOne(req, res, data) {
  try {
    const payment = await await Payment.findOne({ where: { paymentReference: data.paymentReference } });
    if (!payment){
      return res.status(401).json({ message: 'No payment found, Try again' });
    }
    return res.status(200).json({ status: "success", payment });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: "get one payment failed on C" });
  }
}

async function verify(req, res, data) {
  try {
    const payment = await Payment.findOne({ where: { paymentReference: data.paymentReference } });
    if (!payment){
      return res.status(401).json({ message: 'No payment found, Try again' });
    }
    
    let serviceaccess = await ServiceAccess.findByPk(payment.saId);
    
    const gateway = payment.gateway;
    const paymentReference = payment.paymentReference;

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
      payment.amountPaid = verificationDetails.data.amount / 100.0;
      serviceaccess.status = "Active";
      serviceaccess.amountPaid = verificationDetails.data.amount / 100.0;
      
      // check if payment is not already used
      if (payment.paymentFullfilled !== "Yes") {
        console.log("not yet ready");
        payment.paymentFullfilled = "Yes";
        serviceaccess.paymentNextDate = payment.paymentNextDate;
        // update serviceAccess
        
        // :adding the total months to the sa expire.
        await serviceaccess.save();
      }
    } else if (verificationDetails.status === 'failed') {
      payment.paymentStatus = "Failed";
    }
    await payment.save();
    return res.send({ payment, verificationDetails, status: "success", message: 'Payment status updated successfully!' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "get one payment failed on C" });
  }
}

module.exports = {
  create,
  getAll,
  getOne,
  verify
};
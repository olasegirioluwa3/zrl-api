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
const Service = sequelize.model.service;
const PaymentGateway = require("../services/gateways/paymentGateway");
const PaystackGateway = require("../services/gateways/paystackGateway");
const StripeGateway = require("../services/gateways/stripeGateway");

// module.exports = () => {
async function create(req, res, data) {
  try {
    const user = await User.findByPk(data.userId);
    if (!user) return res.status(404).send({ status: "failed", message: 'User not found!' });

    data.email = user.email,
    data.full_name = user.firstName+' '+user.lastName
    
    // get cost info of the service
    const serviceaccess = await ServiceAccess.findByPk(data.saId);

    console.log(serviceaccess);
    const { amount, currency, gateway } = req.body;
    let paymentGateway = PaymentGateway;
    if (gateway === 'Paystack') {
      paymentGateway = new PaystackGateway();
    } else if (gateway === 'Stripe') {
      paymentGateway = new StripeGateway();
    } else {
      return res.status(400).send({ status: "failed", error: 'Invalid payment gateway' });
    }
    const callbackUrl = process.env.PAYMENT_CALLBACK_URL || callbackURL;
    const paymentDetails = await paymentGateway.initiatePayment(amount, currency, data, callbackUrl);
    // Create a payment
    data.paymentReference = paymentDetails.data.reference;
    data.amountPaid = '0';
    const payment = await Payment.create(data);
    res.status(201).send({ payment, paymentDetails, status: "success", message: 'Payment recorded successfully!' });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Create payment failed on C", error });
  }
}

async function registerWhatsapp(req, res, data) {
  try {
    const user = await User.findByPk(req.user.id);
    const whatsapp = await Whatsapp.findOne({ whatsappNumber: data.whatsappNumber, whatsappNumberToken: data.whatsappNumberToken, userId: user.id });
    
    if (!whatsapp){
      return res.status(401).json({ message: 'Whatsapp registration failed, Invalid Token, try again' });
    }

    whatsapp.businessName = data.businessName;
    whatsapp.businessDesc = data.businessDesc;
    whatsapp.businessEmail = data.businessEmail;
    whatsapp.userId = user.id;
    whatsapp.status = "Accepted";
    console.log(data);
    if (await whatsapp.save()){
      const link = `${domain}/whatsapp/learn-more`;
      const emailText = `Welcome to the automated whatsapp experience, click on this link to learn how to set things up: ${link}`;
      await sendEmail(user.email, 'Whatsapp Number Added successfully', emailText)
      return res.status(201).json({ message: 'Registration successful', whatsapp });
    } else {
      return res.status(401).json({ message: 'Registration failed, try again' });
    }
  } catch (error) {
    console.error(error.message);
    if (error instanceof Sequelize.UniqueConstraintError) {
      res.status(400).json({ message: "Email already exists" });
    } else {
      res.status(500).json({ message: "Registration failed on C" });
    }
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
    
    let serviceaccess = await serviceAccessController.findByPk(payment.saId);
    
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
      payment.amount = verificationDetails.data.amount / 100;
      serviceaccess.status = "Completed";
      
      // check if payment is not already used
      if (payment.paymentFullfulled !== "Yes") {
        console.log("not yet ready");
        payment.paymentFullfulled = "Yes";
        serviceaccess.paymentNextDate = payment.paymentNextDate;
        // update serviceAccess
        // :change the status back to active
        
        // :adding the total months to the sa expire.
        await serviceaccess.save();
      }
    } else if (verificationDetails.status === 'failed') {
      payment.paymentStatus = "Failed";
    }
    await payment.save();
    return res.send({ payment, verificationDetails, status: "success", message: 'Payment status updated successfully!' });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: "get one payment failed on C" });
  }
}

module.exports = {
  create,
  getAll,
  getOne,
  verify
};

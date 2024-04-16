const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const Sequelize = require('sequelize'); // Import Sequelize
const { sequelize } = require('../models');
const User = sequelize.models.user;
const Whatsapp = sequelize.models.whatsapp;
const validateUserData = "../middlewares/validator/index";
const { sendEmail } = require("../utils/email");
const { sendSMS } = require("../utils/sms");
const domain = process.env.APP_WEBSITE_URL || "localhost:3000";
const { generateRandomNumber, encryptNumber, decryptNumber } = require("../utils/encrypt");

const generateToken = () => {
  return crypto.randomBytes(20).toString('hex');
};

// module.exports = () => {
async function sendWhatsappVerifyToken(req, res, data) {
  try {
    // encrypt number
    const whatsappNumber = data.whatsappNumber;
    const theEncryptedNumber = generateRandomNumber();
    data.whatsappNumberToken = theEncryptedNumber;
    
    const user = await User.findByPk(req.user.id);
    data.userId = user.id;
    const newWhatsapp = new Whatsapp(data);
    if (await newWhatsapp.save(data)){
      // const sendingStatus = true; //await sendSMS(whatsappNumber, "activation token: "+theEncryptedNumber, "ZRL");
      const sendingStatus = await sendSMS(whatsappNumber, "activation token: "+theEncryptedNumber, "ZRL");
      if (sendingStatus){
        const link = `${domain}/verify-email/${theEncryptedNumber}`;
        const emailText = `Welcome to the automated whatsapp experience, click on this link to learn how to set things up: ${link}`;
        await sendEmail([user.email, data.businessEmail], 'Whatsapp Number Added successfully', emailText)
        return res.status(201).json({ message: 'Registration successful' });
      } else {
        return res.status(401).json({ status: "failed", message: 'Token sending failed, please, try again' });
      }
    } else {
      return res.status(401).json({ message: 'Registration failed, try again' });
    }
  } catch (error) {
    console.error(error);
    if (error instanceof Sequelize.UniqueConstraintError) {
      res.status(400).json({ message: "Whatsapp number already exists" });
    } else {
      res.status(500).json({ message: "Registration failed on C" });
    }
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

async function getAllWhatsapp(req, res, data) {
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

module.exports = {
    registerWhatsapp,
    sendWhatsappVerifyToken,
    getAllWhatsapp
};

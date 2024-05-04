const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const Sequelize = require('sequelize'); // Import Sequelize
const { sequelize } = require('../models');
const User = sequelize.models.user;
const UserAccess = sequelize.models.useraccess;
const Whatsapp = sequelize.models.whatsapp;
const validateUserData = "../middlewares/validator/index";
const { sendEmail } = require("../utils/email");
const { sendSMS } = require("../utils/sms");
const domain = process.env.APP_WEBSITE_URL || "localhost:3000";
const { generateRandomNumber, encryptNumber, decryptNumber } = require("../utils/encrypt");

const generateToken = () => {
  return crypto.randomBytes(20).toString('hex');
};

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
      console.log(newWhatsapp.id);
      const sa_data = {};
      sa_data.svId = newWhatsapp.svId;
      sa_data.svProductId = newWhatsapp.id;
      sa_data.userId = newWhatsapp.userId;
      sa_data.role = "Admin";
      sa_data.status = "Active";
      
      const newUserAccess = new UserAccess(sa_data);
      // const sendingStatus = true; //await sendSMS(whatsappNumber, "activation token: "+theEncryptedNumber, "ZRL");
      const sendingStatus = await sendSMS(whatsappNumber, "activation token: "+theEncryptedNumber, "ZRL");
      if (await newUserAccess.save(sa_data) && sendingStatus){
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
    if (!user) {
      return res.status(400).send({ status: "failed", error: 'Unknown user' });
    }

    const whatsapp = await Whatsapp.findOne({ where: { whatsappNumber: data.whatsappNumber, whatsappNumberToken: data.whatsappNumberToken, userId: user.id }});
    
    if (!whatsapp){
      return res.status(401).json({ message: 'Whatsapp registration failed, Invalid Token, try again' });
    }

    whatsapp.businessName = data.businessName;
    whatsapp.businessDesc = data.businessDesc;
    whatsapp.businessEmail = data.businessEmail;
    whatsapp.userId = user.id;
    whatsapp.status = "Accepted";
    console.log(whatsapp);
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

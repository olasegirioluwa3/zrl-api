const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const Sequelize = require('sequelize'); // Import Sequelize
const { sequelize } = require('../models');
const User = sequelize.models.user;
const ServiceType = sequelize.models.service;
const { sendEmail } = require("../utils/email");
const { sendSMS } = require("../utils/sms");
const domain = process.env.APP_WEBSITE_URL || "localhost:3000";
const { generateRandomNumber } = require("../utils/encrypt");

async function getAll(req, res, data) {
  try {
    const service = await ServiceType.findAll();
    if (!service){
      return res.status(401).json({ message: 'No Service was found, try again' });
    }
    return res.status(200).json({ status: "success", service });
  } catch (error) {
    console.error(error.message);
    if (error instanceof Sequelize.UniqueConstraintError) {
      res.status(400).json({ message: "Email already exists" });
    } else {
      console.log(error);
      res.status(500).json({ message: "Registration failed on C" });
    }
  }
}

async function getAllByGroupCode(req, res, data) {
  try {
    const service = await ServiceType.findAll( {where: {svGroupCode: data.svGroupCode}});
    console.log(service);
    if (!service){
      return res.status(401).json({ message: `No Service with ${svGroupCode} was found, try again` });
    }
    return res.status(200).json({ status: "success", service });
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
    getAll,
    getAllByGroupCode
};

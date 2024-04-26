const Sequelize = require('sequelize'); // Import Sequelize
const { sequelize } = require('../models');
const User = sequelize.models.user;
const ServiceType = sequelize.models.service;
const ServiceAccess = sequelize.models.serviceaccess;
const { sendEmail } = require("../utils/email");

async function getAll(req, res, data) {
  try {
    const serviceaccess = await ServiceAccess.findAll();
    if (!serviceaccess){
      return res.status(401).json({ message: 'No Service Access was found, try again' });
    }
    return res.status(200).json({ status: "success", serviceaccess });
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

async function createServiceAccess(req, res, data) {
  try {
    const serviceaccess = await ServiceAccess.findAll();
    if (!serviceaccess){
      return res.status(401).json({ message: 'No Service Access was found, try again' });
    }
    const newServiceAccess = new ServiceAccess(data);
    if (await newServiceAccess.save(data)) {
      res.status(201).json({ message: "Registration successful" });
    } else {
      res.status(401).json({ message: "Registration failed, try again" });
    }
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

module.exports = {
    getAll,
    createServiceAccess
};

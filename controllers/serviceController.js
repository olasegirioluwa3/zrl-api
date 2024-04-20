const Sequelize = require('sequelize'); // Import Sequelize
const { sequelize } = require('../models');
const User = sequelize.models.user;
const ServiceType = sequelize.models.service;

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

async function getAllInGroupCode(req, res, data) {
  try {
    const service = await ServiceType.findAll( {where: {svGroupCode: data.svGroupCode}});
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

async function getOne(req, res, data) {
  try {
    const service = await ServiceType.findByPk(data.svId);
    if (!service){
      return res.status(401).json({ message: 'Service not found' });
    }
    return res.status(201).json({ service });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: "Service failed on C" });
  }
}

module.exports = {
    getAll,
    getAllInGroupCode,
    getOne
};
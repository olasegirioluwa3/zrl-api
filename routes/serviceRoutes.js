const express = require('express');
const router = express.Router();
const authenticateToken = require('../middlewares/auth.user.middleware');
const phoneNumber = require('phone-number');

module.exports = (app, io, sequelize) => {
  const serviceController = require('../controllers/serviceController');
  const validateUserData = require("../middlewares/validator/userValidator");

  router.post('/', async (req, res) => { 
    try {
      let input = {};
      input = req.body;
      const { data, errors } = await validateUserData(input);
      if (errors.length > 0) {
        return res.status(400).json({ errors });
      }
      const services = await serviceController.getAll(req, res, data);
    } catch (error) {
      console.log(error);
      res.status(500).send({ status: "failed", message: 'Failed to fetch services', error });
    }
  });

  router.post('/:svGroupCode/group/view', async (req, res) => { 
    try {
      const svGroupCode = req.params.svGroupCode;
      // const 
      const services = await serviceController.getAllByGroupCode(req, res, data);
      // res.send({ status: "success", services });
    } catch (error) {
      res.status(500).send({ status: "failed", message: 'Failed to fetch services', error });
    }
  });
  
  app.use('/api/services', router);
}
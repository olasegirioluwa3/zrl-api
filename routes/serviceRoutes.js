const express = require('express');
const router = express.Router();
const authenticateToken = require('../middlewares/auth.user.middleware');
const phoneNumber = require('phone-number');
const validateServiceData = require('../middlewares/validator/serviceValidator');

module.exports = (app, io, sequelize) => {
  const serviceController = require('../controllers/serviceController');

  router.post('/', async (req, res) => { 
    try {
      let input = {};
      input = req.body;
      const { data, errors } = await validateServiceData(input);
      if (errors.length > 0) {
        return res.status(400).json({ errors });
      }
      const services = await serviceController.getAll(req, res, data);
    } catch (error) {
      res.status(500).send({ status: "failed", message: 'Failed to fetch services', error });
    }
  });

  router.post('/create', async (req, res) => { 
    try {
      let input = {};
      input = req.body;
      const { data, errors } = await validateServiceData(input);
      if (errors.length > 0) {
        return res.status(400).json({ errors });
      }
      const services = await serviceController.createService(req, res, data);
    } catch (error) {
      console.log(error);
      res.status(500).send({ status: "failed", message: 'Failed to fetch services', error });
    }
  });

  router.post('/:svGroupCode/group/view', async (req, res) => { 
    try {
      const input = req.params;
      const { data, errors } = await validateServiceData(input);
      if (errors.length > 0) {
        return res.status(400).json({ errors });
      }
      const svGroupCode = data.svGroupCode;
      const services = await serviceController.getAllInGroupCode(req, res, data);
      // res.send({ status: "success", services });
    } catch (error) {
      res.status(500).send({ status: "failed", message: 'Failed to fetch services', error });
    }
  });

  router.post('/:svId/view', async (req, res) => { 
    try {
      const input = req.params;
      const { data, errors } = await validateServiceData(input);
      if (errors.length > 0) {
        return res.status(400).json({ errors });
      }
      const service = await serviceController.getOne(req, res, data);
    } catch (error) {
      console.log(error);
      res.status(500).send({ status: "failed", message: 'Failed to fetch services in r', error });
    }
  });
  
  app.use('/api/services', router);
}
const bcrypt = require("bcryptjs");
const Sequelize = require('sequelize'); // Import Sequelize
const { sequelize } = require('../models');
const User = sequelize.models.user;
const UserAccess = sequelize.models.useraccess;
const { sendEmail } = require("../utils/email");
const { generateToken } = require("../utils/encrypt");
const domain = process.env.APP_WEBSITE_URL || "localhost:3000";

async function getAll(req, res, data) {
  try {
    const useraccess = await UserAccess.findAll({where:{userId: req.user.id}});
    if (!useraccess){
      return res.status(401).json({ message: 'No User Access was found, try again' });
    }
    return res.status(200).json({ status: "success", useraccess });
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

async function invite(req, res, data) {
  try {
    console.log(data);
    const user = await User.emailExist(data.email);
    if (!user){
      // create an account for the email
      data.password = "&AreYouDoingWell1.";
      const token = generateToken();
      
      const verifyLink = `${domain}/account/email-verify/${token}`;
      const emailText = `To verify your account email, click on the following link: ${verifyLink}, default password: ${data.password}`;
      
      data.emailVerificationToken = token;
      const hashedPassword = await bcrypt.hash(data.password, 10);
      data.password = hashedPassword;
      
      const newUser = new User(data);
      if (await newUser.save(data)) {
        await sendEmail(data.email, "Invitation and Activate your account", emailText);
        data.userId = newUser.id;
        const newUserAccess = new UserAccess(data);
        console.log(data);
        if (await newUserAccess.save(data)) {
          return res.status(201).json({ message: "Registration successful" });
        }
      } else {
        return res.status(401).json({ message: "Registration failed, try again" });
      }
    }
    // check if user have admin access to service
    const useraccess = await UserAccess.findAll();
    if (!useraccess){
      return res.status(401).json({ message: 'No User Access was found' });
    }
    // const newUserAccess = new UserAccess(data);
    // if (await newUserAccess.save(data)) {            
    //   res.status(201).json({ message: "Registration successful" });
    // } else {
      res.status(401).json({ message: "Registration failed after, try again" });
    // }
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

async function getAll(req, res, data) {
  try {
    const useraccess = await UserAccess.findAll({where:{userId:data.userId}});
    if (!useraccess){
      return res.status(401).json({ message: 'No User Access was found, try again' });
    } else {
      res.status(201).json({ status: "success", message: "Registration successful", useraccess });
    }
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: "Get UserAccess failed on C" });
  }
}

async function approveUserAccess(req, res, data) {
  try {
    const useraccess = await UserAccess.findAll();
    if (!useraccess){
      return res.status(401).json({ message: 'No User Access was found, try again' });
    }
    const newUserAccess = new UserAccess(data);
    if (await newUserAccess.save(data)) {
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
    invite,
    approveUserAccess
};
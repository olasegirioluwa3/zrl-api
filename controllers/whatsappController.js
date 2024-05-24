const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const Sequelize = require('sequelize'); // Import Sequelize
const { sequelize } = require('../models');
const User = sequelize.models.user;
const ServiceAccess = sequelize.models.serviceaccess;
const UserAccess = sequelize.models.useraccess;
const Whatsapp = sequelize.models.whatsapp;
const Contact = sequelize.models.contact;
const Message = sequelize.models.message;

const validateUserData = "../middlewares/validator/index";
const { sendEmail } = require("../utils/email");
const { sendSMS } = require("../utils/sms");
const { generateResponse } = require("../utils/conversation");
const domain = process.env.APP_WEBSITE_URL || "localhost:3000";
const { generateRandomNumber, encryptNumber, decryptNumber } = require("../utils/encrypt");

const generateToken = () => {
  return crypto.randomBytes(20).toString('hex');
};

// Define environment variables
const { GOOGLE_MAPS_API_KEY, FACEBOOK_WEBHOOK_VERIFY_TOKEN, WEBHOOK_VERIFY_TOKEN, OPENAI_API_KEY, GRAPH_API_TOKEN, PORT } =
  process.env;


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
    console.log("in find user");
    const user = await User.findByPk( req.user.id );
    if (!user) {
      return res.status(400).send({ status: "failed", error: 'Unknown user' });
    }

    console.log("in find whatsapp");
    const whatsapp = await Whatsapp.findOne({ where: { whatsappNumber: data.whatsappNumber, whatsappNumberToken: data.whatsappNumberToken, userId: user.id }});
    if (!whatsapp){
      return res.status(401).json({ message: 'Whatsapp registration failed, Token cannot be linked to the Whatsapp Number. Please, try again' });
    }

    whatsapp.businessName = data.businessName;
    whatsapp.businessDesc = data.businessDesc;
    whatsapp.businessEmail = data.businessEmail;
    whatsapp.userId = user.id;
    whatsapp.status = "Accepted";
    
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

async function verifyWhatsapp(req, res, data) {
  try {
    // check if saId is valid
    const serviceaccess = await ServiceAccess.findByPk(data.saId);
    if (!serviceaccess)  return res.status(400).send({ status: "failed", error: 'Unknown serviceaccess' });
    // check if service is valid
    const service = await ServiceType.findByPk(serviceaccess.svId);
    if (!service)  return res.status(400).send({ status: "failed", error: 'Unknown service' });
    // check if whatsapp is valid
    const whatsapp = await Whatsapp.findByPk(serviceaccess.svProductId);
    if (!whatsapp)  return res.status(400).send({ status: "failed", error: 'Whatsapp not found, try again' });

    const {
      "hub.mode": mode,
      "hub.verify_token": token,
      "hub.challenge": challenge,
    } = req.query;
  
    if (mode === "subscribe" && token === whatsapp.verifyToken) {
      whatsapp.verifyStatus = 'Accepted';
      await whatsapp.save()
      res.status(200).send(challenge);
      console.log("Webhook verified successfully!");
    } else {
      res.sendStatus(403);
    }
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: "Registration failed on C" });
  }
}

async function incomingMessage(req, res, data) {
  // check if saId is valid
  const serviceaccess = await ServiceAccess.findByPk(data.saId);
  if (!serviceaccess)  return res.status(400).send({ status: "failed", error: 'Unknown serviceaccess' });
  
  // check if service is valid
  const service = await ServiceType.findByPk(serviceaccess.svId);
  if (!service)  return res.status(400).send({ status: "failed", error: 'Unknown service' });
  
  // check if whatsapp is valid
  const whatsapp = await Whatsapp.findByPk(serviceaccess.svProductId);
  if (!whatsapp)  return res.status(400).send({ status: "failed", error: 'Whatsapp not found, try again' });

  const msgContact = req.body.entry?.[0]?.changes[0]?.value?.contact[0];
  
  // check if contact already exist else create contact for that serviceaccess
  let contact = await Contact.findByPk(msgContact);
  if (!contact) {
    const contactData = {}
    contactData.platformUserId = '';
    contactData.platformUserGeneralId = '';
    contactData.platformName = 'Whatsapp'
    contactData.contactFirstName = '';
    contactData.contactMiddleName = '';
    contactData.contactLastName = '';
    contactData.contactEmail = '';
    contactData.contactPhoneNumber = '';
    contact = new Contact(contactData);
    await contact.save(contactData);
  }

  // check if chat already exist between the contact and the saId exist create chat for sa and contact
  let chat = await Chat.findOne({where:{saId: saId, contactId: contact.id}});
  if (!chat) {
    const chatData  = {}
    chatData.saId = serviceaccess.id;
    chatData.contactId = contact.id;
    chatData.chatStatus = 'Open';
    chat = new Chat(chatData);
    await chat.save(chatData);
  }

  // process the message first if image or other, except Text
  

  // add message to messages using chat.id
  const messageData  = {}
  messageData.chatId = chat.id;
  messageData.senderId = contact.id;
  messageData.message = message;
  messageData.messageType = 'Text';
  message = new Message(messageData);
  await message.save(messageData);

  // process your response using all means necessary
  

  // add the response to messages using chat.id
  

  // know where the data is coming from;
  const input2 = req.body.entry?.[0]?.changes[0]?.value?.messages;
  
  if (!input) return res.sendStatus(200);
  console.log(input);
  console.log(input2);
  let feedback = "";
  if (input == "/pay") {
    feedback = "Below is the payment structure at *Zion Reborn University*. \n\nRegistration fee: *5,000 Naira Only*. \n\nAcceptance fee: *7,000 Naira Only*. \n\nTuition fee: *25,000 - 40,000 Naira Only* Per Semester. \n\nTo make payment visit zruugportal.zionrebornuniversity.com.ng";
  } else if (input == "/schoolanthem") {
    feedback = "*Zion Reborn University Anthem:* \n\nDistance is no obstacle to the pursuit of knowledge. Zion Reborn University, a beacon of learning, brings education to all who seek it. \n\nWith technology as our guide, we connect students around the world, breaking down barriers and building bridges of understanding. \n\nLet us unite in the quest for knowledge, and let Zion Reborn lead the way.";
  } else if (input == "/courselist") {
    feedback = "> Zion Reborn University Course List:* \n* B.Sc. Statistics. \n* B.Sc. Mathematics. \n* B.Sc. Economics. \n* B.Sc. Transport. \n* B.A. Theatre Arts. \n* B.Sc. Computer Science.";
  } else {
    const data = {};
    data.input = input;
    feedback = await generateResponse(data);
  }

  // details on WhatsApp text message payload: https://developers.facebook.com/docs/whatsapp/cloud-api/webhooks/payload-examples#text-messages
  const message = req.body.entry?.[0]?.changes[0]?.value?.messages?.[0];

  // check if the incoming message contains text
  if (message?.type === "text") {
    // extract the business number to send the reply from it
    const business_phone_number_id =
      req.body.entry?.[0].changes?.[0].value?.metadata?.phone_number_id;

    // send a reply message as per the docs here https://developers.facebook.com/docs/whatsapp/cloud-api/reference/messages
    await axios({
      method: "POST",
      url: `https://graph.facebook.com/v18.0/${business_phone_number_id}/messages`,
      headers: {
        Authorization: `Bearer ${GRAPH_API_TOKEN}`,
      },
      data: {
        messaging_product: "whatsapp",
        to: message.from,
        text: { body: feedback || message.text.body },
        context: {
          message_id: message.id, // shows the message as a reply to the original user message
        },
      },
    });

    // Return success response
    res.sendStatus(200);
  } else {
    // Return error for unsupported message types
    res.status(400).json({ error: "Unsupported message type" });
  }
}

module.exports = {
    registerWhatsapp,
    sendWhatsappVerifyToken,
    getAllWhatsapp,
    verifyWhatsapp,
    incomingMessage
};
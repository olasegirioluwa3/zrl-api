/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import express from "express";
import axios from "axios";
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env['OPENAI_API_KEY'], // This is the default and can be omitted
});

const app = express();
app.use(express.json());

// Define environment variables
const { WEBHOOK_VERIFY_TOKEN, OPENAI_API_KEY, GRAPH_API_TOKEN, PORT } =
  process.env;

// Function to generate response using ChatGPT API
async function generateResponse(query) {
  try {
    // const response = await axios.post(
    const chatCompletion = await openai.chat.completions.create({
      messages: [
            {"role": "system", "content": "You are a helpful assistant designed to help Zion Reborn University (ZRU) students with tasks, understand if the student intent to make payment, learn about courses offered or academic programs, any other intent is generic, you can also respond in the language of the user, in this json format. example {'intent': 'payment'|'course'|'program'|'generic', 'content': Your feedback}. You are to reoly in the tone of the user, if user uses fun and sarcastic, do the same and so on"},
            {"role": "assistant", "content": "if intent is payment: ask a followup question the department and program the student is or aspiring for at Zion Reborn University then generate a tuition fee for the user."},
            {"role": "user", "content": query}
        ],
      model: 'gpt-3.5-turbo',
    });
    console.log(chatCompletion.choices[0].message.content);
    return chatCompletion.choices[0].message.content;
  } catch (error) {
    console.error("Error generating response:", error);
    return "Sorry, I couldn't generate a response at the moment.";
  }
}

app.post("/webhook", async (req, res) => {
//   // Extract message from request body
  console.log(req.body.entry?.[0]?.changes[0]?.value?.messages?.[0].text.body);
  console.log(req.body.entry);
  const input = req.body.entry?.[0]?.changes[0]?.value?.messages?.[0].text.body;
  let feedback = "";
  if (input == "/pay") {
    feedback = "Below is the payment structure at *Zion Reborn University*. \n\nRegistration fee: *5,000 Naira Only*. \n\nAcceptance fee: *7,000 Naira Only*. \n\nTuition fee: *25,000 - 40,000 Naira Only* Per Semester. \n\nTo make payment visit zruugportal.zionrebornuniversity.com.ng";
  } else if (input == "/schoolanthem") {
    feedback = "*Zion Reborn University Anthem:* \n\nDistance is no obstacle to the pursuit of knowledge. Zion Reborn University, a beacon of learning, brings education to all who seek it. \n\nWith technology as our guide, we connect students around the world, breaking down barriers and building bridges of understanding. \n\nLet us unite in the quest for knowledge, and let Zion Reborn lead the way.";
  } else if (input == "/courselist") {
    feedback = "> Zion Reborn University Course List:* \n* B.Sc. Statistics. \n* B.Sc. Mathematics. \n* B.Sc. Economics. \n* B.Sc. Transport. \n* B.A. Theatre Arts. \n* B.Sc. Computer Science.";
  } else {
    feedback = await generateResponse(input);
  }

  // check if the webhook request contains a message
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
});

// Webhook verification endpoint
app.get("/webhook", (req, res) => {
  const {
    "hub.mode": mode,
    "hub.verify_token": token,
    "hub.challenge": challenge,
  } = req.query;

  if (mode === "subscribe" && token === WEBHOOK_VERIFY_TOKEN) {
    res.status(200).send(challenge);
    console.log("Webhook verified successfully!");
  } else {
    res.sendStatus(403);
  }
});

app.get("/", (req, res) => {
  res.send("<pre>Nothing to see here. Checkout README.md to start.</pre>");
});

app.listen(PORT, () => {
  console.log(`Server is listening on port: ${PORT}`);
});

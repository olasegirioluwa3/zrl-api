const express = require('express');
const fs = require('fs');
const router = express.Router();

// Your Facebook Page Access Token
const PAGE_ACCESS_TOKEN = 'EAAK0PRihKE0BO9mnwzrSTU2RUgfzd2iKdyqahSv6cuCayvxkf8fu6hS28DTuEk2dKVIJvXbNgZAuDuQxQeA9L4Gh8jpQuiq9V51WoSOiP1JZA2I39mWgo9JcLD2YZABggUfs2dQfEgWs7OZCHpaDZBApZBHaz53EPoPcZBvljOyD77xPBGqObYfJMXw7ydjb5dQ3OliJqBD6STLgdCi';

// Function to write data into a text file
function writeToTextFile(filename, data) {
    fs.writeFile(filename, data, (err) => {
        if (err) {
            console.error('Error writing to file:', err);
        } else {
            console.log('Data written to file successfully');
        }
    });
}

module.exports = (app, io, sequelize) => {
    // Webhook endpoint to handle incoming messages from Facebook
    router.get('/webhook', (req, res) => {
        try {
            // Your verification token from Facebook App Dashboard
            const VERIFY_TOKEN = 'ant@hunter/TMB7';
        
            // Extract the verification token and challenge from the query parameters
            const mode = req.query['hub.mode'];
            const token = req.query['hub.verify_token'];
            const challenge = req.query['hub.challenge'];
            console.log(req.query);
        
            // Check if mode and token are present and correct
            if (mode && token === VERIFY_TOKEN) {
                // Respond with the challenge to verify the webhook
                res.status(200).send(challenge);
            } else {
                // Respond with an error if verification fails
                res.sendStatus(403);
            }
        } catch (error) {
            console.error(error);
            res.status(500).send({ status: "failed", message: 'Webhook failed' });
        }
    });

    // Webhook endpoint to handle incoming messages from Facebook
    router.post('/webhook', (req, res) => {
        try {
            const body = req.body;

            // Write the data into a text file
            writeToTextFile('webhook_data.txt', JSON.stringify(body));

            // Check if the webhook event is a page subscription
            if (body.object === 'page') {
                // Iterate over each entry - there may be multiple if batched
                body.entry.forEach(entry => {
                    // Iterate over each messaging event
                    entry.messaging.forEach(event => {
                        console.log(event);
                        if (event.message) {
                            // Extract sender ID
                            const senderId = event.sender.id;

                            // Send a response message
                            sendResponseMessage(senderId, 'Welcome to Zion Reborn University');
                        }
                    });
                });

                // Respond with a 200 status to acknowledge receipt of the event
                res.status(200).send('EVENT_RECEIVED');
            } else {
                // Respond with an error if the event is not from a page subscription
                res.sendStatus(404);
            }
        } catch (error) {
            console.error(error);
            res.status(500).send({ status: "failed", message: 'Webhook failed' });
        }
    });

    // Webhook endpoint to handle incoming messages from Facebook
    router.get(['/facebook', '/instagram', '/whatsapp'], (req, res) => {
        try {
            // Your verification token from Facebook App Dashboard
            const VERIFY_TOKEN = 'ant@hunter/TMB7';
        
            // Extract the verification token and challenge from the query parameters
            const mode = req.query['hub.mode'];
            const token = req.query['hub.verify_token'];
            const challenge = req.query['hub.challenge'];
            console.log(req.query);
        
            // Check if mode and token are present and correct
            if (mode && token === VERIFY_TOKEN) {
                // Respond with the challenge to verify the webhook
                res.status(200).send(challenge);
            } else {
                // Respond with an error if verification fails
                res.sendStatus(403);
            }
        } catch (error) {
            console.error(error);
            res.status(500).send({ status: "failed", message: 'Webhook failed' });
        }
    });
    
    router.post('/facebook', (req, res) => {
        try {
            const body = req.body;

            // Write the data into a text file
            writeToTextFile('facebook_webhook_data.txt', JSON.stringify(body));

            // Check if the webhook event is a page subscription
            if (body.object === 'page') {
                // Iterate over each entry - there may be multiple if batched
                body.entry.forEach(entry => {
                    // Iterate over each messaging event
                    entry.messaging.forEach(event => {
                        console.log(event);
                        if (event.message) {
                            // Extract sender ID
                            const senderId = event.sender.id;

                            // Send a response message
                            sendResponseMessage(senderId, 'Welcome to Zion Reborn University');
                        }
                    });
                });

                // Respond with a 200 status to acknowledge receipt of the event
                res.status(200).send('EVENT_RECEIVED');
            } else {
                // Respond with an error if the event is not from a page subscription
                res.sendStatus(404);
            }
        } catch (error) {
            console.error(error);
            res.status(500).send({ status: "failed", message: 'Webhook failed' });
        }
    });

    // Webhook endpoint to handle incoming messages from Instagram
    router.post('/instagram', (req, res) => {
        try {
            const body = req.body;

            // Write the data into a text file
            writeToTextFile('instagram_webhook_data.txt', JSON.stringify(body));

            // Your existing code handling Instagram webhook events

            // Respond with a 200 status to acknowledge receipt of the event
            res.status(200).send('EVENT_RECEIVED');
        } catch (error) {
            console.error(error);
            res.status(500).send({ status: "failed", message: 'Webhook failed' });
        }
    });

    // Webhook endpoint to handle incoming messages from WhatsApp
    router.post('/whatsapp', (req, res) => {
        try {
            const body = req.body;

            // Write the data into a text file
            writeToTextFile('whatsapp_webhook_data.txt', JSON.stringify(body));

            // Your existing code handling WhatsApp webhook events

            // Respond with a 200 status to acknowledge receipt of the event
            res.status(200).send('EVENT_RECEIVED');
        } catch (error) {
            console.error(error);
            res.status(500).send({ status: "failed", message: 'Webhook failed' });
        }
    });

    // Function to send a response message to the sender
    async function sendResponseMessage(recipientId, message) {
        try {
            const response = await axios.post(`https://graph.facebook.com/v12.0/me/messages?access_token=${PAGE_ACCESS_TOKEN}`, {
                messaging_type: 'RESPONSE',
                recipient: {
                    id: recipientId
                },
                message: {
                    text: message
                }
            });

            console.log('Response message sent successfully:', response.data);
        } catch (error) {
            console.error('Error sending response message:', error.response.data);
        }
    }

    router.get('/', async (req, res) => {
        try {
            res.status(200).send({ status: "success", message: 'Util Social Meta user called' });
        } catch (error) {
            console.log(error);
            res.status(400).send({ status: "failed", message: 'Error in API user call', error: error.errors });
        }
    });
    
    app.use('/api/util/social/meta', router);
};

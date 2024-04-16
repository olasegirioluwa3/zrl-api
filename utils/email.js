const nodemailer = require('nodemailer');
require('dotenv').config();

const sendEmail = async (to, subject, text) => {
    const transporter = nodemailer.createTransport({
        // configure your email service here
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        secure: process.env.EMAIL_SECURE, // true for 465, false for other ports
        auth: {
            user: process.env.EMAIL_AUTH_USER,
            pass: process.env.EMAIL_AUTH_PASS
        },
        tls: {
            rejectUnauthorized: process.env.EMAIL_TLS_REJECTUNAUTHORIZED
        }
    });

    try {
        await transporter.sendMail({
            from: process.env.EMAIL_AUTH_USER,
            to,
            subject,
            text,
        });
        console.log('Email sent successfully');
        return true;
    } catch (error) {
        console.error('Error sending email:', error);
        throw error;
    }
};

module.exports = {sendEmail};

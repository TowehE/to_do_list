const nodemailer = require("nodemailer");
const dotenv = require("dotenv");
dotenv.config()
// require("dotenv").config();

async function sendEmail(options) {
  const transporter = nodemailer.createTransport({
    service: process.env.service,
    auth: {
      user:process.env.myuser,
      pass: process.env.emailPassword,
    },
  });

  try {
    const mailOption = {
      from: process.env.myuser,
      to: options.email,
      subject: options.subject,
      text: options.text,
      html: options.html,
    };

    await transporter.sendMail(mailOption);
    return { message: 'Verification email sent' };
  } catch (error) {
    throw new Error('Error sending verification email: ' + error.message);
  }
}

module.exports = { sendEmail };


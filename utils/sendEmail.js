const nodemailer = require('nodemailer');

const sendEmail = async function (option) {
  // create transporter
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
  // creating mail option
  const mailOption = {
    from: 'Sabbir Hossain <sabbir@mail.io>',
    to: option.to,
    subject: option.subject,
    text: option.message,
  };

  // sending actual  email
  await transporter.sendMail(mailOption);
};

module.exports = sendEmail;

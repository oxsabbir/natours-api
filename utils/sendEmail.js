const nodemailer = require('nodemailer');
const pug = require('pug');

const htmlToText = require('html-to-text');

module.exports = class Email {
  constructor(user, url) {
    this.user = user;
    this.to = user.email;
    this.url = url;
  }

  newTransport() {
    if (process.env.NODE_ENV === 'production') {
      return 1;
    }
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }

  async send(template, subject) {
    // 1) render HTML
    const html = pug.renderFile(
      `${__dirname}/../views/emails/${template}.pug`,
      {
        subject,
        firstName: this.user.name.split(' ')[0],
        url: this.url,
      },
    );
    // 2) pass option

    const mailOption = {
      from: `Sabbir Hossain <${process.env.AUTHOR_EMAIL}>`,
      to: this.to,
      subject,
      html,
      text: htmlToText.convert(html),
    };
    const transport = this.newTransport();
    await transport.sendMail(mailOption);
  }

  async sendWelcome() {
    await this.send('welcome', 'Welcome to Natours family');
  }

  async sendForgotPassword() {
    await this.send(
      'resetPassword',
      'Password reset token (valid for 10 minute)',
    );
  }
};

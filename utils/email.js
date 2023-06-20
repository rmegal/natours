const nodemailer = require("nodemailer");

const sendEmail = async (options) => {
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_HOST_PORT,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    }
  });

  const mailOptions = {
    from: "Ray Megal <ray.megal@tricore.org>",
    to: options.email,
    subject: options.subject,
    text: options.text
  };

  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;

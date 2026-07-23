import nodemailer from "nodemailer";

const emailHttpUrl = `${process.env.EMAIL_HTTP_HOST}:${process.env.EMAIL_HTTP_PORT}`;

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_SMTP_HOST,
  port: process.env.EMAIL_SMTP_PORT,
  secure: process.env.NODE_ENV === "production" ? true : false,
  auth: {
    user: process.env.EMAIL_SMTP_USER,
    pass: process.env.EMAIL_SMTP_PASSWORD,
  },
});

async function send(mailOptions) {
  await transporter.sendMail(mailOptions);
}

const email = {
  send,
  emailHttpUrl,
};

export default email;

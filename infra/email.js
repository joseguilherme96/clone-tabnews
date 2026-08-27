import nodemailer from "nodemailer";
import { ServiceError } from "./errors.js";

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
  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    throw new ServiceError({
      cause: error,
      message: "Não foi possível enviar o email.",
      action: "Verifique se o serviço de email está disponível.",
      context: mailOptions,
    });
  }
}

const email = {
  send,
};

export default email;

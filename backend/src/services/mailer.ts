import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST || "localhost",
  port: Number(process.env.MAIL_PORT) || 1025,
  secure: false,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS, // use app password if MFA enabled
  },
});

export async function sendMail(
  to: string,
  subject: string,
  html: string,
  text?: string
) {
  const info = await transporter.sendMail({
    from: process.env.MAIL_FROM || "no-reply@example.com",
    to,
    subject,
    text,
    html,
  });
  return info;
}

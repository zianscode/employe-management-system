import nodemailer from "nodemailer";

const SENDER_NAME = "EMS Pro Support";

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.SMTP_EMAIL,
    pass: process.env.SMTP_PASSWORD,
  },
});

interface MailInput {
  to: string;
  subject: string;
  html: string;
}

export async function sendMail({ to, subject, html }: MailInput) {
  await transporter.sendMail({
    from: `"${SENDER_NAME}" <${process.env.SMTP_EMAIL}>`,
    to,
    subject,
    html,
  });
}

import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const getTransporterConfig = () => {
  if (process.env.RESEND_API_KEY) {
    return {
      host: "smtp.resend.com",
      port: 587,
      secure: false, // TLS
      auth: {
        user: "resend",
        pass: process.env.RESEND_API_KEY
      }
    };
  }

  return {
    host: process.env.SMTP_HOST || "smtp-relay.brevo.com",
    port: parseInt(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === 'true' || false,
    requireTLS: true,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    },
    logger: false,
    debug: false
  };
};

const transporter = nodemailer.createTransport(getTransporterConfig());

export default transporter;
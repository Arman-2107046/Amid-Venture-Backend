import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import nodemailer from "nodemailer";

const app = express();
const PORT = process.env.PORT || 5000;

// CORS Configuration — only allow your frontend domain
app.use(
    cors({
        origin: "https://amidventure-frontend.netlify.app", // ✅ Change as needed
        credentials: true,
    })
);

// Middleware
app.use(express.json());

// Mail transporter
const transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: Number(process.env.MAIL_PORT),
    secure: Number(process.env.MAIL_PORT) === 465,
    auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
    },
});

// Verify transporter connection
transporter.verify((err, success) => {
    if (err) {
        console.error("❌ Mail server connection failed:", err);
    } else {
        console.log("✅ Mail server is ready to send emails");
    }
});

// Email sending endpoint
app.post("/send-email", async(req, res) => {
    const { user_name, user_email, contact_number, subject, message } = req.body;

    if (!user_name || !user_email || !message) {
        return res.status(400).json({ message: "Please fill in all required fields." });
    }

    const mailOptions = {
        from: `"Cotton World Sourcing" <${process.env.MAIL_USER}>`,
        replyTo: user_email,
        to: process.env.RECEIVER_EMAIL,
        subject: subject || "New Contact Form Submission",
        text: `
Name: ${user_name}
Email: ${user_email}
Contact Number: ${contact_number || "Not provided"}
Subject: ${subject || "No subject"}

Message:
${message}
    `,
        html: `
      <p><strong>Name:</strong> ${user_name}</p>
      <p><strong>Email:</strong> ${user_email}</p>
      <p><strong>Contact Number:</strong> ${contact_number || "Not provided"}</p>
      <p><strong>Subject:</strong> ${subject || "No subject"}</p>
      <hr/>
      <p>${message.replace(/\n/g, "<br/>")}</p>
      <p>—<br/>Sent via contact form on <strong>cottonworldsourcing.com</strong></p>
    `,
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log("✅ Email sent:", info.messageId);
        res.status(200).json({ message: "Email sent successfully!" });
    } catch (error) {
        console.error("❌ Error sending email:", error);
        res.status(500).json({ message: "Failed to send email." });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
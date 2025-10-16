import nodemailer from "nodemailer";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ status: "error", message: "Only POST allowed" });
  }

  const { name, email, subject, message } = req.body;

  if (!name || !email || !subject || !message) {
    return res.status(400).json({ status: "error", message: "All fields are required" });
  }

  try {
    // Configure transporter
    let transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER, // Your Gmail
        pass: process.env.EMAIL_PASS, // App password (not normal password)
      },
    });

    // Email content
    let mailOptions = {
      from: `"${name}" <${email}>`,
      to: "rasa@estin.dz",
      subject,
      text: `Name: ${name}\nEmail: ${email}\nSubject: ${subject}\n\nMessage:\n${message}`,
    };

    // Send
    await transporter.sendMail(mailOptions);

    res.status(200).json({ status: "success" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: "error", message: "Failed to send email" });
  }
}
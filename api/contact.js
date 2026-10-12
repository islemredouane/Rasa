import nodemailer from "nodemailer";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ status: "error", message: "Only POST allowed" });
  }

  const body = req.body || {};
  // Single-line fields: no line breaks (they would let someone inject email headers).
  const line = (v, max) => String(v ?? "").replace(/[\r\n]+/g, " ").trim().slice(0, max);
  const name = line(body.name, 100);
  const email = line(body.email, 254);
  const subject = line(body.subject, 150);
  const message = String(body.message ?? "").trim().slice(0, 5000);

  if (!name || !email || !subject || !message) {
    return res.status(400).json({ status: "error", message: "All fields are required" });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ status: "error", message: "Please enter a valid email address" });
  }

  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS, // Gmail App Password
      },
    });

    await transporter.sendMail({
      from: `"Rasa Website" <${process.env.EMAIL_USER}>`, // ✅ avoid Gmail "spoofing" issues
      replyTo: email, // ✅ you can reply to the user easily
      to: "rasa@estin.dz",
      subject: `[Contact] ${subject}`,
      text: `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
    });

    return res.status(200).json({ status: "success" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: "error", message: "Failed to send email" });
  }
}

const nodemailer = require("nodemailer");

const contactFormHandler = async (req, res) => {
  const { name, email, subject, message } = req.body;

  if (!name || !email || !subject || !message) {
    return res.status(400).json({ msg: "Please fill all fields" });
  }

  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER, // Tu apna Gmail use kar
        pass: process.env.EMAIL_PASS // Gmail ke liye 'App Password' use karna bro (2FA enabled ho toh)
      }
    });

    const mailOptions = {
      from: email,
      to: "techwithharsh1301@gmail.com",
      subject: `NoGen AI - ${subject}`,
      html: `
        <h3>New Contact Form Submission</h3>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Message:</strong><br/>${message}</p>
      `
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ msg: "Message sent successfully!" });
  } catch (err) {
    console.error("Email error:", err);
    res.status(500).json({ msg: "Failed to send message" });
  }
};

module.exports = contactFormHandler;

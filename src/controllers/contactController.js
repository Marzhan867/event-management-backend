const { sendEmail } = require("../services/emailService");

exports.sendContact = async (req, res) => {
  try {
    const { name, email, message } = req.body;
    if (!name || !email || !message) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    await sendEmail({
      to: process.env.EMAIL_USER,
      subject: "EventFlow Contact Form",
      html: `
        <h3>New message from EventFlow</h3>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Message:</strong></p>
        <p>${message}</p>
      `,
    });

    res.json({ message: "Message sent" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

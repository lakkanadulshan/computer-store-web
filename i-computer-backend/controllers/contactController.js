import ContactMessage from "../models/contactMessage.js";

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || "").trim().toLowerCase());
}

export async function createContactMessage(req, res) {
  try {
    const name = String(req.body?.name || "").trim();
    const email = String(req.body?.email || "").trim().toLowerCase();
    const message = String(req.body?.message || "").trim();

    if (!name || !email || !message) {
      return res.status(400).json({
        message: "Name, email, and message are required",
      });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({
        message: "Invalid email address",
      });
    }

    const savedMessage = await ContactMessage.create({
      name,
      email,
      message,
    });

    return res.status(201).json({
      message: "Message received successfully",
      id: savedMessage._id,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to save message",
      error: error.message,
    });
  }
}

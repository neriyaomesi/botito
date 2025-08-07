const express = require("express");
const bodyParser = require("body-parser");
require("dotenv").config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();
const port = process.env.PORT || 4000;

app.use(bodyParser.json());

// חיבור ל-Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// בדיקה ראשונית שהשרת חי
app.get("/", (req, res) => {
  res.send("Botito Gemini server is running 🚀");
});

// נקודת קצה להודעות
app.post("/message", async (req, res) => {
  const { msg } = req.body;

  if (!msg) {
    return res.status(400).json({ reply: "חסר טקסט" });
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(msg);
    const reply = result.response.text();

    res.json({ reply });
  } catch (err) {
    console.error("Gemini API error:", err);
    res.status(500).json({ reply: "שגיאה בעיבוד ההודעה 🤖" });
  }
});

app.listen(port, () => {
  console.log(`Botito Gemini server listening on port ${port}`);
});

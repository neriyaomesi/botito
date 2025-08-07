const express = require("express");
const bodyParser = require("body-parser");
require("dotenv").config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());

// קונפיגורציה עם המפתח של Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.post("/message", async (req, res) => {
  const { msg } = req.body;

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(msg);
    const reply = result.response.text();

    res.json({ reply });
  } catch (error) {
    console.error("Gemini API error:", error);
    res.status(500).json({ reply: "שגיאה בעיבוד ההודעה 🤖" });
  }
});

app.listen(PORT, () => {
  console.log(`Botito Gemini server running on port ${PORT}`);
});

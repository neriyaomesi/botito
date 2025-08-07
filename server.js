const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");
require("dotenv").config();

// טעינה דינמית של הספרייה
const { GoogleGenAI } = require("@google/genai");

const app = express();
const port = process.env.PORT || 4000;

app.use(bodyParser.json());

// קובץ לשמירת היסטוריה
const historyFile = "chat_history.json";
if (!fs.existsSync(historyFile)) fs.writeFileSync(historyFile, JSON.stringify([]));

function readHistory() {
  return JSON.parse(fs.readFileSync(historyFile, "utf8"));
}
function saveHistory(history) {
  fs.writeFileSync(historyFile, JSON.stringify(history, null, 2));
}

// אישיות הבוט
const BOT_PERSONALITY = `
אתה בוטיטו 🤖 – בוט חכם, מצחיק וזורם, שמדבר בעברית יומיומית.
אתה תמיד עונה בצורה קלילה אבל עם ידע, ואוהב להוסיף אמוג'ים.
`;

// יצירת מופע ה-AI
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

// בדיקת חיבור
app.get("/", (req, res) => {
  res.send("Botito Gemini server with @google/genai is running 🚀");
});

// נקודת קצה להיסטוריה
app.get("/history", (req, res) => {
  try {
    res.json(readHistory());
  } catch (err) {
    res.status(500).json({ error: "שגיאה בקריאת ההיסטוריה" });
  }
});

// נקודת קצה לשליחת הודעות
app.post("/message", async (req, res) => {
  const { msg } = req.body;
  if (!msg) return res.status(400).json({ reply: "❌ חסר טקסט בהודעה" });

  try {
    let history = readHistory();
    history.push({ role: "user", text: msg });

    // יצירת תוכן עם האישיות והיסטוריה
    const contents = [
      {
        role: "user",
        parts: [{ text: BOT_PERSONALITY + "\n\n" + msg }],
      },
    ];

    const config = {
      thinkingConfig: { thinkingBudget: 0 },
      tools: [{ codeExecution: {} }, { googleSearch: {} }],
    };

    const model = "gemini-2.5-flash";

    let replyText = "";
    const response = await ai.models.generateContentStream({
      model,
      config,
      contents,
    });

    for await (const chunk of response) {
      if (!chunk.candidates || !chunk.candidates[0].content) continue;
      const part = chunk.candidates[0].content.parts[0];
      if (part.text) replyText += part.text;
    }

    history.push({ role: "bot", text: replyText });
    saveHistory(history);

    res.json({ reply: replyText });
  } catch (err) {
    console.error("Gemini API error:", err);
    res.status(500).json({ reply: "⚠ שגיאה בעיבוד ההודעה" });
  }
});

app.listen(port, () => {
  console.log(`Botito Gemini server with @google/genai listening on port ${port}`);
});

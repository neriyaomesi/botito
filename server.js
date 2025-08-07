const express = require("express");
const bodyParser = require("body-parser");
require("dotenv").config();
const fs = require("fs");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();
const port = process.env.PORT || 4000;

app.use(bodyParser.json());

// חיבור ל-Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// קובץ לשמירת ההיסטוריה
const historyFile = "chat_history.json";

// אם אין קובץ – צור אחד ריק
if (!fs.existsSync(historyFile)) {
  fs.writeFileSync(historyFile, JSON.stringify([]));
}

// פונקציה לקרוא היסטוריה
function readHistory() {
  return JSON.parse(fs.readFileSync(historyFile, "utf8"));
}

// פונקציה לשמור היסטוריה
function saveHistory(history) {
  fs.writeFileSync(historyFile, JSON.stringify(history, null, 2));
}

// אישיות הבוט – תוכל לשנות כאן איך שבא לך
const BOT_PERSONALITY = `
אתה בוטיטו 🤖 – בוט חכם, מצחיק וזורם, שמדבר בעברית יומיומית.
אתה תמיד עונה בצורה קלילה אבל עם ידע, ואוהב להוסיף אמוג'ים.
אם שואלים אותך שאלה – אתה עונה ישר, בלי התחמקויות.
`;

// בדיקת חיבור
app.get("/", (req, res) => {
  res.send("Botito Gemini server with personality is running 🚀");
});

// שליחת הודעה
app.post("/message", async (req, res) => {
  const { msg } = req.body;
  if (!msg) {
    return res.status(400).json({ reply: "❌ חסר טקסט בהודעה" });
  }

  try {
    // קריאת היסטוריית שיחות
    let history = readHistory();

    // הוספת ההודעה החדשה להיסטוריה
    history.push({ role: "user", text: msg });

    // בניית ההקשר לשיחה – האישיות + כל ההיסטוריה
    const conversation = [
      { role: "system", text: BOT_PERSONALITY },
      ...history.map(h => ({ role: h.role, text: h.text }))
    ];

    // שליחת הבקשה ל-Gemini
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(
      conversation.map(c => `${c.role === "user" ? "משתמש" : "בוט"}: ${c.text}`).join("\n")
    );

    const reply = result.response.text();

    // שמירת תשובת הבוט בהיסטוריה
    history.push({ role: "bot", text: reply });
    saveHistory(history);

    res.json({ reply });
  } catch (err) {
    console.error("Gemini API error:", err);
    res.status(500).json({ reply: "⚠ שגיאה בעיבוד ההודעה" });
  }
});

// הפעלת השרת
app.listen(port, () => {
  console.log(`Botito Gemini server with history listening on port ${port}`);
});

const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());

app.post("/message", (req, res) => {
  const { msg } = req.body;

  // תגובה פשוטה כדי לבדוק חיבור
  const reply = `🤖 בוטיטו אומר: קיבלתי "${msg}"!`;

  res.json({ reply });
});

app.listen(PORT, () => {
  console.log(`Botito server running on port ${PORT}`);
});

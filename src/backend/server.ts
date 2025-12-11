import express from "express";
import path from "path";

const app = express();
const PORT = 5000;

// Sert les fichiers du dossier public (bundle.js + index.html)
app.use(express.static(path.join(__dirname, "../../public")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../../public/index.html"));
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
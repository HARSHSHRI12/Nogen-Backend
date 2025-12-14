const express = require("express");
const fs = require("fs");
const { exec } = require("child_process");
const path = require("path");
const { v4: uuidv4 } = require("uuid");

const router = express.Router();

router.post("/run-code", (req, res) => {
  const { language, code, input = "", expectedOutput = "" } = req.body;

  if (!language || !code) {
    return res.status(400).json({ success: false, error: "Language and code are required." });
  }

  const id = uuidv4();
  const fileExtension =
    language === "python" ? "py" : language === "javascript" ? "js" : "";
  if (!fileExtension) {
    return res.status(400).json({ success: false, error: "Unsupported language." });
  }

  const filename = `${id}.${fileExtension}`;
  const filePath = path.join(__dirname, "../temp", filename);

  // ✅ Create temp folder if not exist
  const tempFolder = path.join(__dirname, "../temp");
  if (!fs.existsSync(tempFolder)) {
    fs.mkdirSync(tempFolder);
  }

  // 🧠 Add input handling logic
  const inputCode =
    language === "javascript"
      ? `${code}\nconsole.log(main(${input}));`
      : `${code}\nprint(main(${input}))`;

  fs.writeFileSync(filePath, inputCode);

  const command =
    language === "javascript"
      ? `node "${filePath}"`
      : `python "${filePath}"`;

  const startTime = Date.now();

  exec(command, (error, stdout, stderr) => {
    fs.unlinkSync(filePath); // ✅ Always delete temp file after execution
    const endTime = Date.now();
    const executionTime = `${endTime - startTime}ms`;

    if (error) {
      return res.status(200).json({ success: false, error: error.message });
    }

    const output = stdout.trim();
    const result = {
      input,
      output,
      expected: expectedOutput,
      status: output === expectedOutput ? "Passed" : "Failed",
      executionTime
    };

    return res.status(200).json({ success: true, result });
  });
});

module.exports = router;

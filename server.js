const express = require("express");
const bodyParser = require("body-parser");
const {
  openBrowser,
  goto,
  click,
  textBox,
  write,
  into,
  waitFor,
  $,
  evaluate,
  closeBrowser
} = require("taiko");

const app = express();
app.use(bodyParser.json());
app.use(express.static("public")); // Serve frontend from /public

// Use Chromium from Render
process.env.TAIKO_BROWSER_PATH = "/usr/bin/chromium-browser";

// Core function
async function fetchAttendanceFromPortal(username, password) {
  let browserOpen = false;
  try {
    await openBrowser({
      headless: true, // Headless for Render deployment
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-gpu",
        "--window-size=1280,800",
        "--ignore-certificate-errors"
      ]
    });
    browserOpen = true;

    await goto("http://mitsims.in/");
    await click("Student");

    await write(username, into(textBox({ id: "inputStuId" })));
    await write(password, into(textBox({ id: "inputPassword" })));
    await click("Login");

    await waitFor(async () => (await $("#displayfield-1133").exists()), {
      timeout: 15000
    });

    const data = await evaluate(() => {
      const numSubjects = 13;
      const startNameId = 1130;
      const startPercentId = 1133;
      const step = 6;
      let subjects = [];

      for (let i = 0; i < numSubjects; i++) {
        const nameId = `displayfield-${startNameId + i * step}`;
        const percentId = `displayfield-${startPercentId + i * step}`;
        const nameEl = document.getElementById(nameId);
        const percentEl = document.getElementById(percentId);
        if (percentEl) {
          const percent = parseFloat(percentEl.innerText.trim()) || 0;
          let subjectName = "Subject Name Missing";
          if (nameEl && nameEl.innerText) {
            subjectName = nameEl.innerText.trim().replace(/:\s*$/, "").trim();
          }
          subjects.push({ subject: subjectName, percent });
        }
      }

      const totalPercent = subjects.reduce((sum, s) => sum + s.percent, 0);
      const overall =
        subjects.length > 0
          ? (totalPercent / subjects.length).toFixed(2)
          : "0.00";

      return { subjects, overall };
    });

    return data;
  } catch (err) {
    console.error("Scraping error:", err);
    throw new Error("Failed to fetch attendance");
  } finally {
    if (browserOpen) {
      try {
        await closeBrowser();
      } catch (closeError) {
        console.error("Browser close error:", closeError.message);
      }
    }
  }
}

// API endpoint
app.post("/fetch-attendance", async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password)
    return res.status(400).json({ error: "Username & password required" });

  try {
    const result = await fetchAttendanceFromPortal(username, password);
    res.json({ success: true, ...result });
  } catch {
    res.status(500).json({
      success: false,
      error: "Failed to fetch attendance. Check credentials or portal status."
    });
  }
});

// Server listen (for Render)
const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0", () =>
  console.log(`✅ Server running on port ${PORT}`)
);

// server.js
const express = require("express");
const bodyParser = require("body-parser");
const { chromium } = require("playwright");

const app = express();
app.use(bodyParser.json());
app.use(express.static("public")); // Serve HTML from /public

// Function to scrape attendance
async function fetchAttendance(username, password) {
  let browser;
  try {
    console.log("🎯 Launching headless browser...");
    browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();

    console.log("🌐 Navigating to MITS IMS...");
    await page.goto("https://mitsims.in/", { waitUntil: "domcontentloaded", timeout: 60000 });

    console.log("🔑 Clicking on Student login...");
    await page.click("text=Student");

    console.log("🧾 Filling credentials...");
    await page.fill("#inputStuId", username);
    await page.fill("#inputPassword", password);
    await page.click("text=Login");

    console.log("⏳ Waiting for dashboard to load...");
    await page.waitForTimeout(5000);

    // Check for successful login
    const dashboardVisible = await page.isVisible("text=Attendance");
    if (!dashboardVisible) {
      throw new Error("Invalid credentials or portal layout changed");
    }

    console.log("📋 Navigating to Attendance page...");
    await page.click("text=Attendance");
    await page.waitForSelector("table", { timeout: 20000 });

    console.log("✅ Extracting attendance data...");
    const attendanceData = await page.evaluate(() => {
      const table = document.querySelector("table");
      if (!table) return "No attendance data found.";
      return table.innerText;
    });

    return attendanceData;
  } catch (err) {
    console.error("❌ Scraping error:", err.message);
    throw new Error("Failed to fetch attendance: " + err.message);
  } finally {
    if (browser) {
      await browser.close();
      console.log("🔒 Browser closed");
    }
  }
}

// Route for attendance API
app.post("/fetch-attendance", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: "Username and password required" });
  }

  console.log(`📨 Fetch request for user: ${username}`);

  try {
    const attendance = await fetchAttendance(username, password);
    res.json({ success: true, data: attendance });
  } catch (error) {
    console.error("⚠️ Error in /fetch-attendance:", error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running at http://localhost:${PORT}`));

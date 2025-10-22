// server.js
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
app.use(express.static("public")); // Serve static HTML if needed

// Set Chrome path
process.env.TAIKO_BROWSER_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";

async function fetchAttendanceFromPortal(username, password) {
    let browserOpen = false;

    try {
        // Open Chrome browser
        await openBrowser({
            headless: false, // Change to true in production
            args: ["--disable-web-security", "--ignore-certificate-errors"]
        });
        browserOpen = true;

        // Navigate to MITS portal
        await goto("http://mitsims.in/");
        await click("Student");

        // Fill credentials and login
        await write(username, into(textBox({ id: "inputStuId" })));
        await write(password, into(textBox({ id: "inputPassword" })));
        await click("Login");

        // Wait for attendance element to appear
        await waitFor(async () => await $("#displayfield-1133").exists(), { timeout: 15000 });

        // Scrape attendance data
        const data = await evaluate(() => {
            const numSubjects = 13;
            const startNameId = 1130;
            const startAttendedId = 1131;
            const startConductedId = 1132;
            const step = 6;

            const subjects = [];
            let totalAttended = 0;
            let totalConducted = 0;

            for (let i = 0; i < numSubjects; i++) {
                const nameEl = document.getElementById(`displayfield-${startNameId + i * step}`);
                const attendedEl = document.getElementById(`displayfield-${startAttendedId + i * step}`);
                const conductedEl = document.getElementById(`displayfield-${startConductedId + i * step}`);

                const subjectName = nameEl?.innerText.trim().replace(/:\s*$/, '') || "Subject Name Missing";
                const attended = parseFloat(attendedEl?.innerText.trim()) || 0;
                const conducted = parseFloat(conductedEl?.innerText.trim()) || 0;

                const percent = conducted > 0 ? ((attended / conducted) * 100).toFixed(2) : 0;

                subjects.push({ subject: subjectName, attended, conducted, percent });

                totalAttended += attended;
                totalConducted += conducted;
            }

            // Correct overall attendance using total attended ÷ total conducted
            const overall = totalConducted ? ((totalAttended / totalConducted) * 100).toFixed(2) : 0;

            return { subjects, overall };
        });

        return data;

    } catch (err) {
        console.error("Navigation / scraping error:", err);
        throw err;
    } finally {
        // Ensure browser closes
        if (browserOpen) {
            try {
                await closeBrowser();
            } catch (closeError) {
                console.error("Error closing browser:", closeError.message);
            }
        }
    }
}

// API endpoint
app.post("/fetch-attendance", async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ error: "Username & password required" });

    try {
        const result = await fetchAttendanceFromPortal(username, password);
        res.json({ success: true, ...result });
    } catch (err) {
        res.status(500).json({ success: false, error: "Failed to fetch attendance. Check credentials or portal status." });
    }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => console.log(`Server running on port ${PORT}`));

module.exports = { fetchAttendanceFromPortal };

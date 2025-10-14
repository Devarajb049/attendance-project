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
    waitFor,      // Fixes ReferenceError
    waitForElement,
    $,
    evaluate,
    closeBrowser
} = require("taiko");

const app = express();
app.use(bodyParser.json());
app.use(express.static("public")); // Serve HTML from public folder

// Use your installed Chrome
process.env.TAIKO_BROWSER_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe"; // Update if different

async function fetchAttendanceFromPortal(username, password) {
    let browserOpen = false; // Track browser state locally
    try {
        await openBrowser({
            headless: false, // Show browser for debugging
            args: ["--disable-web-security", "--ignore-certificate-errors"]
        });
        browserOpen = true; // Mark browser as open

        // Go to portal
        await goto("http://mitsims.in/");
        await click("Student");

        await write(username, into(textBox({ id: "inputStuId" })));
        await write(password, into(textBox({ id: "inputPassword" })));
        await click("Login");

        // Wait for attendance elements (using one of the expected IDs)
        await waitFor(async () => await $("#displayfield-1133").exists(), { timeout: 15000 });

        // Scrape data
        const data = await evaluate(() => {
            const numSubjects = 13;
            const startNameId = 1130;
            const startPercentId = 1133;
            const step = 6;

            let subjects = [];
            
            // Loop 13 times to generate the paired IDs
            for (let i = 0; i < numSubjects; i++) {
                const nameId = `displayfield-${startNameId + (i * step)}`;
                const percentId = `displayfield-${startPercentId + (i * step)}`;

                const nameEl = document.getElementById(nameId);
                const percentEl = document.getElementById(percentId);

                if (percentEl) {
                    const percent = parseFloat(percentEl.innerText.trim()) || 0;
                    
                    let subjectName = "Subject Name Missing";
                    
                    if (nameEl && nameEl.innerText) {
                        // Extract the name, cleaning up potential trailing colons or whitespace
                        subjectName = nameEl.innerText.trim().replace(/:\s*$/, '').trim();
                    }

                    subjects.push({ subject: subjectName, percent });
                }
            }
            
            // Calculate overall attendance based only on successfully scraped subjects
            const totalPercent = subjects.reduce((sum, s) => sum + s.percent, 0);
            const overall = (subjects.length > 0 ? (totalPercent / subjects.length) : 0).toFixed(2); 

            return { subjects, overall };
        });

        return data;

    } catch (err) {
        console.error("Navigation / scraping error:", err);
        throw err;
    } finally {
        // We use a try/catch here to ensure that even if closing the browser fails, 
        // the function still finishes, preventing the process from hanging.
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

// Start server on all network interfaces (for phone access)
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => console.log(`Server running on port ${PORT}`));

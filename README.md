# Attendance Project

This project automates the process of fetching and calculating attendance data for students. It utilizes **Taiko** for web scraping, **Express.js** for the API server, and **Telegram Bot API** for notifications.

## Features

- **Attendance Calculation**: Fetches attendance data and calculates overall attendance percentages.
- **Telegram Notifications**: Sends attendance updates via Telegram bot.
- **API Endpoint**: Provides a RESTful API to trigger attendance fetching.

## Technologies Used

- **Node.js**: JavaScript runtime for server-side scripting.
- **Express.js**: Web framework for building the API server.
- **Taiko**: Headless browser for web scraping.
- **node-telegram-bot-api**: Library for interacting with Telegram Bot API.
- **dotenv**: Loads environment variables from a `.env` file.

## Setup Instructions

### Prerequisites

Ensure you have the following installed:

- [Node.js](https://nodejs.org/) (version 14 or higher)
- [npm](https://www.npmjs.com/) (Node Package Manager)

### Installation

1. Clone the repository:

```bash
git clone https://github.com/Devarajb049/attendance-project.git
cd attendance-project

```
Install dependencies:
```
npm install
```

Create a .env file in the root directory and add your environment variables:
```
TELEGRAM_BOT_TOKEN=your-telegram-bot-token
CHAT_ID=your-chat-id
TAIKO_BROWSER_PATH=/usr/bin/google-chrome
PORT=3000
```

Replace your-telegram-bot-token with your Telegram bot token and your-chat-id with your Telegram chat ID. Update TAIKO_BROWSER_PATH according to your environment.

Running the Project Locally

To start the server and bot:
```
node server.js
```

The Express server will start.

The Telegram bot will be active.

Attendance data can be fetched via API calls.

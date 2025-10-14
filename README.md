# Result Automation Tool

This project is a result automation tool built using **Node.js**, **Inquirer.js**, and **Taiko**. The tool automates the process of fetching results from the APSBTET result page for a batch of students based on their admission year, branch, and semester.

## Features

- **Automated Result Fetching**: Automatically fills in the pin number and selects the semester on the result page.
- **Batch Processing**: Generates and processes pin numbers for a specified admission year, branch, and batch size.
- **Error Handling**: Handles cases where the result is not available by clearing the input and moving on to the next pin.
- **Headless Browser**: Uses Taiko in headless mode for faster automation and scraping.

## Requirements

- **Node.js** (v12 or higher)
- **Taiko** browser automation framework
- **Inquirer.js** for interactive CLI

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/result-automation.git
   ```

2. Navigate to the project directory:

    ```bash
    cd result-automation
    ```

3. Install the necessary dependencies:
    ```
    npm install
    ```

4. Install Taiko globally (if not already installed):

    ```
    npm install -g taiko
    ```

## Usage

1. Run the automation script:

    ```bash
    node automation.js
    ```
2. You will be prompted to provide the following information:

    - Result Link: The URL to the result page. (Default: https://sbtet.ap.gov.in/APSBTET/results.do)

    -  Semester: Select the semester for which you want to check results. (Options: 1YEAR, 3SEM, 4SEM, 5SEM, 6SEM)

    -  Admission Year: Enter the admission year, Default: 22(2022).

    - Branch: Select the branch (Options: CM, EC, M, EE).

3. The tool will generate the pin numbers for the students and begin the automated result retrieval process.

4. The results will be displayed on the console with the pin number and grand total.




# AI Code Review Assistant

A web-based application that leverages the Google Gemini API to provide intelligent, real-time code reviews. Upload your source code files to receive an in-depth analysis of readability, modularity, and potential bugs.


---

## ✨ Features

-   **Drag-and-Drop File Upload:** Easily upload code files through a modern, intuitive interface.
-   **AI-Powered Analysis:** Get instant feedback on your code's quality, structure, and potential issues.
-   **Persistent Review History:** All reviews are automatically saved and can be accessed or deleted at any time.
-   **Secure API Key Handling:** Utilizes environment variables to keep your API keys safe and private.
-   **Clean, Sci-Fi UI:** A visually appealing interface built with Tailwind CSS.

---

## 🛠️ Tech Stack

-   **Backend:** Python, Flask
-   **Frontend:** HTML, CSS, JavaScript
-   **AI Model:** Google Gemini Pro
-   **Styling:** Tailwind CSS
-   **Database:** SQLite

---

## 🚀 Setup and Installation

Follow these steps to get the project running on your local machine.

### 1. Clone the Repository
First, clone the project from GitHub to your local machine.
```bash
git clone [https://github.com/your-username/your-repository-name.git](https://github.com/your-username/your-repository-name.git)
cd your-repository-name
````

### 2\. Create and Activate a Virtual Environment

It's highly recommended to use a virtual environment to manage project dependencies.

  - **On Windows:**
    ```bash
    python -m venv venv
    .\venv\Scripts\activate
    ```
  - **On macOS / Linux:**
    ```bash
    python3 -m venv venv
    source venv/bin/activate
    ```

### 3\. Install Dependencies

Install all the required Python packages using the `requirements.txt` file.

```bash
pip install -r requirements.txt
```

### 4\. Set Up Environment Variables

You need to provide your own Google Gemini API key.

1.  Create a new file named `.env` in the root of the project folder.
2.  Add your API key to this file in the following format. **Do not** use quotes.
    ```
    GEMINI_API_KEY=YourSecretApiKeyGoesHere
    ```

### 5\. Run the Application

Start the Flask server. The application will initialize the database on the first run.

```bash
python app.py
```

Once the server is running, open your web browser and navigate to `http://127.0.0.1:5000`.

-----

## Usage

1.  **Upload a File:** Drag a source code file onto the dropzone or click it to select a file from your computer.
2.  **Review Code:** Click the "Review Code" button to submit the file for analysis.
3.  **View Report:** The AI-generated review will appear in the "Review Report" panel.
4.  **Access History:** Previous reviews are listed in the "Review History" sidebar. Click on any item to view its report again.
5.  **Delete History:** Click the `×` icon on a history item to permanently delete it.

<!-- end list -->

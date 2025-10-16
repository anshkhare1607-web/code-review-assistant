# app.py
from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import sqlite3
import google.generativeai as genai
from dotenv import load_dotenv
from datetime import datetime

# --- Database Setup ---
def init_db():
    """Initializes the database and creates the 'reviews' table if it doesn't exist."""
    conn = sqlite3.connect('reviews.db')
    cursor = conn.cursor()
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS reviews (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        filename TEXT NOT NULL,
        review_content TEXT NOT NULL,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    )
    ''')
    conn.commit()
    conn.close()

# ------------------------

# Load environment variables
load_dotenv()

# Create and configure the Flask app
app = Flask(__name__)
CORS(app) # Enable Cross-Origin Resource Sharing

# Configure the Gemini API
try:
    genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
except Exception as e:
    print(f"Error configuring Gemini API: {e}")

# This is the function that talks to the AI
def get_llm_review(code_content):
    model = genai.GenerativeModel('gemini-pro-latest') 
    
    prompt = f"""
    Act as an expert code reviewer.
    Analyze the following code for readability, modularity, and potential bugs.
    Provide clear, actionable improvement suggestions in a well-structured format.

    --- CODE START ---
    {code_content}
    --- CODE END ---
    """
    try:
        response = model.generate_content(prompt)
        return response.text
    except Exception as e:
        print(f"Error calling LLM: {e}")
        return "Error: Could not get a review from the language model."

# --- API Endpoints ---

@app.route('/review', methods=['POST'])
def review_code():
    if 'file' not in request.files:
        return jsonify({"error": "No file part"}), 400
    
    file = request.files['file']
    
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400

    if file:
        code_content = file.read().decode('utf-8')
        review_text = get_llm_review(code_content)
        new_id = None # Initialize new_id
        
        try:
            conn = sqlite3.connect('reviews.db')
            cursor = conn.cursor()
            cursor.execute("INSERT INTO reviews (filename, review_content) VALUES (?, ?)", 
                           (file.filename, review_text))
            new_id = cursor.lastrowid  # Get the ID of the new row
            conn.commit()
            conn.close()
        except Exception as e:
            print(f"Error saving to database: {e}")
            
        # Return the new ID along with the review
        return jsonify({"review": review_text, "id": new_id}) 
    
    return jsonify({"error": "An unknown error occurred"}), 500

@app.route('/history', methods=['GET'])
def get_history():
    """Fetches all past reviews from the database."""
    try:
        conn = sqlite3.connect('reviews.db')
        conn.row_factory = sqlite3.Row 
        cursor = conn.cursor()
        cursor.execute("SELECT id, filename, review_content, timestamp FROM reviews ORDER BY timestamp DESC")
        rows = cursor.fetchall()
        conn.close()
        
        history = [dict(row) for row in rows]
        return jsonify(history)
        
    except Exception as e:
        print(f"Error fetching history: {e}")
        return jsonify({"error": "Could not fetch history"}), 500

@app.route('/history/<int:item_id>', methods=['DELETE'])
def delete_history_item(item_id):
    """Deletes a specific review item from the database."""
    try:
        conn = sqlite3.connect('reviews.db')
        cursor = conn.cursor()
        cursor.execute("DELETE FROM reviews WHERE id = ?", (item_id,))
        conn.commit()
        conn.close()
        return jsonify({"success": True, "message": f"Item {item_id} deleted."})
    except Exception as e:
        print(f"Error deleting item: {e}")
        return jsonify({"success": False, "error": "Could not delete item"}), 500

# This starts the server
if __name__ == '__main__':
    init_db() 
    app.run(port=5000, debug=True)


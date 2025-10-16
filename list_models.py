import os
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

try:
    genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
    print("API Key configured.")
    print("---")
    print("Listing available models:")

    for m in genai.list_models():
        if 'generateContent' in m.supported_generation_methods:
            print(f"- {m.name}")

    print("---")
    print("Model list complete.")

except Exception as e:
    print(f"\nAN ERROR OCCURRED: {e}")
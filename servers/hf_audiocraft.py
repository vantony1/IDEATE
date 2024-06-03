import time
import shutil
from flask import Flask, request, jsonify
from flask_cors import CORS
from gradio_client import Client

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

def initialize_client(url, token, max_retries=5, delay=5):
    retries = 0
    client = None
    while retries < max_retries:
        try:
            client = Client(url, hf_token=token)
            print(f"Successfully initialized client for {url}")
            break
        except Exception as e:
            retries += 1
            print(f"Error initializing client for {url}: {e}. Retrying {retries}/{max_retries}...")
            time.sleep(delay)
    return client

audioGenClient = initialize_client("https://vantony-audiogen.hf.space/", 'ENTER_HUGGING_FACE_API_KEY')
musicGenClient = initialize_client("https://vantony-musicalgen.hf.space/", 'ENTER_HUGGING_FACE_API_KEY')

@app.route('/generate_music', methods=['POST'])
def generate_music():
    if musicGenClient is None:
        return jsonify({"error": "Music Generation Service Unavailable"}), 503
    data = request.get_json()
    # Check for required 'prompt'
    if 'prompt' not in data:
        return jsonify({"error": "prompt is required"}), 400
    
    try:
        input_values = {
            "text": data['prompt'],
            "duration": int(data.get('duration', 5)),
            "top-k": int(data.get('top-k', 250)),
            "top-p": int(data.get('top-p', 0)),
            "temperature": float(data.get('temperature', 1.0)),
            "guidance": float(data.get('guidance', 3.0))
        }
    except ValueError as e:
        return jsonify({"error": str(e)}), 400

    result = musicGenClient.predict(
        input_values["text"],  
        input_values["duration"],  
        input_values["top-k"],  
        input_values["top-p"],  
        input_values["temperature"],  
        input_values["guidance"],
        fn_index=0  
    )

    return result

@app.route('/generate_audio', methods=['POST'])
def generate_audio():
    if audioGenClient is None:
        return jsonify({"error": "Audio Generation Service Unavailable"}), 503
    data = request.get_json()
    # Check for required 'prompt'
    if 'prompt' not in data:
        return jsonify({"error": "prompt is required"}), 400
    
    try:
        input_values = {
            "text": data['prompt'],
            "duration": int(data.get('duration', 5)),
            "top-k": int(data.get('top-k', 250)),
            "top-p": int(data.get('top-p', 0)),
            "temperature": float(data.get('temperature', 1.0)),
            "guidance": float(data.get('guidance', 3.0))
        }
    except ValueError as e:
        return jsonify({"error": str(e)}), 400

    result = audioGenClient.predict(
        "/home/user/app",  # Model
        "Default",  # Decoder
        input_values["text"],  
        input_values["duration"],  
        input_values["top-k"],  
        input_values["top-p"],  
        input_values["temperature"],  
        input_values["guidance"],
        fn_index=1  
    )

    return result


if __name__ == '__main__':
    app.run(host='0.0.0.0', port='6002')

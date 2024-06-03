from flask import Flask, request, jsonify
from flask_cors import CORS
import torch
import numpy as np
import cv2
from segment_anything import sam_model_registry, SamPredictor
from segment_anything.utils.onnx import SamOnnxModel
from urllib.parse import urlparse
import requests
import os

app = Flask(__name__)
CORS(app) 

# Load the model -- download from and extract to the directory with this file: https://github.com/facebookresearch/segment-anything
#checkpoint = "sam_vit_h_4b8939.pth"
#model_type = "vit_h"

checkpoint = "sam_vit_b_01ec64.pth"
model_type = "vit_b"
sam = sam_model_registry[model_type](checkpoint=checkpoint)
predictor = SamPredictor(sam)

@app.route('/generate_embedding', methods=['POST'])
def generate_embedding():
    try:
        # Get the path to the image from the request
        data = request.get_json()
        image_url = data.get('url')
        image_name = data.get('image_name')

        # Parse the filename from the url
        a = urlparse(image_url)
        filename = os.path.basename(a.path)
        _, file_extension = os.path.splitext(filename)

        # Download and save the image to the local ./data folder
        image_path = os.path.join("./images", image_name+file_extension)
        response = requests.get(image_url)
        with open(image_path, 'wb') as f:
            f.write(response.content)
        
        # Load the image
        image = cv2.imread(image_path)
        
        # Set the image for prediction
        predictor.set_image(image)
        
        # Get the image embedding
        image_embedding = predictor.get_image_embedding().cpu().numpy()
        
        # Save the image embedding as "car_embedding.npy"
        np.save("./images/"+image_name+'.npy', image_embedding)
        
        return jsonify({'message': 'Image embedding generated and saved successfully!'})
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0',port='6005')


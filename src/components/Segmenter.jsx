// Copyright (c) Meta Platforms, Inc. and affiliates.
// All rights reserved.

// This source code is licensed under the license found in the
// LICENSE file in the root directory of this source tree || import "./sany/assets/scss/App.scss";
// However, we modified it to fit our system
import { InferenceSession } from "onnxruntime-web";
import React, { useEffect, useState } from "react";
import { handleImageScale } from "./sany/helpers/scaleHelper";
import { onnxMaskToImage } from "./sany/helpers/maskUtils";
import { modelData } from "./sany/helpers/onnxModelAPI";
import Stage from "./sany/Stage";
import npyjs from "npyjs";
import { useRecoilState } from "recoil";
import { imageState, clicksState, maskImgState, imagePath, imageEmbedding, modelDir} from "../services/state";
import { Button, Stack, TextField } from "@mui/material";
import axios from "axios";
import 'react-toastify/dist/ReactToastify.css';
import { toast } from 'react-toastify';


const ort = require("onnxruntime-web");
const MODEL_DIR = "/model/sam_onnx_b.onnx"

const Segmenter = () => {
  const [image, setImage] = useRecoilState(imageState);
  const [clicks, setClicks] = useRecoilState(clicksState);
  const [maskImg, setMaskImg] = useRecoilState(maskImgState);
  const [name, setName] = useState('');

  const [IMAGE_PATH, setImagePath] = useRecoilState(imagePath)

  const [model, setModel] = useState(null); // ONNX model
  const [tensor, setTensor] = useState(null); // Image embedding tensor

  const proxyServerURL = 'http://localhost:7053';

  // The ONNX model expects the input to be rescaled to 1024. 
  // The modelScale state variable keeps track of the scale values.
  const [modelScale, setModelScale] = useState(null);

  const retrieveFile = async (path) => {
    console.log(path)
    const response = await axios
                            .get(`${proxyServerURL}/file?path=${path}`, { responseType: 'blob' })
                            .catch(error => console.error('Error fetching file:', error));
    return response.data
  }

  function changeExtensionToNpy(inputString) {
    // Find the last occurrence of a period (.) in the string
    const lastPeriodIndex = inputString.lastIndexOf(".");
  
    if (lastPeriodIndex !== -1) {
      // Extract the part of the string before the last period
      const pathWithoutExtension = inputString.slice(0, lastPeriodIndex);
  
      // Append the new extension ".npy" to the path
      return pathWithoutExtension + ".npy";
    } else {
      // If there is no period in the string, return the original string as-is
      return inputString;
    }
  }

  // Initialize the ONNX model. load the image, and load the SAM
  // pre-computed image embedding
  useEffect(() => {
    const embedding_path = changeExtensionToNpy(IMAGE_PATH)
    // Initialize the ONNX model
    const initModel = async () => {
      try {
        if (MODEL_DIR === undefined) return;
        const URL = MODEL_DIR;
        const model = await InferenceSession.create(MODEL_DIR);
        setModel(model);
      } catch (e) {
        console.log(e);
      }
    };
    initModel();

    const getImage = async () => {
      try {
        const response = await retrieveFile(IMAGE_PATH)
        loadImage(response)
      } catch (e) {
        console.log(e);
      }
    }
    getImage()

    // Load the Segment Anything pre-computed embedding
    Promise.resolve(loadNpyTensor(embedding_path, "float32")).then(
      (embedding) => setTensor(embedding)
    );
  }, [IMAGE_PATH]);

  const loadImage = async (blob) => {
    try {
      const objectURL = URL.createObjectURL(blob);
      const img = new Image();
      img.src = objectURL;
      img.onload = () => {
        const { height, width, samScale } = handleImageScale(img);
        setModelScale({
          height: height,  // original image height
          width: width,  // original image width
          samScale: samScale, // scaling factor for image which has been resized to longest side 1024
        });
        img.width = width; 
        img.height = height; 
        setImage(img);
      };
    } catch (error) {
      console.log(error);
    }
  };

  // Decode a Numpy file into a tensor. 
  const loadNpyTensor = async (tensorFile, dType) => {
    let npLoader = new npyjs();
    const blob = await retrieveFile(tensorFile);
    const arrayBuffer = await blob.arrayBuffer();
    const npArray = await npLoader.parse(arrayBuffer);
    const tensor = new ort.Tensor(dType, npArray.data, npArray.shape);
    return tensor;
  };
  // Run the ONNX model every time clicks has changed
  useEffect(() => {
    runONNX();
  }, [clicks]);

  const runONNX = async () => {
    try {
      if (
        model === null ||
        clicks === null ||
        tensor === null ||
        modelScale === null
      )
        return;
      else {
        // Preapre the model input in the correct format for SAM. 
        // The modelData function is from onnxModelAPI.tsx.
        const feeds = modelData({
          clicks,
          tensor,
          modelScale,
        });
        if (feeds === undefined) return;
        // Run the SAM ONNX model with the feeds returned from modelData()
        const results = await model.run(feeds);
        const output = results[model.outputNames[0]];
        // The predicted mask returned from the ONNX model is an array which is 
        // rendered as an HTML image using onnxMaskToImage() from maskUtils.tsx.
        setMaskImg(onnxMaskToImage(output.data, output.dims[2], output.dims[3]));
      }
    } catch (e) {
      console.log(e);
    }
  };

  const saveMask = async () => {
    if(!(clicks.length > 0)){
      toast.error("Please choose a segment first")
      return
    }

    const canvas = document.createElement('canvas');
    canvas.width = image.width;
    canvas.height = image.height;
    const context = canvas.getContext('2d');
  
    // Draw the original image
    const img1 = new Image();
    img1.src = image.src;
    await new Promise((resolve) => {
      img1.onload = () => {
        context.drawImage(img1, 0, 0, image.width, image.height);
        resolve();
      };
    });
  
    // Draw the mask image
    const img2 = new Image();
    img2.src = maskImg.src;
    await new Promise((resolve) => {
      img2.onload = () => {
        context.globalCompositeOperation = 'destination-in';
        context.drawImage(img2, 0, 0, image.width, image.height);
        context.globalCompositeOperation = 'source-over';
        resolve();
      };
    });
  
    // Find the bounding box of the content in the image
    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (let y = 0; y < canvas.height; y++) {
      for (let x = 0; x < canvas.width; x++) {
        const index = (y * canvas.width + x) * 4;
        const alpha = imageData.data[index + 3]; // alpha value
        if (alpha > 0) { // if the pixel is not fully transparent
          minX = Math.min(minX, x);
          minY = Math.min(minY, y);
          maxX = Math.max(maxX, x);
          maxY = Math.max(maxY, y);
        }
      }
    }
  
    // Crop the image to the bounding box
    const width = maxX + 1 - minX;
    const height = maxY + 1 - minY;
    const croppedImageData = context.getImageData(minX, minY, width, height);
    const croppedCanvas = document.createElement('canvas');
    croppedCanvas.width = width;
    croppedCanvas.height = height;
    const croppedContext = croppedCanvas.getContext('2d');
    croppedContext.putImageData(croppedImageData, 0, 0);
  
    // Now, you can save the cropped image from canvas
    const croppedImageSrc = croppedCanvas.toDataURL('image/png');
    const segment = getBase64FromImageUrl(croppedImageSrc);

    saveSegment(name, segment)
  }

  function getBase64FromImageUrl(imageUrl) {
    const parts = imageUrl.split(',');
    if (parts.length < 2) {
      throw new Error('Invalid image URL');
    }
    return parts[1];
  }

  const saveSegment = async (name, segment) => {
    if(name.includes("'")) {
      toast.warn("name contains an apostrophe: Apostrophes are not allowed in the name");
      return;
    }
    resetClicks()
    try {
      const response = await fetch(`${proxyServerURL}/save-base64`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ image: segment, name })
      });
  
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      toast.success(`Segment saved successfully as: ${name}`)
    } catch (error) {
      toast.error(`An error occurred while saving the image: ${error}`)
      console.error('An error occurred while saving the image.', error);
    }
  };

  const resetClicks = () => {
    setClicks([])
  }
  return (
    <div>
      <Stage />
      <Stack direction={"row"} sx={{margin: '1rem'}} spacing={2}>
      <TextField
        label="Enter Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        sx={{backgroundColor: 'white'}}
      />
      <Button variant="outlined" sx={{backgroundColor: 'white'}} onClick={() => saveMask()}>Save Selection</Button>
      </Stack>
      
    </div>
  );
};

export default Segmenter;

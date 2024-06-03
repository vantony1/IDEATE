import React, { useEffect, useState } from 'react';
import {
  Box,
  FormControl,
  FormLabel,
  Typography,
  Grid,
  Tabs,
  Tab,
  Stack,
  CardMedia,
  LinearProgress,
  Radio,
  RadioGroup,
  FormControlLabel,
  Slider,
  Button,
  Paper,
  IconButton,
  TextField,
  Tooltip,
  CircularProgress,
  Skeleton
} from '@mui/material';
import axios from 'axios';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import { v4 as uuidv4 } from 'uuid';
import { useRecoilState, useRecoilValue } from "recoil";
import { imagePath, imageEmbedding, loggerID } from "../services/state";
import Segmenter from './Segmenter';
import TimeProgressBar from './TimeProgressBar';
import 'react-toastify/dist/ReactToastify.css';
import { toast } from 'react-toastify';
import { useLogger } from '../services/Logger';

const VisualsGenerator = () => {
  const sessionId = useRecoilValue(loggerID)
  const [generatedImages, setGeneratedImages] = useState([]);
  const proxyServerURL = 'http://localhost:7053';
  const segmenterServerURL = 'http://localhost:6005';
  const [awaitingResponse, setAwaitingResponse] = useState(false)
  const [awaitingSegmentation, setAwaitingSegmentation] = useState(false)
  const [prompt, setPrompt] = useState('');
  const [negativePrompt, setNegativePrompt] = useState('');
  const [samples, setSamples] = useState(1);
  const [denoiseStep, setDenoiseSteps] = useState(21);
  const [panorama, setPanaroma] = useState("no");
  const [seed, setSeed] = useState(null)
  const [selfAttention, setSelfAttention] = useState("no");
  const [selectedImage, setSelectedImage] = useState(0);
  const [showOptions, setShowOptions] = useState(false);
  const [segmented, setSegmented] = useState(false)
  const [segments, setSegments] = useState([])
  const [segmentDelay, setSegmentDelay] = useState(0)
  const [timeDelay, setTimeDelay] = useState(0)
  const [selectedSegment, setSelectedSegment] = useState(null)
  const [IMAGE_PATH, setImagePath] = useRecoilState(imagePath)
  const [IMAGE_EMBEDDING, setImageEmbedding] = useRecoilState(imageEmbedding)
  const logger = useLogger()

  const API_KEY = "ENTER_OPENAI_KEY";

  const generateRandomId = () => {
    return uuidv4().split('-')[0];
  };

  const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  const toggleShowOptions = () => {
    setShowOptions((prevState) => !prevState);
  };

  const handleChangeTab = (event, newValue) => {
    setSelectedImage(newValue);
  };

  const handleSelfAttentionChange = (event, newValue) => {
    setSelfAttention(newValue);
  };

  const handlePanaromaChange = (event, newValue) => {
    setPanaroma(newValue);
  };

  const handleDenoiseStepsChange = (event, newValue) => {
    setDenoiseSteps(newValue);
  };

  const handleSeedChange = (event, newValue) => {
    setSeed(newValue);
  };

  const handleSamplesChange = (event, newValue) => {
    setSamples(newValue);
  };
  const [filename, setFilename] = useState('');

  const handlePromptChange = (event) => {
    setPrompt(event.target.value);
  };

  const handleNegativePromptChange = (event) => {
    setNegativePrompt(event.target.value);
  };

  const handleFilenameChange = (event) => {
    setFilename(event.target.value);
  };

  const fetchGeneratedBackgrounds = async () => {
    try {
      if(prompt == ""){
        toast.warn('Prompt is empty: please provide a prompt')
        return
      }
      setAwaitingResponse(true)
      logger.logEvent(`sd_generation_logs_${sessionId}.txt`, `prompt: ${prompt} \n \n`)
      toast('Generating image(s)')

      const data = {
        model: "dall-e-3",
        prompt: prompt,
        n: 1,
        size: "1792x1024"
      };
      
      let response = await axios.post('https://api.openai.com/v1/images/generations', data, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_KEY}`
        }
      })

      console.log(response)

      toast.success('image(s) generated')
      const generatedImages = response.data.data.map((generated_image, index) => ({
        label: `user_generated_${index}`,
        value: generated_image.url
      }));
      setTimeDelay(0)
      setGeneratedImages(generatedImages);
      setAwaitingResponse(false)

    } catch (error) {
      toast.error(`Image generation failed: ${error}`)
      console.error('Failed to fetch generated backgrounds:', error);
    }
  };

  const handleSaveGeneratedBackground = async (url, file) => {
    if(file === ""){
      toast.warn('File name is empty: please provide a file name');
      return;
    }
    
    if(file.includes("'")) {
      toast.warn("File name contains an apostrophe: Apostrophes are not allowed in the file name");
      return;
    }
  
    let filename = file + '.png';
    
    try {
      await axios.post(
        `${proxyServerURL}/save_generated_background`, 
        { url, filename }
      );
      toast.success(`Background saved as: ${filename}`);
      console.log('Image saved successfully.');
    } catch (error) {
      toast.error('An error occurred while saving the image.');
      console.error('An error occurred while saving the image.', error);
    }
  };
  

  const segmentImage = async (url) => {
    try {
      setSegmented(false)
      setSegmentDelay(40000)
      setAwaitingSegmentation(true)
      toast('Segmenting image: eta - 40 seconds', {autoClose: 40000})
      const name = generateRandomId()

      await axios.post(
        `${segmenterServerURL}/generate_embedding`, 
        { "url": url, "image_name": name }
      );

      console.log('Image segmented successfully.');
      toast.success('Image segmented successfully.')
      setImagePath(`./segment-anything/images/${name}.png`)
      setSegmented(true)
      setSegmentDelay(0)
      setAwaitingSegmentation(false)

    } catch (error) {
      toast.error(`image segmentation failed: ${error}`)
      console.error('An error occurred while segmenting the image.', error);
    }
  };

  return (
    <Paper elevation={2} 
           sx={{ display: 'flex', 
                 flexDirection: "column",
                 justifyContent: 'center', 
                 alignItems: 'center', 
                 minHeight: '100vh'
                 }}
    >
    <Box
      component="form"
      sx={{
        padding: '1rem'
      }}
      noValidate
      autoComplete="off"
    >
        <Stack justifyContent="center"
        alignItems="center">
        <Stack direction={"row"} spacing={4}>
        <TextField
        id="sd-prompt"
        label="Prompt"
        variant="outlined"
        placeholder="A sunny beach with palm trees, studio ghibli style"
        value={prompt}
        onChange={handlePromptChange}
        sx={{backgroundColor: 'white', minWidth: '25rem'}}
      />
      <TextField
        id="sd-prompt"
        label="Negative Prompt"
        placeholder="plastic bottles, cars, sharks"
        variant="outlined"
        value={negativePrompt}
        onChange={handleNegativePromptChange}
        sx={{backgroundColor: 'white', minWidth: '25rem'}}
      />
        </Stack>


        <Tooltip disableFocusListener disableTouchListener placement='right' title={
              <div style={{ maxWidth: '8rem' }}>
                  <Typography color="inherit" variant='body' sx={{ fontSize: '1rem' }}>
                    Select number of images to be generated
                  </Typography>
              </div>
          }>
      <Typography gutterBottom sx={{marginTop: '1rem'}}>Num# Images</Typography>
      <Slider
        value={samples}
        onChange={handleSamplesChange}
        step={1}
        min={1}
        max={4}
        marks={[
          { value: 1, label: '1' },
          { value: 2, label: '2' },
          { value: 3, label: '3' },
          { value: 4, label: '4' },
        ]}
        sx={{maxWidth: '20rem'}}
      />
      </Tooltip>

      

      <IconButton onClick={toggleShowOptions}>
        {showOptions ?  <Tooltip disableFocusListener disableTouchListener title="Hide advanced options"><KeyboardArrowUpIcon/> </Tooltip>: <Tooltip disableFocusListener disableTouchListener title="Show advanced options"><ExpandMoreIcon /></Tooltip>}
      </IconButton>
      

    </Stack>
        {showOptions && (
          <Stack spacing={4} 
          justifyContent="center"
          alignItems="center"
          sx={{marginTop: '2rem'}}
          direction={"row"}>
        
        <Tooltip disableFocusListener disableTouchListener title={
              <div style={{ maxWidth: '8rem' }}>
                  <Typography color="inherit" variant='body' sx={{ fontSize: '1rem' }}>
                    Select 'yes' to generate a panorama image
                  </Typography>
              </div>
          }>

          <FormControl>
            <FormLabel id="panorama-radio">Panorama</FormLabel>
            <RadioGroup
              row
              aria-label="panorama"
              name="panorama"
              value={panorama}
              onChange={handlePanaromaChange}
            >
              <FormControlLabel value="yes" control={<Radio />} label="Yes" />
              <FormControlLabel value="no" control={<Radio />} label="No" />
            </RadioGroup>
          </FormControl>
          </Tooltip>

          <Tooltip disableFocusListener disableTouchListener title={
              <div style={{ maxWidth: '8rem' }}>
                  <Typography color="inherit" variant='body' sx={{ fontSize: '1rem' }}>
                      Select 'yes' to generate a higher quality image, but will take longer to generate
                  </Typography>
              </div>
          }>

          <FormControl>
            <FormLabel id="self-attention-radio">Self Attention</FormLabel>
            <RadioGroup
              row
              aria-label="self-attention"
              name="self-attention"
              value={selfAttention}
              onChange={handleSelfAttentionChange}
            >
              <FormControlLabel value="yes" control={<Radio />} label="Yes" />
              <FormControlLabel value="no" control={<Radio />} label="No" />
            </RadioGroup>
          </FormControl>
          </Tooltip>

          <Tooltip disableFocusListener disableTouchListener title={
              <div style={{ maxWidth: '8rem' }}>
                  <Typography color="inherit" variant='body' sx={{ fontSize: '1rem' }}>
                     Higher value will generate a higher quality image, but will take longer to generate
                  </Typography>
              </div>
          }>
          <div style={{marginTop: '1rem'}}>
        <Typography gutterBottom>Denoising Steps</Typography>
          <Slider
            value={denoiseStep}
            onChange={handleDenoiseStepsChange}
            step={10}
            min={21}
            max={51}
            marks={[
              { value: 21, label: '21' },
              { value: 31, label: '31' },
              { value: 41, label: '41' },
              { value: 51, label: '51' },
            ]}
            valueLabelDisplay="auto"
            aria-labelledby="slider-label"
          />
          </div>
          </Tooltip>

          <Tooltip disableFocusListener disableTouchListener title={
              <div style={{ maxWidth: '8rem' }}>
                  <Typography color="inherit" variant='body' sx={{ fontSize: '1rem' }}>
                     Set a value to generate the same image with different quality parameters
                  </Typography>
              </div>
          }>

          <div style={{
                  marginTop: '1rem', 
                  marginBottom: '1.5rem', 
                  minWidth: '10rem', 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center'
              }}>
                  <Typography gutterBottom>Seed</Typography>
                  <Slider
                      value={seed}
                      onChange={handleSeedChange}
                      step={1}
                      min={1}
                      max={99999}
                      valueLabelDisplay="auto"
                      aria-labelledby="slider-label"
                  />
              </div>
              </Tooltip>


        </Stack>
      )}

      

      {awaitingResponse ?      
        <Stack sx={{ width: '100%', color: 'grey.500' }} spacing={2}>
            <LinearProgress color="secondary" />
            <LinearProgress color="success" />
            <LinearProgress color="inherit" />
        </Stack>
        : timeDelay > 0 ? <TimeProgressBar totalTime={timeDelay}/> : <></>}

    </Box>
    <Button sx={{margin: '1rem', backgroundColor: "white"}} variant='outlined' onClick={fetchGeneratedBackgrounds}>Generate Image</Button>

    <>
      <Tabs
        value={selectedImage}
        onChange={handleChangeTab}
        indicatorColor="primary"
        textColor="primary"
        centered
      >
        {generatedImages.map((bg, index) => (
          <Tab key={index} label={`Image ${index + 1}`} />
        ))}
      </Tabs>
      <Stack spacing={2} justifyContent="center" alignItems="center">
        {generatedImages.map((bg, index) => (
            <div>
              {selectedImage === index && (
                <CardMedia
                  key={index}
                  component="img"
                  height="480"
                  image={bg.value}
                  alt={`Generated Image ${index + 1}`}
                />
              )}
              
            </div>
        ))}
        {generatedImages.length > 0 ?
        <Stack direction={"row"} spacing={2}>
        <TextField
            id="id-filename"
            label="Filename"
            variant="outlined"
            value={filename}
            onChange={handleFilenameChange}
            sx={{backgroundColor: 'white'}}
        />

        <Button variant="contained" 
                onClick={() => handleSaveGeneratedBackground(generatedImages[selectedImage].value, filename)}>
                    Save Image As Background
        </Button>

        <Button variant="contained" 
                onClick={() => {setSegmentDelay(30000); segmentImage(generatedImages[selectedImage].value)}}>
                    Get Segments
        </Button>
        </Stack>
        : <></>} 

        {segmentDelay > 0 ? <TimeProgressBar totalTime={40000} style={{margin: '2rem'}}/> : <></>}

        {segmented ? <Segmenter/> : awaitingSegmentation ? <><CircularProgress style={{margin: '2rem'}}/><Skeleton variant="rectangular" width={1080} height={720} sx={{margin: '2rem'}} /></>: <></>}
      </Stack>
    </>

    
    </Paper>
  );
};

export default VisualsGenerator;
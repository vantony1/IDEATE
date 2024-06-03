import React, { useState } from 'react';
import axios from 'axios';
import {
  Box,
  Typography,
  Button,
  LinearProgress,
  IconButton,
  TextField,
  Slider,
  Paper,
  Stack,
  Radio, RadioGroup, FormControlLabel, FormControl,FormLabel
} from '@mui/material';
import ReactPlayer from 'react-player';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import 'react-toastify/dist/ReactToastify.css';
import { toast } from 'react-toastify';

const AudioGenerator = () => {
  const audioServerURL = 'http://localhost:6002'
  const proxyServerURL = 'http://localhost:7053'
  const [awaitingResponse, setAwaitingResponse] = useState(false);
  const [prompt, setPrompt] = useState('lofi background music');
  const [filename, setFilename] = useState('generated_audio');
  const [duration, setDuration] = useState(2)
  const [guidance, setGuidance] = useState(2.1)
  const [candidates, setCandidates] = useState(3)
  const [audioData, setAudioData] = useState(null)
  const [showOptions, setShowOptions] = useState(false);
  const [type, setType] = useState('audio');


  const toggleShowOptions = () => {
    setShowOptions((prevState) => !prevState);
  };
  
  const handlePromptChange = (event) => {
    setPrompt(event.target.value);
  };

  const handleGuidanceChange = (event) => {
    setGuidance(event.target.value);
  };

  const handleDurationChange = (event) => {
    setDuration(event.target.value);
  };

  const handleCandidatesChange = (event) => {
    setCandidates(event.target.value);
  };

  const handleFilenameChange = (event) => {
    setFilename(event.target.value);
  };

  const fetchGeneratedAudio = async () => {
    try {
      if(prompt == ""){
        toast.warn('Prompt is empty: please provide a prompt')
        return
      }
      setAwaitingResponse(true)
      toast('Generating audio: eta 30 seconds', {autoClose: 30000})
      const endpoint = type == 'audio' ? `${audioServerURL}/generate_audio` : `${audioServerURL}/generate_music`
      const response = await axios.post(endpoint, {
        'prompt': prompt,
        'duration': duration,
      });
      toast.success('Audio generated')
      setAudioData(response.data)
      setAwaitingResponse(false)
    } catch (error) {
      toast.error(`Audio generation failed: ${error}`)
      console.error('Failed to fetch generated audio:', error);
    }
  };

  const saveGeneratedAudio = async () => {
    try {
      if(filename == ""){
        toast.warn('file name is empty: please provide a file name')
        return
      }
      setAwaitingResponse(true)
      const response = await axios.post(`${proxyServerURL}/save-wav-64`, {
        "base64Wav": audioData,
        "name": filename
      });

      setAudioData(response.data)
      toast.success(`Audio saved as: ${filename}`)
      setAwaitingResponse(false)
    } catch (error) {
      console.error('Failed to asve generated audio:', error);
    }

  }

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
      sx={{
        padding: '1rem'
      }}
    >
    <Stack justifyContent="center"
            alignItems="center" 
            spacing={4}>
              <Stack direction={"row"} spacing={4} sx={{ width: '100%' }}>
    <TextField
      id="sd-prompt"
      label="Prompt"
      variant="outlined"
      value={prompt}
      onChange={handlePromptChange}
      sx={{
        flexGrow: 1,  // Make the TextField grow to take up extra space
        '& .MuiOutlinedInput-root': {
          '& fieldset': {
            borderColor: 'rgba(0, 0, 0, 0.23)', // Default border color
          },
          '&:hover fieldset': {
            borderColor: 'rgba(0, 0, 0, 0.87)', // Hover border color
          },
          '&.Mui-focused fieldset': {
            borderColor: 'primary.main', // Border color when focused
          },
        },
        '& .MuiOutlinedInput-input': {
          backgroundColor: 'white', // This applies the white background only to the input field
        },
        marginTop: '1rem',
        minWidth: '30rem'
      }}
    />

    <div style={{ flexGrow: 1 }}>  {/* Make the div grow to take up extra space */}
      <Typography gutterBottom>Audio Duration (seconds)</Typography>
      <Slider
        value={duration}
        onChange={handleDurationChange}
        step={1}
        min={1}
        max={10}
        marks={[
          { value: 1, label: '1.0' },
          { value: 5, label: '5.0' },
          { value: 10, label: '10.0' }
        ]}
      />
    </div>
    <div style={{ flexGrow: 1 }}>  {/* Make the div grow to take up extra space */}

    <FormControl component="fieldset">
      <FormLabel component="legend">Generation Type</FormLabel>
      <RadioGroup
        row
        aria-label="type"
        name="type"
        value={type}
        onChange={(e) => setType(e.target.value)}
      >
        <FormControlLabel value="audio" control={<Radio />} label="Audio" />
        <FormControlLabel value="music" control={<Radio />} label="Music" />
      </RadioGroup>
    </FormControl>
    </div>
  </Stack>

    <IconButton onClick={toggleShowOptions}>
        {showOptions ? <KeyboardArrowUpIcon/> : <ExpandMoreIcon />}
    </IconButton>

    </Stack>

    {showOptions && (
        <Stack spacing={4} 
        justifyContent="center"
        alignItems="center"
        direction={"row"}>

<div>
<Typography gutterBottom sx={{marginTop: '1rem'}}>Num# Candidates</Typography>
      <Slider
        value={candidates}
        onChange={handleCandidatesChange}
        step={1}
        min={1}
        max={10}
        valueLabelDisplay="auto"
        aria-labelledby="slider-label"
      />
    </div>

      <div >
<Typography gutterBottom sx={{marginTop: '1rem'}}>Guidance Scale</Typography>
      <Slider
        value={guidance}
        onChange={handleGuidanceChange}
        step={0.1}
        min={-10.0}
        max={10.0}
        valueLabelDisplay="auto"
        aria-labelledby="slider-label"
      />
      </div>

</Stack>)}
      
      
      {awaitingResponse ?      
      <Stack sx={{ width: '100%', color: 'grey.500' }} spacing={2}>
      <LinearProgress color="secondary" />
      <LinearProgress color="success" />
      <LinearProgress color="inherit" />
    </Stack>
    : <></>}

    </Box>
    <Button sx={{margin: '1rem', backgroundColor: "white"}} variant='outlined' onClick={fetchGeneratedAudio}>Generate audio</Button>
        {audioData? 
        <Stack direction={"column"} spacing={3}>
    <ReactPlayer
        url={`data:audio/wav;base64,${audioData}`}
        controls
        width="300px"
        height="50px"
      /> 
      <TextField
      id="id-filename"
      label="Filename"
      variant="outlined"
      value={filename}
      onChange={handleFilenameChange}/> 
    
      <Button 
        variant='outlined'
        onClick={saveGeneratedAudio}>
          Save Generated Audio
      </Button>
    
    </Stack>: <></>}
    </Paper>
  );
};

export default AudioGenerator;


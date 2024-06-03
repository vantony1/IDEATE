import React, { useState } from 'react';
import {
    Dialog,
    Box,
    Slider,
    Typography,
    TextField,
    FormControl,
    FormControlLabel,
    FormLabel,
    RadioGroup,
    Radio,
    Stack,
    Button
} from '@mui/material';
import { RenderedSVGComponent } from './SVGComponents';
import 'react-toastify/dist/ReactToastify.css';
import { toast } from 'react-toastify';

const BubbleManager = ({ openBubbleManager, setOpenBubbleManager, onAddBubble }) => {
  const [bubbleName, setBubbleName] = useState("bubble name"); 
  const [text, setText] = useState("I can put in anything here and it will look good!"); 
  const [bubblePos, setBubblePos] = useState({x: 200, y: -450})
  const [maxW, setMaxW] = useState("20rem")
  const [fontSize, setFontSize] = useState("1.5rem")
  const [backgroundType, setBackgroundType] = useState({type: 'standard', url: 'url(/assets/misc/speech.svg)', margin: '30px 40px 100px 40px'})

  const handleClose = () => {
    setOpenBubbleManager(false);
  };

  const handleBubbleNameChange = (event) => {
    setBubbleName(event.target.value);
  };


  const handleTextChange = (event) => {
    setText(event.target.value);
  };

  const handleMaxWChange = (event) => {
    setMaxW(String(event.target.value)+'rem');
  }

  const handleFontSizeChange = (event) => {
    setFontSize(String(event.target.value)+'rem');
  }

  const handleBackgroundTypeChange = (event) => {
    switch(event.target.value){
        case "intense":
            setBackgroundType({type: 'intense', url: 'url(/assets/misc/electric-speech.svg)', margin: '60px 140px 80px 40px'});
            break;
        case "standard":
            setBackgroundType({type: 'standard', url: 'url(/assets/misc/speech.svg)', margin: '30px 40px 100px 40px'});
            break;
        case "whisper":
            setBackgroundType({type: 'whisper', url: 'url(/assets/misc/whisper-speech.svg)', margin: '40px 40px 100px 40px'});
            break;
    }
  }

  const extractNumber = (percentageString) => {
    return Number(percentageString.replace('rem', ''));
  }

  const addBubble = () => {
    toast.success('Speech bubble added.')
    onAddBubble(bubbleName, text, maxW, fontSize, backgroundType);
    handleClose();
  }

  const getBubble = () => {
    const svgElement = document.querySelector("#speech-bubble-svg");
    console.log(svgElement)
    const dataURL = svgToDataURL(svgElement); 
    console.log(dataURL)
  }

  function svgToDataURL(svg) {
    const serializedSVG = new XMLSerializer().serializeToString(svg);
    const base64Data = btoa(serializedSVG);
    return 'data:image/svg+xml;base64,' + base64Data;
  }
  
  return (
    <Dialog
        open={openBubbleManager}
        fullWidth={true}
        onClose={handleClose}
        PaperProps={{ // Add this
            style: {
              width: '50vw', // Add this
              maxWidth: '50vw', // Add this
              height: '40vw', // Add this
              maxHeight: '40vw', // Add this
              padding: '2rem',
              display: 'flex',
            },
          }}
      >
        <RenderedSVGComponent initX={bubblePos.x} 
                              initY={bubblePos.y} 
                              text={text} 
                              maxWidth={maxW}
                              fontSize={fontSize}
                              backgroundInfo={backgroundType}
        />

        <Typography variant='h4'>Bubble Maker</Typography>
        
        <TextField
            id="outlined-basic"
            label="speech bubble content"
            variant="outlined"
            value={text}
            onChange={handleTextChange}
            sx={{margin: '2rem', backgroundColor: 'white'}}
        />

        <Stack direction={"row"} spacing={4} sx={{margin: "1rem", marginLeft: "2rem"}}>

        <TextField
            id="outlined-basic"
            label="speech bubble name"
            variant="outlined"
            value={bubbleName}
            onChange={handleBubbleNameChange}
            sx={{marginTop: '1.1rem', backgroundColor: 'white'}}
        />

        <FormControl>
            <Typography id="type-radio" variant='overline'>Bubble Type</Typography>
            <RadioGroup
              row
              aria-label="type"
              name="bubble-type"
              value={backgroundType.type}
              onChange={handleBackgroundTypeChange}
            >
              <FormControlLabel value="standard" control={<Radio />} label="Standard" />
              <FormControlLabel value="whisper" control={<Radio />} label="Whisper" />
              <FormControlLabel value="intense" control={<Radio />} label="Intense" />
            </RadioGroup>
          </FormControl>

        </Stack>

        <Stack direction={"row"} spacing={4} sx={{margin: "1rem", marginLeft: "2rem"}}>

        <Box sx={{ width: 250}}>
            <Typography variant='overline' id="input-slider" gutterBottom>
                max width
            </Typography>
            <Slider
                getAriaLabel={() => 'width range'}
                value={extractNumber(maxW)}
                step={1}
                onChange={handleMaxWChange}
                max={50} min={0}
                size="small"
                valueLabelDisplay="auto"
                sx={{height: 5}}
            />
            </Box>

            <Box sx={{ width: 250}}>
            <Typography variant='overline' id="input-slider" gutterBottom>
                font size
            </Typography>
            <Slider
                getAriaLabel={() => 'width range'}
                value={extractNumber(fontSize)}
                step={0.1}
                onChange={handleFontSizeChange}
                max={4} min={0}
                size="small"
                valueLabelDisplay="auto"
                sx={{height: 5}}
            />
            </Box>

            <Button 
                variant="outlined" 
                sx={{backgroundColor: 'white'}}
                onClick={addBubble}> Add Bubble </Button>

            <Button 
                variant="outlined" 
                sx={{backgroundColor: 'white'}}
                onClick={getBubble}> Get Bubble </Button>
            
            </Stack>


            
    </Dialog>
  );
};

export default BubbleManager;
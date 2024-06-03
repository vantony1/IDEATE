import React, { useEffect, useState } from 'react';
import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Button,
  Dialog,
  Slider,
  Stack
} from '@mui/material';
import { Howl } from 'howler';
import 'react-toastify/dist/ReactToastify.css';
import { toast } from 'react-toastify';

const AudioPicker = ({ audioList, onAudioChange, openAudioPicker, setOpenAudioPicker }) => {
  const [selectedBGAudio, setSelectedBGAudio] = useState('');
  const [volume, setVolume] = useState(0.5)
  const [sound, setSound] = useState(null)
  const proxyServerURL = 'http://localhost:7053';


  useEffect(() => {
    if(!sound) return;
  }, [sound])

  useEffect(() => {
    if(!volume) return;
    if(sound && sound.playing()) sound.stop();
    setSound(new Howl({
      src: `${proxyServerURL}/file?path=${encodeURIComponent('../'+selectedBGAudio.value)}`,
      format: selectedBGAudio.ext,
      loop: false,
      volume: volume
    }));
  }, [volume])

  useEffect(() => {
    if(!selectedBGAudio) return;
    console.log("SELECTED: ", selectedBGAudio)
    if(sound) sound.stop();
    setSound(new Howl({
      src: `${proxyServerURL}/file?path=${encodeURIComponent('../'+selectedBGAudio.value)}`,
      format: selectedBGAudio.ext,
      loop: false,
      volume: volume
    }));
  }, [selectedBGAudio])

  const handleClose = () => {
    if(sound.playing()) sound.stop();
    setOpenAudioPicker(false);
  };

  const handleAudioChange = (event) => {
    const newAudio = event.target.value;
    setSelectedBGAudio(newAudio);
  };

  const handleVolumeChange = (event) => {
    setVolume(event.target.value);
  };

  const tryAudio = () => {
    if(!sound) return;
    if(sound.playing()) sound.stop();
    sound.play();
  };

  const stopAudio = () => {
    if(!sound) return;
    if(sound.playing()) sound.stop();
  };
  
  const addAudio = () => {
    toast.success('Audio added to scene')
    onAudioChange(selectedBGAudio.label, `${proxyServerURL}/file?path=${encodeURIComponent('../'+selectedBGAudio.value)}`, volume, selectedBGAudio.ext);
  }

  return (
    <Dialog
        open={openAudioPicker}
        fullWidth={true}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
    <Box style={{ padding: '1rem' }}>
      <Typography variant="h6" gutterBottom>
        Audio Picker
      </Typography>
      <FormControl fullWidth variant="outlined">
        <InputLabel htmlFor="audio-selector">Audio</InputLabel>
        <Select
          value={selectedBGAudio}
          onChange={handleAudioChange}
          label="audio"
          inputProps={{
            name: 'audio',
            id: 'audio-selector',
          }}
          sx={{backgroundColor: 'white'}}
        >
          {audioList.map((bg, index) => (
            <MenuItem key={index} value={bg} sx={{backgroundColor: 'white'}}>
              {bg.label}
            </MenuItem>
          ))}
                    
        </Select>
        <Box sx={{ width: 250, margin: '10px' }}>
        <Typography variant='overline' id="input-slider" gutterBottom>
          volume
        </Typography>
        <Slider
          size="small"
          value={volume}
          step={0.1}
          min={0.0}
          max={1.0}
          aria-label="volume"
          valueLabelDisplay="auto"
          onChange={handleVolumeChange}
          sx={{height: 5}}
        />  
      </Box> 
      <Stack direction={"row"} sx = {{ marginTop: '1rem', display: 'flex', justifyContent: "space-around"}}>
        <Button variant="outlined" onClick={tryAudio}>Preview</Button>
        <Button variant="outlined" onClick={stopAudio}>Stop Preview</Button>
        <Button variant="outlined" onClick={addAudio}>Add Audio</Button>
      </Stack>
      </FormControl>
    </Box>
    </Dialog>
  );
};

export default AudioPicker;

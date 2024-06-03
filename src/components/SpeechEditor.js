import React, { useState, useEffect } from 'react';
import { TextField, Button, Dialog, DialogContent, Slider, Box, 
  Typography, MenuItem, Select, Stack, Divider} from '@mui/material';
import { useSpeechSynthesizer } from '../services/SpeechSynthesizer';
import { speechProfiles, ttsData, ttsDuration } from '../services/state';
import { useRecoilValue, useRecoilState } from 'recoil';
import SpeechProfileManager from './SpeechProfileManager';
import 'react-toastify/dist/ReactToastify.css';
import { toast } from 'react-toastify';

const availableVoices = [
  ['James', 'en-US-Standard-A'],
  ['John', 'en-US-Standard-B'],
  ['Alex', 'en-US-Standard-C'],
  ['Mark', 'en-US-Standard-D'],
  ['Kay', 'en-US-Standard-E'],
  ['Ellie', 'en-US-Standard-F'],
  ['Veronica', 'en-US-Standard-G'],
  ['Jenny', 'en-US-Standard-H'],
  ['Leslie', 'en-US-Standard-I'],
  ['Jonah', 'en-US-Standard-J']
]

const ProfileForm = ({ saveProfile, setShow }) => {
  const [name, setName] = useState('');

  const handleSave = () => {
    if(name == ''){
      toast.warn('please provide a name for the speech profile')
      return
    }
    saveProfile(name);
    toast.success(`speech profile saved as ${name}`)
    setShow(false)
    setName('');
  };

  return (
    <Stack direction={"row"} spacing={2} justifyContent="center" alignItems="center">
      <TextField
        label="Enter Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
       <Stack spacing={2}>
      <Button
        variant="contained"
        color="primary"
        onClick={handleSave}
      >
        Save
      </Button>
      <Button
        variant="outlined"
        color="primary"
        onClick={() => setShow(false)}
      >
        Cancel
      </Button>
      </Stack>
    </Stack>
  );
};

function SpeechEditor(props) {
  const { speech, onSpeechChange, openSpeechEditor, setOpenSpeechEditor } = props;
  const [inputSpeech, setInputSpeech] = useState(speech);
  const [pitch, setPitch] = useState(1.0)
  const [voiceID, setVoiceID] = useState(availableVoices[0][1])
  const [speakingRate, setSpeakingRate] = useState(1.0)
  const [filename, setFilename] = useState("");
  const synth_speech = useSpeechSynthesizer()
  const tts_data = useRecoilValue(ttsData)
  const tts_duration = useRecoilValue(ttsDuration)
  const [profiles, setProfiles] = useRecoilState(speechProfiles)
  const [showProfileForm, setShowProfileForm] = useState(false);
  const [previewed, setPreviewed] = useState(false)

  useEffect(() => {
    setInputSpeech(speech);
  }, [speech]);

  const handleButtonClick = () => {
    setShowProfileForm(true);
  };

  const handleInputChange = (event) => {
    setPreviewed(false)
    setInputSpeech(event.target.value);
  };

  const handleNameChange = (event) => {
    setFilename(event.target.value);
  };

  const handlePitchChange = (event) => {
    setPreviewed(false)
    setPitch(event.target.value);
  };

  const handleSpeakingRateChange = (event) => {
    setPreviewed(false)
    setSpeakingRate(event.target.value);
  };

  const handleVoiceIDChange = (event) => {
    setPreviewed(false)
    setVoiceID(event.target.value);
  };

  const handleClose = () => {
    setPreviewed(false)
    synth_speech.stop()
    setOpenSpeechEditor(false);
  };

  const handleSave = () => {
    if(filename == ""){
      toast.warn("please provide a speech name")
      return
    }
    toast.success('Speech added to scene')
    onSpeechChange(tts_data, filename, tts_duration);
  };

  const previewSpeech = () => {
    if(inputSpeech == ""){
      toast.warn("please provide speech text")
      return
    }
    synth_speech.say(inputSpeech, pitch, speakingRate, voiceID)
    setPreviewed(true)
  }

  const stopSpeech = () => {
    synth_speech.stop()
  }
  
  const updateCurrentProfile = (profile) => {
    setVoiceID(profile.voiceID)
    setPitch(profile.pitch)
    setSpeakingRate(profile.speakingRate)
  }

  const profilesEqual = (profileA, profileB) => {
    if(profileA.voiceID !== profileB.voiceID || profileA.pitch !== profileB.pitch || profileA.speakingRate !== profileB.speakingRate ){
        return false
    } else {
        return true
    }
  }

  const deleteProfile = (profile) => {
    setProfiles((currentProfiles) => currentProfiles.filter(speechProfile => speechProfile.name !== profile.name));
  }
  
  const addProfile = (name) => {
    setProfiles((currentProfiles) => [...currentProfiles, {name, voiceID, pitch, speakingRate}])
  }
  return (
    <Dialog
      open={openSpeechEditor}
      fullWidth={true}
      onClose={handleClose}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
    >
      <DialogContent style={{ padding: '1rem' }}>
        <Stack>
          <Typography variant="h6" gutterBottom>
            Speech Editor
          </Typography> 
      <TextField
        label="Speech Text"
        multiline
        rows={1}
        fullWidth
        value={inputSpeech}
        onChange={handleInputChange}
        variant="outlined"
        sx={{marginBottom: "1rem", backgroundColor: 'white'}}
      />
      <TextField
        label="Speech Name"
        multiline
        rows={1}
        fullWidth
        value={filename}
        onChange={handleNameChange}
        variant="outlined"
        sx={{marginBottom: "1rem", backgroundColor: 'white'}}
      />

<Stack direction={"row"} justifyContent="center">

    <Stack justifyContent="center" alignItems="center">
    <Typography variant='overline'>Settings</Typography>
      <Box sx={{ width: 250, margin: '1rem' }}>
        <Typography variant='overline' id="input-slider" gutterBottom>
          pitch
        </Typography>
        <Slider
          size="small"
          value={pitch}
          min={-20}
          max={20}
          aria-label="pitch"
          valueLabelDisplay="auto"
          onChange={handlePitchChange}
          sx={{height: 5}}
        />
      </Box>
      
      <Box sx={{ width: 250, margin: '1rem' }}>
        <Typography variant='overline' id="input-slider" gutterBottom>
          speed
        </Typography>
        <Slider
          size="small"
          value={speakingRate}
          step={0.1}
          min={0.25}
          max={4.00}
          aria-label="speed"
          valueLabelDisplay="auto"
          onChange={handleSpeakingRateChange}
          sx={{height: 5}}
        />
      </Box>

      <Box sx={{ width: 250, marginBottom: '1rem' }}>
      <Typography variant='overline' id="input-slider" sx={{marginRight: '1rem'}}>
        voice
      </Typography>
      <Select
        labelId="voiceID-select"
        id="voiceID-select"
        value={voiceID}
        label="voice"
        onChange={handleVoiceIDChange}
        sx={{backgroundColor: 'white'}}
      >
        {availableVoices.map((voice) => (
          <MenuItem key={voice[1]} value={voice[1]} sx={{backgroundColor: 'white'}}>
            {voice[0]}
          </MenuItem>
        ))}
      </Select>
    </Box>
    </Stack>

    <Divider orientation="vertical" variant="middle" flexItem />

    <SpeechProfileManager 
        profiles={profiles} 
        currentProfile={{voiceID, pitch, speakingRate}} 
        setCurrentProfile={updateCurrentProfile}
        onProfileDelete={deleteProfile}
        />

</Stack>

      <Stack
          direction="row"
          justifyContent="center"
          alignItems="center"
          spacing={2}
          sx={{ marginTop: '1rem' }}
        >
          {previewed ? 
            <Button
              variant="contained"
              color="primary"
              onClick={handleSave}
            >
              Add Speech
            </Button> : <></>}

            <Button
              variant="contained"
              color="primary"
              onClick={previewSpeech}
            >
              Preview Speech
            </Button>

            <Button
              variant="contained"
              color="primary"
              onClick={stopSpeech}
            >
              Stop Speech
            </Button>
            <div>
              {showProfileForm ? (
                <ProfileForm saveProfile={addProfile} setShow={setShowProfileForm} />
              ) : (
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => {
                    handleButtonClick();
                  }}
                >
                  Save Speech Profile
                </Button>
              )}
            </div>
        </Stack>
    </Stack>

    
      </DialogContent>
    </Dialog>
  );
}

export default SpeechEditor;

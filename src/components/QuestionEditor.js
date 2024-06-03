import React, { useState, useEffect } from 'react';
import { TextField, Button, Typography, IconButton, Backdrop, Stack, Dialog, DialogContent, Slider, FormControl, Radio, RadioGroup, FormControlLabel } from '@mui/material';
import ClearIcon from '@mui/icons-material/Clear';
import { useSpeechSynthesizer } from '../services/SpeechSynthesizer';
import 'react-toastify/dist/ReactToastify.css';
import { toast } from 'react-toastify';


function QuestionEditor({ question, onUpdate, openQuestionEditor, setOpenQuestionEditor}) {
  const [currentQuestion, setCurrentQuestion] = useState(question || { text: '', options: [] });
  const synth_speech = useSpeechSynthesizer()
  const [backdropOpen, setBackdropOpen] = useState(false);
  const [duration, setDuration] = useState(30);
  const [defaultOptionIndex, setDefaultOptionIndex] = useState(0);
  const [responseButtonsDisabled, setResponseButtonsDisabled] = useState(false);

  useEffect(() => {
    setCurrentQuestion(question);
    setDuration(question.duration)
    setDefaultOptionIndex(question.defaultOptionIndex)
  }, [question]);

  const handleDialogClose = () => {
    setOpenQuestionEditor(false);
  };

  const handleAddOption = () => {
    setCurrentQuestion({
      ...currentQuestion,
      options: [...currentQuestion.options, { option: '', response: '' }],
    });
  };

  const handleRemoveOption = (index) => {
    setCurrentQuestion({
      ...currentQuestion,
      options: currentQuestion.options.filter((_, i) => i !== index),
    });
  };

  const handleOptionChange = (index, key, value) => {
    const updatedOptions = currentQuestion.options.map((option, i) =>
      i === index ? { ...option, [key]: value } : option,
    );
    setCurrentQuestion({ ...currentQuestion, options: updatedOptions });
  };

  const handleQuestionTextChange = (event) => {
    setCurrentQuestion({ ...currentQuestion, text: event.target.value });
  };

  const handleSave = () => {
    const updatedQuestion = {
      ...currentQuestion,
      duration,
      defaultOptionIndex,
    };

    console.log(updatedQuestion)
    toast.success('Interaction content updated!');
    onUpdate(updatedQuestion);
  };
  
  function delay(time) {
    return new Promise(resolve => setTimeout(resolve, time));
  }
  useEffect(() => {
    let timer;
    if (backdropOpen) {
      synth_speech.say(currentQuestion.text);
      timer = setTimeout(() => {
        if (backdropOpen && !responseButtonsDisabled) { // Check if backdrop is still open and buttons are not disabled
          const defaultResponse = currentQuestion.options[defaultOptionIndex]?.response;
          if (defaultResponse) {
            handleClose(defaultResponse);
          }
        }
      }, (duration+1) * 1000);
    }
    return () => clearTimeout(timer);
  }, [backdropOpen]);
  

  const handleClose = async (response) => {
    setResponseButtonsDisabled(true); // Disable response buttons before speaking
    setBackdropOpen(false);
    const speak = synth_speech.say(response);
    await speak;
    await delay(500);
  };

  const previewQuestion = () => {
    setBackdropOpen(true)
    setResponseButtonsDisabled(false);
    let timer = setTimeout(() => {
      setResponseButtonsDisabled(true)
    }, duration * 1000);
  }

  

  return (
<Dialog
  open={openQuestionEditor}
  fullWidth={true}
  onClose={handleDialogClose}
  aria-labelledby="alert-dialog-title"
  aria-describedby="alert-dialog-description"
>
  <DialogContent style={{ padding: '24px' }} >
    <Typography variant="h6" style={{ marginBottom: '16px' }}>Question</Typography>
    <TextField
      fullWidth
      value={currentQuestion.text}
      onChange={handleQuestionTextChange}
      variant="outlined"
      margin="dense"
    />
    <Typography variant="h6" style={{ marginTop: '20px', marginBottom: '16px' }}>Options</Typography>
    {currentQuestion.options.map((option, index) => (
      <div key={index} style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
        <TextField
          label="Option"
          variant="outlined"
          margin="dense"
          value={option.option}
          onChange={(e) => handleOptionChange(index, 'option', e.target.value)}
          style={{ marginRight: '8px', flexGrow: 1 }}
        />
        <TextField
          label="Response"
          variant="outlined"
          margin="dense"
          value={option.response}
          onChange={(e) => handleOptionChange(index, 'response', e.target.value)}
          style={{ marginRight: '8px', flexGrow: 2 }}
        />
        <FormControl component="fieldset" style={{ marginRight: '8px' }}>
          <RadioGroup
            row
            aria-label="default-option"
            name="default-option"
            value={defaultOptionIndex}
            onChange={() => setDefaultOptionIndex(index)}
          >
            <FormControlLabel value={index} control={<Radio />} label="Default" />
          </RadioGroup>
        </FormControl>
        <IconButton onClick={() => handleRemoveOption(index)}>
          <ClearIcon />
        </IconButton>
      </div>
    ))}
    <div style={{ marginTop: '24px', display: 'flex', justifyContent: "space-between" }}>
      <Button variant="contained" color="primary" onClick={handleAddOption} style={{ marginRight: '8px' }}>
        Add Option
      </Button>
      <Button variant="contained" color="primary" onClick={handleSave} style={{ marginRight: '8px' }}>
        Save Question
      </Button>
      <Button variant="contained" color="primary" onClick={previewQuestion}>
        Preview Question
      </Button>
    </div>
    <Typography id="duration-slider" gutterBottom style={{ marginTop: '24px' }}>
      Duration (seconds)
    </Typography>
    <Slider
      aria-labelledby="duration-slider"
      value={duration}
      onChange={(event, newValue) => setDuration(newValue)}
      step={1}
      marks
      min={0}
      max={180}
      valueLabelDisplay="auto"
      style={{ marginTop: '16px', marginBottom: '32px' }}
    />
    <Backdrop
      sx={{ color: '#fff', zIndex: 10 }}
      open={backdropOpen}
    >
      <Stack spacing={2} style={{ alignItems: 'center', justifyContent: 'center' }}>
        <Typography variant="h2" style={{ margin: "5%", padding: "5%", backgroundColor: 'rgba(0, 0, 0, 0.7)', color: '#fff' }}>
          {currentQuestion.text}
        </Typography>
        <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap' }}>
          {currentQuestion.options.map((interaction, i) => (
            <Button key={i} variant="contained" 
                    size="large" color="success" 
                    disabled={responseButtonsDisabled} // Disable buttons when needed
                    style={{ padding: '10px 20px', margin: '10px' }}
                    onClick={() => handleClose(interaction.response)}>
              <Typography variant='h5'>
               {interaction.option}
              </Typography>
            </Button>
          ))}
        </div>
      </Stack>
    </Backdrop>
  </DialogContent>
  </Dialog>

  );
}

export default QuestionEditor;

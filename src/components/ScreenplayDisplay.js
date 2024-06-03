import React, { useState } from 'react';
import { Typography, Box, Tabs, Tab, Divider, Stack, Button, IconButton } from '@mui/material';
import ClearIcon from '@mui/icons-material/Clear';
import AddIcon from '@mui/icons-material/Add';
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`scene-tabpanel-${index}`}
      aria-labelledby={`scene-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box p={3}>
          {children}
        </Box>
      )}
    </div>
  );
}

const ScreenplayDisplay = ({ scenes, setScenes }) => {
  const [value, setValue] = useState(0);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const handleSceneNameChange = (event, index) => {
    const newScenes = JSON.parse(JSON.stringify(scenes));
    newScenes[index].sceneName = event.target.innerText;
    setScenes(newScenes);
  };

  const handleCharacterChange = (event, sceneIndex, charIndex) => {
    const newScenes = JSON.parse(JSON.stringify(scenes));
    newScenes[sceneIndex].characters[charIndex] = event.target.innerText;
    setScenes(newScenes);
  };

  const handleNarrationChange = (event, index) => {
    const newScenes = JSON.parse(JSON.stringify(scenes));
    newScenes[index].narration = event.target.innerText;
    setScenes(newScenes);
  };

  const handleDialogueChange = (event, sceneIndex, dialogueIndex) => {
    const newScenes = JSON.parse(JSON.stringify(scenes));
    newScenes[sceneIndex].dialogue[dialogueIndex].speech = event.target.innerText;
    setScenes(newScenes);
  };

  const handleSpeakerChange = (event, sceneIndex, dialogueIndex) => {
    const newScenes = JSON.parse(JSON.stringify(scenes));
    newScenes[sceneIndex].dialogue[dialogueIndex].speaker = event.target.innerText;
    setScenes(newScenes);
  };
  

  const addDialogue = (sceneIndex) => {
    const newScenes = JSON.parse(JSON.stringify(scenes));
    const newDialogue = {
      speaker: "New Speaker",
      speech: "New Speech"
    };
    newScenes[sceneIndex].dialogue.push(newDialogue);
    setScenes(newScenes);
  };

  const removeDialogue = (sceneIndex, dialogueIndex) => {
    const newScenes = JSON.parse(JSON.stringify(scenes));
    newScenes[sceneIndex].dialogue.splice(dialogueIndex, 1);
    setScenes(newScenes);
  };

  return (
    <div>
      <Tabs
        value={value}
        onChange={handleChange}
        variant="scrollable"
        scrollButtons="auto"
        TabIndicatorProps={{
          style: {
            backgroundColor: "#000",
          },
        }}
        sx={{
          '.MuiTab-root': {
            border: '1px solid #ddd',
            mx: '2px',
            '&.Mui-selected': {
              bgcolor: 'white',
              color: 'secondary',
            }
          },
        }}
      >
        {scenes?.map((scene, index) => (
          <Tab 
            label={scene.sceneName} 
            id={`scene-tab-${index}`} 
            key={index} 
            contentEditable 
            suppressContentEditableWarning 
            onBlur={(e) => handleSceneNameChange(e, index)}
          />
        ))}
      </Tabs>

      {scenes?.map((scene, index) => 
        <TabPanel value={value} index={index} key={index}>
          <Typography variant="h5" gutterBottom>Narration</Typography>
          <Typography
            paragraph
            contentEditable
            suppressContentEditableWarning
            onBlur={(e) => handleNarrationChange(e, index)}
            sx={{marginBottom: '2rem'}}
          >
            {scene?.narration}
          </Typography>
          <Typography variant="h5">Characters</Typography>
          <Stack direction={"row"} sx={{marginBottom: '1rem', marginLeft: '2rem'}} spacing={10}>
            {scene?.characters?.map((character, charIndex) => (
              <Typography 
                variant="overline" 
                key={charIndex}
                contentEditable 
                suppressContentEditableWarning 
                onBlur={(e) => handleCharacterChange(e, index, charIndex)}
              >
                {character}
              </Typography>
            ))}
          </Stack>
          {scene?.dialogue?.length > 0 && 
            <div>
              <Typography variant="h5" gutterBottom>Dialogue</Typography>
              {scene?.dialogue?.map((dialogue, dialogueIndex) => 
                <React.Fragment key={dialogueIndex}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={2}>
                    <Typography 
                      variant="overline"
                      contentEditable
                      suppressContentEditableWarning
                      onBlur={(e) => handleSpeakerChange(e, index, dialogueIndex)}
                    >
                      {dialogue.speaker}
                    </Typography>
                    <IconButton 
                      size="small" 
                      color="secondary" 
                      onClick={() => removeDialogue(index, dialogueIndex)}
                    >
                      <ClearIcon />
                    </IconButton>

                  </Stack>
                  <Typography
                    paragraph
                    contentEditable
                    suppressContentEditableWarning
                    onBlur={(e) => handleDialogueChange(e, index, dialogueIndex)}
                  >
                    {dialogue.speech}
                  </Typography>
                  <Divider />
                </React.Fragment>
              )}
            </div>
          }

          
          <Stack direction="row" justifyContent="center" alignItems="center" marginTop={3}>
          {scene?.dialogue?.length > 0 ?
            <IconButton variant="outlined" color="primary" size="small" onClick={() => addDialogue(index)}><AddIcon/></IconButton>
            : <Button variant="contained" color="primary" onClick={() => addDialogue(index)}>
            Add Dialogue
          </Button>}
          </Stack> 
        </TabPanel>
      )}
    </div>
  );
};

export default ScreenplayDisplay;

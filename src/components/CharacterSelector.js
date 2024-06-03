import React, { useEffect, useState } from 'react';
import {
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import ImageCarousel from './ImageCarousel';

const CharacterSelector = ({ characters, onCharacterChange }) => {
  const [selectedCharacter, setSelectedCharacter] = useState('');
  const [selectedAction, setSelectedAction] = useState('');

  const handleChangeGroup = (event) => {
    const newCharacterGroup = event.target.value;
    setSelectedCharacter(newCharacterGroup);
  };

  const handleChangeAction = (event) => {
    const newCharacter = event.target.value;
    setSelectedAction(newCharacter);
    onCharacterChange(newCharacter);
  };


  useEffect(() => {
    if (selectedCharacter == '') return
    console.log("selected group: ", selectedCharacter)

    setSelectedAction(selectedCharacter.actions[0])
    onCharacterChange(selectedCharacter.actions[0]);
    
  }, [selectedCharacter]);

  useEffect(() => {
    if (selectedAction == '') return
    console.log("selected action: ", selectedAction)

  }, [selectedAction]);


  return (
<Stack sx={{ padding: '1rem' }} >
<Stack direction={"row"} spacing={2}>
  <FormControl sx={{ width: '30%'}}>
    <InputLabel id="select-character-label">Character</InputLabel>
    <Select 
      value={selectedCharacter} 
      onChange={handleChangeGroup}
      label="Character"
      sx={{backgroundColor: 'white'}}
    >
      {characters.map((group) => (
        <MenuItem key={group.name} value={group} sx={{backgroundColor: 'white'}}>
          {group.name}
        </MenuItem>
      ))}
    </Select>
  </FormControl>

  {selectedCharacter && (
    <FormControl sx={{ width: '30%' }}>
      <InputLabel id="select-action-label">Action</InputLabel>
      <Select 
        value={selectedAction} 
        onChange={handleChangeAction}
        label="Action"  
        sx={{backgroundColor: 'white'}}
      >
        {selectedCharacter.actions.map((action) => (
          <MenuItem key={action.actionName} value={action} sx={{backgroundColor: 'white'}}>
            {action.actionName}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  )}

</Stack>

  {selectedAction && (
    <ImageCarousel imagePaths={selectedAction.sprites} />
  )}
</Stack>

  );
};

export default CharacterSelector;

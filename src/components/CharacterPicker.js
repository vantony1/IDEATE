import React, { useEffect, useState } from 'react';
import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
} from '@mui/material';

const CharacterPicker = ({ characters, onCharacterChange }) => {
  const [currentCharacter, setCurrentCharacter] = useState(characters[0]);
  const proxyServerURL = 'http://localhost:7053';

  const handleCharacterChange = (event) => {
    const newCharacter = event.target.value
    newCharacter.path = '..' + newCharacter.value;
    console.log(newCharacter)
    setCurrentCharacter(newCharacter); 

    // Replace 'your_image_file_path' with the path of the image file you want to request
    const imagePath = '..' + newCharacter.value;
    console.log("IMAGE PATH: ", imagePath)

    const spritedCharacter = {characterName: newCharacter.label, actionName: 'static', sprites: [`${proxyServerURL}/file?path=${encodeURIComponent(imagePath)}`]}
    onCharacterChange(spritedCharacter);
  };

  useEffect(() => {
    const spritedCharacter = {characterName: currentCharacter.label, actionName: 'static', sprites: [`${proxyServerURL}/file?path=${encodeURIComponent('..' + currentCharacter.value)}`]}
    onCharacterChange(spritedCharacter);
  }, []);

  return (
<Box
  sx={{
    padding: '1rem',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    height: '100%',
    justifyContent: 'center',
  }}
>
  <FormControl variant="outlined">
    <InputLabel htmlFor="character-selector">Character</InputLabel>
    <Select
      value={currentCharacter}
      onChange={handleCharacterChange}
      label="Character"
      inputProps={{
        name: currentCharacter.label,
        id: 'character-selector',
      }}
      sx={{backgroundColor: 'white'}}
    >
      {characters.map((char, index) => (
        <MenuItem key={index} value={char} sx={{backgroundColor: 'white'}}>
          {char.label}
        </MenuItem>
      ))}
    </Select>
  </FormControl>
    <Box
      sx={{
        mt: 2,
        flex: 1, 
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center', 
        width: '100%',
        height: '100%'
      }}
    >
      <Typography variant="overline" sx={{fontSize: '1em'}}>Preview:</Typography>
      <Box
        sx={{
          width: '100%',
          height: 200,
          border: 1,
          borderColor: 'divider',
          borderRadius: 1,
          mt: 1,
          backgroundImage: currentCharacter.path ? `url(${proxyServerURL}/file?path=${encodeURIComponent(
            currentCharacter.path
          )})` : `url(${proxyServerURL}/file?path=${encodeURIComponent(
            '..' + currentCharacter.value
          )})`,
          backgroundSize: 'contain',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      />
    </Box>
  )
</Box>
  );
};

export default CharacterPicker;

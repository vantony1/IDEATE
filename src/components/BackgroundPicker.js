import React, { useState } from 'react';
import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import 'react-toastify/dist/ReactToastify.css';
import { toast } from 'react-toastify';

const BackgroundSelector = ({ backgrounds, selectedBackground, onBackgroundChange, handleSaveGeneratedBackground }) => {
  const [currentBackground, setCurrentBackground] = useState(selectedBackground);

  const handleBackgroundChange = (event) => {
    toast.success('Scene background updated!')
    const newBackground = event.target.value;
    setCurrentBackground(newBackground);
    onBackgroundChange(newBackground);
  };
  
  return (
    <Box style={{ padding: '1rem' }}>
      <FormControl fullWidth variant="outlined">
        <InputLabel htmlFor="background-selector">Background</InputLabel>
        <Select
          value={currentBackground}
          onChange={handleBackgroundChange}
          label="Background"
          inputProps={{
            name: 'background',
            id: 'background-selector',
          }}
          sx={{backgroundColor: 'white'}}
        >
          {backgrounds.map((bg, index) => (
            <MenuItem key={index} value={bg.value} sx={{backgroundColor: 'white'}}>
              {bg.label}
            </MenuItem>
          ))}
                    
        </Select>
      </FormControl>
    </Box>
  );
};

export default BackgroundSelector;
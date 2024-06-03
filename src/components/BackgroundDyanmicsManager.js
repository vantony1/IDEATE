import React, { useEffect, useState } from 'react';
import {
  Box,
  Slider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  ToggleButtonGroup,
  ToggleButton,
  Typography,
  Button
} from '@mui/material';
import { ChromePicker } from 'react-color'


const BackgroundDyanamicsManager = ({ particlesOptions, onBackgroundDynamicsUpdate, setParticlesRenderState }) => {
  const [image, setImage] = useState("")
  const [color, setColor] = useState({"hsl":{"h":0,"s":0,"l":1,"a":1},"hex":"#ffffff","rgb":{"r":255,"g":255,"b":255,"a":1},"hsv":{"h":0,"s":0,"v":1,"a":1},"oldHue":0,"source":"hsv"});
  const [number, setNumber] = useState(0.5)
  const [size, setSize] = useState([1, 3]);
  const [opacity, setOpacity] = useState([0.3, 0.7]);
  const [direction, setDirection] = useState("bottom-right")
  const [alignment, setAlignment] = useState('shape');
  const [shape, setShape] = useState('circle')

  useEffect(() => {
    if(!particlesOptions) return;
    const particles = particlesOptions.particles;
    setNumber(particles?.number.value)
    setSize([particles?.size.value.min, particles?.size.value.max])
    setOpacity([particles?.opacity.value.min, particles?.opacity.value.max])
    setDirection(particles?.move.direction)
    setShape(particles?.shape?.type || 'circle')
  }, [particlesOptions])

  const handleSizeChange = (event, newSize) => {
    setSize(newSize);
  };

  const handleImageChange = (event, newImage) => {
    setImage(event.target.value);
  };

  const handleShapeChange = (event) => {
    setShape(event.target.value);
  };

  const handleNumberChange = (event, newNumber) => {
    setNumber(newNumber);
  };

  const handleAlignment = (event, newAlignment) => {
    setAlignment(newAlignment);
  };


  const handleDirectionChange = (event) => {
    setDirection(event.target.value);
  };

  const handleSave = () => { 
    if(alignment == 'shape'){
        const updatedParticlesOptions = {
            ...particlesOptions,
            particles: {
              ...particlesOptions?.particles,
              number: {
                value: number
              },
              size: {
                value: {
                  min: size[0],
                  max: size[1]
                }
              },
              move: {
                ...particlesOptions?.particles?.move,
                direction: direction
              },
              shape: {
                type: shape
              },
              color: {
                value: color.hex
              }
            }
          };
          onBackgroundDynamicsUpdate(updatedParticlesOptions);
    } else {
        const updatedParticlesOptions = {
            ...particlesOptions,
            particles: {
              ...particlesOptions?.particles,
              number: {
                value: number
              },
              size: {
                value: {
                  min: size[0],
                  max: size[1]
                }
              },
              move: {
                ...particlesOptions?.particles?.move,
                direction: direction
              },
              shape: {
                type: 'image',
                image: {
                    "src": image
                }
              }
            }
          };
          onBackgroundDynamicsUpdate(updatedParticlesOptions);
    }
    setParticlesRenderState(true)

  };

  return (
        <Stack>
          <Stack direction={"row"}>
            <Box sx={{ width: 250, margin: '1rem' }}>
                <Typography id="input-slider" gutterBottom>
                particle count
                </Typography>
                <Slider
                size="small"
                value={number}
                step={1}
                min={0}
                max={100}
                aria-label="number"
                valueLabelDisplay="auto"
                onChange={handleNumberChange}
                />  
            </Box>
            <Box sx={{ width: 250, margin: '1rem'  }}>
            <Typography id="input-slider" gutterBottom>
                size
            </Typography>
            <Slider
                getAriaLabel={() => 'size range'}
                value={size}
                step={1}
                onChange={handleSizeChange}
                max={10} min={0}
                size="small"
                valueLabelDisplay="auto"
            />
            </Box>
            </Stack>
            <Box sx={{ marginLeft: '1rem', width: 250 }}>
              <Typography id="input-slider" gutterBottom>
                direction
              </Typography>
              <FormControl fullWidth>
                <Select
                  labelId="direction-select"
                  id="direction"
                  value={direction}
                  onChange={handleDirectionChange}
                  sx={{backgroundColor: 'white'}}
                >
                  <MenuItem sx={{backgroundColor: 'white'}} value="top">Top</MenuItem>
                  <MenuItem sx={{backgroundColor: 'white'}} value="top-right">Top-Right</MenuItem>
                  <MenuItem sx={{backgroundColor: 'white'}} value="top-left">Top-Left</MenuItem>
                  <MenuItem sx={{backgroundColor: 'white'}} value="bottom">Bottom</MenuItem>
                  <MenuItem sx={{backgroundColor: 'white'}} value="bottom-left">Bottom-Left</MenuItem>
                  <MenuItem sx={{backgroundColor: 'white'}} value="bottom-right">Bottom-Right</MenuItem>
                  <MenuItem sx={{backgroundColor: 'white'}} value="left">Left</MenuItem>
                  <MenuItem sx={{backgroundColor: 'white'}} value="right">Right</MenuItem>
                  <MenuItem sx={{backgroundColor: 'white'}} value="none">None</MenuItem>
                </Select>
              </FormControl>
            </Box>

            <div style={{marginTop: "2rem"}}>
            <Stack direction={"row"} spacing={2}>
              <FormControl sx={{marginLeft: "1rem", width: '10rem'}}>
                <InputLabel id="shape-select"> choose shape</InputLabel>
                <Select
                labelId="shape-select"
                id="shape"
                value={shape}
                label="shape"
                onChange={handleShapeChange}
                sx={{backgroundColor: 'white'}}
                >
                <MenuItem sx={{backgroundColor: 'white'}} value={"circle"}>Circle</MenuItem>
                <MenuItem sx={{backgroundColor: 'white'}} value={"triangle"}>Triangle</MenuItem>
                <MenuItem sx={{backgroundColor: 'white'}} value={"square"}>Square</MenuItem>
                <MenuItem sx={{backgroundColor: 'white'}} value={"star"}>Star</MenuItem>
                </Select>
              </FormControl>
            <Stack>
            <ChromePicker 
              color={ color }
              onChange={(e) => {setColor(e)}}
            />
            </Stack>
            </Stack> 

            </div>

        <Button variant="outlined" style={{margin: '2rem', backgroundColor: 'white'}} onClick={handleSave}>Update Background</Button>

        </Stack>
  );
};

export default BackgroundDyanamicsManager;
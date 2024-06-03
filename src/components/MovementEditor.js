import React, { useEffect, useRef, useState } from 'react';
import { Layer, Sprite, Scene } from 'spritejs';
import { Button, Stack, Popover } from '@mui/material';
import { CharacterList } from '../components'
import { v4 as uuidv4 } from 'uuid';
import { Typography } from 'antd';
import 'react-toastify/dist/ReactToastify.css';
import { toast } from 'react-toastify';

const MovementEditor = ({ characters, stageRef, openCharacterPicker, setOpenCharacterPicker, frames, onFramesUpdate, removedCharacter, timeline, elements}) => {
  const layerRef = useRef()
  const [currentSpritePosition, setCurrentSpritePosition] = useState({ x: 0, y: 0 });
  const [startState, setStartState] = useState({ x: 0, y: 0 });
  const [endState, setEndState] = useState({ x: 0, y: 0 });
  const [currentSprite, setCurrentSprite] = useState(null);
  const [spriteArray, setSpriteArray] = useState([])
  const [layer, setLayer] = useState(new Layer())
  const [pressedButton, setPressedButton] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);

  useEffect(() => {
    if (anchorEl) {
      const timer = setTimeout(() => {
        setAnchorEl(null);
      }, 5000);
  
      return () => {
        clearTimeout(timer);
      };
    }
  }, [anchorEl]);
  

  useEffect(() => {
    if (!removedCharacter) return;
    const characterToRemove = spriteArray.filter(item => item.timelineElement.id === removedCharacter.id);
    const updatedSpriteArray = spriteArray.filter(item => item.timelineElement.id !== removedCharacter.id);
    layer.removeChild(removedCharacter.actions[0].data.sprite)
    setSpriteArray(updatedSpriteArray)
  }, [removedCharacter])


  useEffect(() => {
    //render from frames -- including timeline elements
    if(spriteArray.length === 0 && timeline.length > 0){
      console.log("Setting sprites to timeline data: ", timeline)
      timeline.forEach(element => {
        addTimelineElementToScene(element);
      })
    }
  }, [timeline]);


  const generateRandomId = () => {
    return uuidv4().split('-')[0];
  };

  const addTimelineElementToScene = (element) => {

    console.log("ADDING: ", element)

    const sprite = new Sprite({
      texture: element.sprites[0],
      pos: [element.startState ? element.startState.x : 0, element.startState ? element.startState.y : 0],
      size: [element.size && element.size[0] ? element.size[0] : 256, element.size && element.size[1] ? element.size[1] : 256],
    });


    const element_copy = JSON.parse(JSON.stringify(element));
    const character = {}
    character.actionName = element_copy.actionName
    character.characterName = element_copy.characterName
    character.endState = element_copy.endState
    character.startState = element_copy.startState
    character.sprites = element_copy.sprites
    character.sprite = sprite
    character.size = [sprite.attr('width'), sprite.attr('height')]

    const actionID = generateRandomId()
    let timelineSprite = {
      id: character.characterName+actionID,
      type: 'sprite',
      actions: [
        {
          id: actionID,
          start: element_copy.start,
          end: element_copy.end,
          effectId: 'spriteEffect',
          endState: character.endState,
          startState: character.startState,
          size: [sprite.attr('width'), sprite.attr('height')],
          data: {
            src: actionID,
            name: character.characterName + '-' + element_copy.actionName,
            sprite: sprite,
            endState: element_copy.endState,
            startState: element_copy.startState,
            sprites: element_copy.sprites,
          },
        }
      ]
    }

    character.timelineElement = timelineSprite;

    sprite.addEventListener('mousedown', (evt) => {
      const offsetX = evt.layerX - sprite.attr('x');
      const offsetY = evt.layerY - sprite.attr('y');
      setCurrentSprite(sprite)

      const onMouseMove = (moveEvent) => {
        sprite.attr('x', moveEvent.layerX - offsetX);
        sprite.attr('y', moveEvent.layerY - offsetY);
        layer.draw();
      };

      const onMouseUp = () => {
        setCurrentSpritePosition({x: sprite.attr('x'), y: sprite.attr('y')})
       
        layer.removeEventListener('mousemove', onMouseMove);
        layer.removeEventListener('mouseup', onMouseUp);
      };

      sprite.addEventListener('mouseenter', (evt) => {
        sprite.attr('border', [4, '#FFD166']);
      });
      sprite.addEventListener('mouseleave', (evt) => {
        setAnchorEl(evt.target);
        setCurrentSprite(sprite);
        sprite.attr('border', [0, '']);
        layer.removeEventListener('mousemove', onMouseMove);
        layer.removeEventListener('mouseup', onMouseUp);
      });

      layer.addEventListener('mousemove', onMouseMove);
      layer.addEventListener('mouseup', onMouseUp);
    });      

    layer.append(sprite);

    console.log("CREATED: ", character)

    
    setSpriteArray((currentSpriteArray) => [...currentSpriteArray, character])
    setCurrentSprite(sprite)
  }

  const handleContextMenuClose = () => {
    setAnchorEl(null);
  };


  const addNewCharacterToScene = (character) => {
    const sprite = character.sprite

    sprite.addEventListener('mousedown', (evt) => {
      const offsetX = evt.layerX - sprite.attr('x');
      const offsetY = evt.layerY - sprite.attr('y');
      setCurrentSprite(sprite)
      const onMouseMove = (moveEvent) => {
        sprite.attr('x', moveEvent.layerX - offsetX);
        sprite.attr('y', moveEvent.layerY - offsetY);
        layer.draw();
      };

      const onMouseUp = () => {
        setCurrentSpritePosition({x: sprite.attr('x'), y: sprite.attr('y')})
        setAnchorEl(evt.target);
        setCurrentSprite(sprite);
        layer.removeEventListener('mousemove', onMouseMove);
        layer.removeEventListener('mouseup', onMouseUp);
      };

      sprite.addEventListener('mouseenter', (evt) => {
        sprite.attr('border', [4, '#FFD166']);
      });
      sprite.addEventListener('mouseleave', (evt) => {
        
        sprite.attr('border', [0, '']);
      });

      layer.addEventListener('mousemove', onMouseMove);
      layer.addEventListener('mouseup', onMouseUp);
    });
  
    layer.append(sprite);

    const actionID = generateRandomId()

    let timelineSprite = {
      id: character.characterName+actionID,
      type: 'sprite',
      actions: [
        {
          id: actionID,
          start: 0,
          end: 5,
          effectId: 'spriteEffect',
          endState: character.endState,
          startState: character.startState,
          size: [sprite.attr('width'), sprite.attr('height')],
          data: {
            src: actionID,
            name: character.characterName + '-' + character.actionName,
            sprite: sprite,
            endState: character.endState,
            startState: character.startState,
            sprites: character.sprites,
          },
        }
      ]
    }

    character.startState = {x: 0, y: 0}
    character.endState = {x: 0, y: 0}
    character.timelineElement = timelineSprite;

    console.log("ADDING NEW CHARACTER: ", character)
    
    setSpriteArray((currentSpriteArray) => [...currentSpriteArray, character])
    setCurrentSprite(sprite)
    
  }
  
  useEffect(() => {
    if (pressedButton) {
      const timer = setTimeout(() => {
        setPressedButton(null);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [pressedButton]);

  useEffect(() => {
    const scene = new Scene({ container: stageRef.current, width: 800, height: 600 });
    scene.append(layer);

    return () => {
      layer.removeAllChildren()
      scene.remove(layer)
    };
  }, [stageRef]);

  useEffect(() => {
    console.log("current parentposition: ", currentSpritePosition.x, currentSpritePosition.y)
  }, [currentSpritePosition])

  useEffect(() => {
    console.log("saved start position: ", startState.x, startState.y)
  }, [startState])

  useEffect(() => {
    console.log("saved end position: ", endState.x, endState.y)
  }, [endState])

  useEffect(() => {
    console.log("sprite set to: ", currentSprite)
  }, [currentSprite])

  useEffect(() => {
    console.log("SPRITE array to: ", spriteArray)
    onFramesUpdate(spriteArray)
  }, [spriteArray])

  const saveSpriteLocation = (type) => {
    const newSpriteArray = [...spriteArray];
    const currentCharacterIndex = spriteArray.findIndex(item => item.sprite === currentSprite);
  
    if (type === "start") {
      toast.info('character start location updated!')
      newSpriteArray[currentCharacterIndex] = {
        ...newSpriteArray[currentCharacterIndex],
        timelineElement: {
          ...newSpriteArray[currentCharacterIndex].timelineElement,
          actions: newSpriteArray[currentCharacterIndex].timelineElement.actions.map(action => ({
            ...action,
            startState: currentSpritePosition
          }))
        }
      };
    } else {
      toast.info('character end location updated!')
      newSpriteArray[currentCharacterIndex] = {
        ...newSpriteArray[currentCharacterIndex],
        timelineElement: {
          ...newSpriteArray[currentCharacterIndex].timelineElement,
          actions: newSpriteArray[currentCharacterIndex].timelineElement.actions.map(action => ({
            ...action,
            endState: currentSpritePosition
          }))
        }
      };
    }
  
    setSpriteArray(newSpriteArray);
  };

  const saveStartState = () => {
    saveSpriteLocation("start")
  };

  const saveEndState = () => {
    saveSpriteLocation("end")
  };

  const handleButtonClick = (buttonName, onClickHandler) => {
    setPressedButton(buttonName);
    onClickHandler();
  };

  const handleCharacterAddition= (newCharacter) => {
    console.log("ADDING CHARACTER", newCharacter)
    addNewCharacterToScene(newCharacter)
  };

  const handleCharacterRemoval= (removedIndex) => {
    console.log("REMOVING CHARACTER", removedIndex)
    console.log("NEED TO REMOVE: ", spriteArray[removedIndex])
    layer.removeChild(spriteArray[removedIndex].sprite)
    setSpriteArray(spriteArray.filter((_, i) => i !== removedIndex));
  };

  const updateSpriteSize = () => {
    const newSpriteArray = [...spriteArray];
    const currentCharacterIndex = spriteArray.findIndex(item => item.sprite === currentSprite);
  
    newSpriteArray[currentCharacterIndex] = {
      ...newSpriteArray[currentCharacterIndex],
        timelineElement: {
          ...newSpriteArray[currentCharacterIndex].timelineElement,
          actions: newSpriteArray[currentCharacterIndex].timelineElement.actions.map(action => ({
            ...action,
            size: [currentSprite.attr('width'), currentSprite.attr('height')]
        }))
      }
    };
  
    setSpriteArray(newSpriteArray);
  };


  const modifySpriteSize = (sprite, dim, incr) => {
    const currentWidth = sprite.attr('width');
    const currentHeight = sprite.attr('height');

    let newHeight = currentHeight;
    let newWidth = currentWidth;

    const scale = incr ? +10 : -10

    switch(dim) {
      case 'height':
        newHeight = currentHeight + scale;
        break
      case 'width':
        newWidth = currentWidth + scale;
        break
    }

    sprite.attr({
      width: newWidth,
      height: newHeight,
    });

    updateSpriteSize([newWidth, newHeight])
  }

  return (
  <div style={{marginTop: '10vh', marginRight: '10vh'}}>
    <CharacterList 
      characters={characters}
      elements={elements} 
      onCharacterAdd={handleCharacterAddition} 
      onCharacterRemove={handleCharacterRemoval} 
      openCharacterPicker={openCharacterPicker} 
      setOpenCharacterPicker={setOpenCharacterPicker} 
    />

    <Popover
      open={Boolean(anchorEl)}
      anchorEl={anchorEl}
      onClose={handleContextMenuClose}
      anchorOrigin={{
        vertical: currentSpritePosition.y+100,
        horizontal: currentSpritePosition.x+100,
      }}
      transformOrigin={{
        vertical: 'center',
        horizontal: 'center',
      }}
    >
      <Stack>
      <Button size="small" variant="outlined" 
              style={{ 
                  margin: '0.5rem',
                  background: pressedButton === 'start' ? '#ffcc00' : 'transparent',
                  transition: 'background 2s'
                }} 
              onClick={() => handleButtonClick('start', saveStartState)}>
               Set as Start Location
      </Button>
      <Button size="small" variant="contained" 
              style={{ 
                  margin: '0.5rem',
                  background: pressedButton === 'end' ? '#ffcc00' : 'primary',
                  transition: 'background 2s'
                }}  
              onClick={() => {handleButtonClick('end', saveEndState)}}>
            Set as End Location
      </Button>

          <Stack direction="row" justifyContent="center" alignItems="center" spacing={2}>
          <Typography variant='h4'>HEIGHT: </Typography>
            <Button size="small" variant="contained" 
                      style={{ 
                          margin: '0.5rem'
                        }}  
                      onClick={() => {modifySpriteSize(currentSprite, 'height', false)}}>
                    -
              </Button>
              <Button size="small" variant="contained" 
                      style={{ 
                          margin: '0.5rem'
                        }}  
                      onClick={() => {modifySpriteSize(currentSprite, 'height', true)}}>
                    +
              </Button>
          </Stack>

          <Stack direction="row" justifyContent="center" alignItems="center" spacing={2}>
            <Typography variant='h4'>WIDTH: </Typography>
              <Button size="small" variant="contained" 
                        style={{ 
                            margin: '0.5rem'
                          }}  
                        onClick={() => {modifySpriteSize(currentSprite, 'width', false)}}>
                      -
                </Button>
                <Button size="small" variant="contained" 
                        style={{ 
                            margin: '0.5rem'
                          }}  
                        onClick={() => {modifySpriteSize(currentSprite, 'width', true)}}>
                      +
                </Button>
            </Stack>

      </Stack>
    </Popover>

  </div>
  );
};

export default MovementEditor;
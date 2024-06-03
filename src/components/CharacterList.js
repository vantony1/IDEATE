import React, { useEffect, useState } from 'react';
import {
    Card,
    CardMedia,
    CardContent,
    Button,
    Typography,
    Dialog,
    Tabs,
    Tab,
} from '@mui/material';
import { Sprite } from 'spritejs';
import CharacterSelector from './CharacterSelector';
import CharacterPicker from './CharacterPicker';
import 'react-toastify/dist/ReactToastify.css';
import { toast } from 'react-toastify';

const CharacterList = ({ characters, elements, onCharacterAdd, onCharacterRemove, openCharacterPicker, setOpenCharacterPicker }) => {

    const [selectedCharacter, setSelectedCharacter] = useState();
    const [currentCharacterList, setCurrentCharacterList] = useState([]);
    const [currentTab, setCurrentTab] = useState(0);

    useEffect(() => {
        console.log("LOADING W: ", elements)
    }, [currentCharacterList])

    const handleClose = () => {
      setOpenCharacterPicker(false);
    };

    const addCharacter = () => {
      
        console.log("ADDING CHARACTER:", selectedCharacter)
        toast.success('Added new character to scene')
        const sprite = new Sprite({
          texture: selectedCharacter.sprites[0],
          pos: [0, 0],
          size: [256, 256],
        });
        selectedCharacter.sprite = sprite;

        setCurrentCharacterList([
          ...currentCharacterList,
          selectedCharacter,
        ]);
        onCharacterAdd(selectedCharacter)
    }

    const handleCharacterChange = (newCharacter) => {
        console.log("character selected: ", newCharacter)
        setSelectedCharacter(newCharacter);
    };

    function removeCharacter(index) {
        setCurrentCharacterList(currentCharacterList.filter((_, i) => i !== index));
        onCharacterRemove(index)
    }
      

    function renderCharacter(character, index) {
        return (
            <Card key={index} sx={{ maxWidth: 345, margin: '0 auto 16px' }}>
                <CardMedia
                component="img"
                height="140"
                image={character.sprites[0]}
                alt={character.characterName}
                />
                <CardContent>
                <Typography gutterBottom variant="body" component="div">
                    {character.characterName} || {character.actionName}
                </Typography>
                <Button onClick={() => removeCharacter(index)}>Remove</Button>
                </CardContent>
            </Card>
        );
    }

    const handleTabChange = (event, newValue) => {
        setCurrentTab(newValue);
    };

    return (
        <div>
            <Dialog
            open={openCharacterPicker}
            fullWidth={true}
            onClose={handleClose}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
            >
            <Tabs value={currentTab} onChange={handleTabChange} centered sx={{margin: '1rem'}}>
                <Tab label="Dyanmic Characters" 
                    sx={{ 
                        backgroundColor: currentTab === 0 ? 'white' : 'transparent', 
                    }}      
                />
                <Tab label="Static Characters" 
                    sx={{ 
                        backgroundColor: currentTab === 1 ? 'white' : 'transparent', 
                    }}    
                />
            </Tabs>

            {currentTab === 0 && (
                <CharacterSelector
                characters={characters}
                onCharacterChange={handleCharacterChange}
                />
            )}
            {currentTab === 1 && (
                <CharacterPicker
                characters={elements}
                onCharacterChange={handleCharacterChange}
                />
            )}

            <Button variant='outlined' onClick={addCharacter} sx={{backgroundColor: 'white', maxWidth: '20rem', alignSelf: 'center', margin: '2rem'}}>
                ADD THIS CHARACTER
            </Button>
            </Dialog>
        </div>
    );
};

export default CharacterList;


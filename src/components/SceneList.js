import React from 'react';
import { List, ListItem, ListItemText, Button, ListItemSecondaryAction } from '@mui/material';

function SceneList(props) {
  const { scenes, onSelectScene, onAddScene, onDeleteScene } = props;

  const handleSelectScene = (index) => {
    onSelectScene(index);
  };

  const handleAddScene = () => {
    onAddScene();
  };

  const handleDeleteScene = (index) => {
    onDeleteScene(index);
  };

  return (
    <div className="SceneList">
      <List>
        {scenes.map((scene, index) => (
          <ListItem
            key={index}
            button
            onClick={() => handleSelectScene(index)}
          >
            <ListItemText primary={`Scene ${index + 1}`} />
            <ListItemSecondaryAction>
              <Button
                color="secondary"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteScene(index);
                }}
              >
                Delete
              </Button>
            </ListItemSecondaryAction>
          </ListItem>
        ))}
      </List>
      <Button
        variant="contained"
        color="primary"
        onClick={handleAddScene}
      >
        Add Scene
      </Button>
    </div>
  );
}

export default SceneList;

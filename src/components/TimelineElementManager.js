import React, { useEffect, useState } from 'react';
import Avatar from '@mui/material/Avatar';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import DialogTitle from '@mui/material/DialogTitle';
import Dialog from '@mui/material/Dialog';
import ClearIcon from '@mui/icons-material/Clear';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import { Slider, Box, Typography } from '@mui/material';

const TimelineElementManager = (props) => {
  const { onClose, selectedElement, open, onDeleteElement, updateVolumeByID } = props;
  const [volume, setVolume] = useState(0.5)

  useEffect(() => {
    if(!selectedElement) return;
    console.log("selected element: ", selectedElement)
  }, [selectedElement])

  useEffect(() => {
    if(!volume) return;
    updateVolumeByID(selectedElement.id, volume)
  }, [volume])

  const handleClose = () => {
    onClose(selectedElement);
  };

  const handleVolumeChange = (event) => {
    setVolume(event.target.value);
  };

  const handleListItemClick = (value) => {
    onClose(value);
  };

  return (
    <Dialog onClose={handleClose} open={open}>
      <DialogTitle>manage: {selectedElement.id}</DialogTitle>
      <List sx={{ pt: 0 }}>

        <ListItem disableGutters>
          <ListItemButton
            autoFocus
            onClick={() => onDeleteElement()}
          >
            <ListItemAvatar>
              <Avatar>
                <ClearIcon />
              </Avatar>
            </ListItemAvatar>
            <ListItemText primary="delete element" />
          </ListItemButton>
        </ListItem>
      </List>
    </Dialog>
  );
}

export default TimelineElementManager;
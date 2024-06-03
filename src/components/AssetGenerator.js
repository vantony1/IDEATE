import React, { useState } from 'react';
import { Popover, Fab, Tabs, Tab, Dialog, Button } from '@mui/material';
import { SidebarChat, VisualsGenerator, AudioGenerator } from '.';
import ChatIcon from '@mui/icons-material/Chat';

const AssetGenerator = ({openAssetGenerator, setOpenAssetGenerator, reFetchAssets}) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [value, setValue] = useState(0);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const handleCloseDialog = () => {
    reFetchAssets()
    setOpenAssetGenerator(false)
  }

  return (
    <div>
      <Dialog
        open={openAssetGenerator}
        fullWidth={true}
        onClose={handleCloseDialog}
        PaperProps={{ 
          style: {
            width: '75vw', 
            maxWidth: '75vw', 
            display: 'flex', 
            flexDirection: 'column', 
          },
        }}
      >
      <Tabs value={value} onChange={handleChange} variant="fullWidth">
      <Tab 
        label="Visuals Generator" 
        sx={{ 
          backgroundColor: value === 0 ? 'white' : 'transparent', 
        }} 
      />
      <Tab 
        label="Audio Generator" 
        sx={{ 
          backgroundColor: value === 1 ? 'white' : 'transparent',
        }} 
      />
      </Tabs>

      <div style={{ flexGrow: 1, overflow: 'auto' }}>
        {value === 0 && <VisualsGenerator />}
        {value === 1 && <AudioGenerator />}
      </div>

      <Fab color="primary" 
           onClick={handleClick}
           style={{ position: 'fixed',
                    bottom: 0,
                    right: 0,
                    margin: '2rem'}}>
        <ChatIcon />
      </Fab>
      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        sx={{
          marginTop: '0.5rem'
        }}
      >
        <SidebarChat />
      </Popover>
      </Dialog>
    </div>
  );
};

export default AssetGenerator;

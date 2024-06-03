import React, { useState } from 'react';
import {
    Box,
    Dialog,
    Tabs,
    Tab,
  } from '@mui/material';
import BackgroundDyanamicsManager from './BackgroundDyanmicsManager';
import BackgroundSelector from './BackgroundPicker'

const BackgroundManager = ({ backgrounds, selectedBackground, onBackgroundChange, openBackgroundManager, setOpenBackgroundManager, particlesOptions, onBackgroundDynamicsUpdate, handleSaveGeneratedBackground, setParticlesRenderState}) => {
  const [activeTab, setActiveTab] = useState(0);
  
  const handleClose = () => {
    setOpenBackgroundManager(false);
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };
  
  return (
    <Dialog
        open={openBackgroundManager}
        fullWidth={true}
        onClose={handleClose}
      >
    <Box style={{ padding: '1rem' }}>

        <Tabs value={activeTab} onChange={handleTabChange} variant="fullWidth">
          <Tab label="Select Background"  
                sx={{ 
                  backgroundColor: activeTab === 0 ? 'white' : 'transparent', 
                }}  
          />
          <Tab label="Manage Dynamics" 
                sx={{ 
                  backgroundColor: activeTab === 1 ? 'white' : 'transparent',
                }} 
            />
        </Tabs>

        {activeTab === 0 && 
            <BackgroundSelector 
                backgrounds={backgrounds} 
                selectedBackground={selectedBackground} 
                onBackgroundChange={onBackgroundChange}
            />
        }

        {activeTab === 1 && 
            <BackgroundDyanamicsManager
                particlesOptions={particlesOptions}
                onBackgroundDynamicsUpdate={onBackgroundDynamicsUpdate}
                setParticlesRenderState={setParticlesRenderState}
            />
        } 
    </Box>
    </Dialog>
  );
};

export default BackgroundManager;
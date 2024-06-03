import React, { useState, useEffect } from 'react';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import ListSubheader from '@mui/material/ListSubheader';
import Switch from '@mui/material/Switch';
import WifiIcon from '@mui/icons-material/Wifi';
import Stack from '@mui/material/Stack';
import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';
import Typography from '@mui/material/Typography';

const CenteredTypography = ({children}) => (
    <div style={{ display: 'flex', justifyContent: 'center' }}>
      <Typography variant='overline'>{children}</Typography>
    </div>
);

function SpeechProfileManager({profiles, currentProfile, setCurrentProfile, onProfileDelete}) {
  const current = [{'name': 'James', 'voiceID' : 'en-US-Standard-A', 'pitch': 1, 'speakingRate': 1.2}]
  const [selectedItem, setSelectedItem] = useState({});
  const [syncned, setSynced] = useState(true)

  const handleToggle = (value) => () => {
    setSynced(false)
    setCurrentProfile(value)
    setSelectedItem(value);
    setTimeout(() => {
        setSynced(true); 
      }, 500);
  };

  const profilesEqual = (profileA, profileB) => {
    if(profileA.voiceID !== profileB.voiceID || profileA.pitch !== profileB.pitch || profileA.speakingRate !== profileB.speakingRate ){
        return false
    } else {
        return true
    }
  }

  useEffect(() => {
    if(selectedItem === {} || !syncned) return;
    if(profilesEqual(selectedItem, currentProfile) ){
        setSelectedItem({})
    }
  }, [currentProfile])

  const renderSpeechProfile = (profile) => {
    return (
    <ListItem key={profile.name} sx={{maxWidth: '15rem'}}>
        <ListItemText id="switch-list-label-wifi" primary={profile.name} />
        <Stack direction={"row"}>
            <Switch
            edge="end"
            onChange={handleToggle(profile)}
            checked={profilesEqual(profile, currentProfile)}
            inputProps={{
                'aria-labelledby': 'switch-list-label-bluetooth',
            }}
            />
            <IconButton onClick={() => onProfileDelete(profile)} size="small">
                <DeleteIcon fontSize="small" />
            </IconButton>
        </Stack>
      </ListItem>
    )
  }

  return (
    <List
      sx={{ width: '100%', maxWidth: 360, bgcolor: 'background.paper' }}
      subheader={<CenteredTypography>Saved Profiles</CenteredTypography>}
    >
      {profiles.map((profile) => {
        return renderSpeechProfile(profile)
      })}
    </List>
  );
}

export default SpeechProfileManager;

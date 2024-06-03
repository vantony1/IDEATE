import { Typography } from '@mui/material';
import React, { FC } from 'react';

export const AudioRender = ({action, row}) => {
  return (
    <div className={'audio'} style={{ cursor: 'pointer', backgroundColor: '#cd9541'}}>
      <div className={`audio-text`} style={{
        marginLeft: '4px', 
        fontSize: '14px', 
        color: 'white', 
        borderRadius: '5px', 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        backgroundImage: "url(/assets/misc/soundWave.svg)",

      }}>
        <Typography style={{ backgroundColor: '#cd9541' }}>{`Audio: ${action.data.name}`}</Typography>  
      </div>
    </div>
  );
};

export const SpeechRender = ({action, row}) => {
  return (
    <div className={'audio'} style={{ cursor: 'pointer', backgroundColor: '#cd9541'}}>
      <div className={`audio-text`} style={{
        marginLeft: '4px', 
        fontSize: '14px', 
        color: 'white', 
        borderRadius: '5px', 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        backgroundImage: "url(/assets/misc/speech.png)",

      }}>
        <Typography style={{ backgroundColor: '#cd9541' }}>{`Speech: ${action.data.name}`}</Typography>  
      </div>
    </div>
  );
};

export const SpriteRender = ({action, row}) => {
  return (
    <div className={'sprite'} style={{ cursor: 'pointer', backgroundColor: '#1C3879'}}>
      <div className={`sprite-text`} style={{ 
        marginLeft: '4px', 
        fontSize: '14px', 
        color: 'white', 
        borderRadius: '5px', 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        backgroundImage: "url(/assets/misc/ocean.svg)",
        backgroundSize: 'cover',
        }}>
                  <Typography style={{ backgroundColor: '#1C3879' }}>{`Sprite: ${action.data.name}`}</Typography>  

      </div>
    </div>
  );
};
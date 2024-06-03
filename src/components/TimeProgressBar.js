import React, { useState, useEffect } from 'react';
import { LinearProgress } from '@mui/material';

function TimeProgressBar({ totalTime }) {
  const [progress, setProgress] = useState(0);
  
  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((oldProgress) => {
        if (oldProgress === 100) {
          clearInterval(timer);
          return 100;
        }
        const newProgress = oldProgress + 100/(totalTime/100);
        return Math.min(newProgress, 100);
      });
    }, 100);
  
    return () => {
      clearInterval(timer);
    };
  }, [totalTime]);

  return (
    <div>
      <LinearProgress variant="determinate" value={progress} sx={{ height: 10}}/>
    </div>
  );
}

export default TimeProgressBar;
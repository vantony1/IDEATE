import { CaretRightOutlined, PauseOutlined } from '@ant-design/icons';
import { Select } from 'antd';
import React, { FC, useEffect, useState } from 'react';
import { scale, scaleWidth, startLeft } from './mock';
import { Slider } from 'antd';
import { Stack, IconButton } from '@mui/material';
import PauseIcon from '@mui/icons-material/Pause';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import ReplayIcon from '@mui/icons-material/Replay';

const { Option } = Select;
export const Rates = [0.2, 0.5, 1.0, 1.5, 2.0];

const TimelinePlayer = ({ timelineState, autoScrollWhenPlay, isPreview = false, duration, setRenderParticles }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [time, setTime] = useState(0);

  useEffect(() => {
    if (!timelineState.current) return;
    const engine = timelineState.current;
    engine.listener.on('play', () => {setIsPlaying(true); if (setRenderParticles) {setRenderParticles(true)}});
    engine.listener.on('paused', () => setIsPlaying(false));
    engine.listener.on('ended', () => {setIsPlaying(true); if (setRenderParticles) {setRenderParticles(false)}});
    engine.listener.on('afterSetTime', ({ time }) => setTime(time));
    engine.listener.on('setTimeByTick', ({ time }) => {
      setTime(time);

      if (autoScrollWhenPlay.current) {
        const autoScrollFrom = 500;
        const left = time * (scaleWidth / scale) + startLeft - autoScrollFrom;
        timelineState.current.setScrollLeft(left)
      }
    });

    return () => {
      if (!engine) return;
      engine.pause();
      engine.listener.offAll();
    };
  }, []);

  const handlePlayOrPause = () => {
    if (!timelineState.current) return;
    if (timelineState.current.isPlaying) {
      timelineState.current.pause();
    } else {
      timelineState.current.play({ autoEnd: true });
    }
  };

  const handleRateChange = (rate)  => {
    if (!timelineState.current) return;
    timelineState.current.setPlayRate(rate);
  };

  const timeRender = () => {
    const float = (parseInt((time % 1) * 100 + '') + '').padStart(2, '0');
    const min = (parseInt(time / 60 + '') + '').padStart(2, '0');
    const second = (parseInt((time % 60) + '') + '').padStart(2, '0');
    return <>{`${min}:${second}.${float.replace('0.', '')}`}</>;
  };
  
  return (
    <div className="timeline-player">
      <Stack direction={"row"} spacing={2} sx={{marginLeft: '1rem'}}>
      <IconButton
      size="large"
      aria-label={isPlaying ? 'pause' : 'play'}
      onClick={handlePlayOrPause}
      sx={{
        border: `2px solid ${isPlaying ? '#1C3879' : 'grey'}`,
        borderRadius: '50%',
        '& .MuiSvgIcon-root': {
          color: isPlaying ? 'primary' : 'grey',
        },
      }}
    >
      {isPlaying ? <PauseIcon fontSize="inherit" /> : <PlayArrowIcon fontSize="inherit" />}
    </IconButton>
      {isPreview ? <Slider className="play-time-slider" step={0.01} min={0} max={duration} value={time} />
      : <></>}
      <Stack spacing={2}>
      <div className="time">{timeRender(time)}</div>
      <div className="rate-control">
        <Select size={'small'} defaultValue={1} style={{ width: 120 }} onChange={handleRateChange}>
          {Rates.map((rate) => (
            <Option key={rate} value={rate}>{`${rate.toFixed(1)}x`}</Option>
          ))}
        </Select>
      </div>
      </Stack>
      <IconButton
      size="large"
      aria-label={isPlaying ? 'pause' : 'play'}
      onClick={() => {timelineState.current.setTime(0)}}
      sx={{
        border: `2px solid ${isPlaying ? '#1C3879' : 'grey'}`,
        borderRadius: '50%',
        '& .MuiSvgIcon-root': {
          color: isPlaying ? 'primary' : 'grey',
        },
      }}
    > 
      <ReplayIcon fontSize="inherit" />
    </IconButton>
      </Stack>
    </div>
  );
};

export default TimelinePlayer;
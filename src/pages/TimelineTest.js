import { Timeline, TimelineState } from '@xzdarcy/react-timeline-editor';
import { Switch } from 'antd';
import { Layer, Sprite, Scene } from 'spritejs';
import { cloneDeep } from 'lodash';
import React, { useRef, useState, useEffect } from 'react';
import { AudioRender, CustomRender1, SpriteRender } from '../components/custom';
import '../components/index.less';
import { mockData, mockEffect, scale, scaleWidth, startLeft } from '../components/mock';
import TimelinePlayer from '../components/player';
import { Button } from '@mui/material';

const defaultEditorData = cloneDeep(mockData);

const TimelineTest = () => {
  const [data, setData] = useState(defaultEditorData);
  const timelineState = useRef();
  const playerPanel = useRef();
  const stageRef = useRef(null);
  const [layer, setLayer] = useState(new Layer())
  const idRef = useRef(0)

  useEffect(() => {
    console.log("data set to: ", data)
  }, [data])

  useEffect(() => {
    const scene = new Scene({ container: stageRef.current, width: 800, height: 600 });
    scene.append(layer);
    
    const sprite = new Sprite({
      texture: '/assets/sprites/rex/playful-walk/playful-walk-1.png',
      pos: [0, 0],
      size: [256, 256],
      });

    layer.append(sprite);

    const endState = {
      x: 465,
      y: 300
    }

    const startState = { 
      x: 80,
      y: 30
    }

    const sprites = [
      "/assets/sprites/rex/playful-walk/playful-walk-1.png",
      "/assets/sprites/rex/playful-walk/playful-walk-2.png",
      "/assets/sprites/rex/playful-walk/playful-walk-3.png",
      "/assets/sprites/rex/playful-walk/playful-walk-4.png"
    ]

    const spock = {
      id: '3',
      actions: [
        {
          id: 'action2',
          start: 0,
          end: 5,
          effectId: 'effect2',
          data: {
            src: '/lottie/lottie3/data.json',
            name: 'rex-moving',
            sprite: sprite,
            endState: endState,
            startState: startState,
            sprites: sprites
          },
        },
        {
          id: 'action10',
          start: 5,
          end: 10,
          effectId: 'effect2',
          data: {
            src: '/lottie/lottie3/data.json',
            name: 'rex-returning',
            sprite: sprite,
            endState: startState,
            startState: endState,
            sprites: sprites
          },
        },
      ]
    }

    setData([...data, spock])
      

    return () => {
      layer.removeAllChildren()
      scene.remove(layer)
    };
  }, [stageRef]);

  const addCharacter = () => {

    const sprite = new Sprite({
      texture: '/assets/sprites/tronco/walking/tronco-walking-1.png',
      pos: [110, 100],
      size: [256, 256],
      });

    layer.append(sprite);

    const endState = {
      x: 25,
      y: 320
    }

    const startState = { 
      x: 520,
      y: 2
    }

    const sprites = [
      "/assets/sprites/tronco/walking/tronco-walking-1.png",
      "/assets/sprites/tronco/walking/tronco-walking-2.png",
      "/assets/sprites/tronco/walking/tronco-walking-3.png",
      "/assets/sprites/tronco/walking/tronco-walking-4.png"
    ]

    const spock = {
      id: '4',
      actions: [
        {
          id: 'action4',
          start: 0,
          end: 5,
          effectId: 'effect2',
          data: {
            src: '/lottie/lottie13/data.json',
            name: 'trial',
            sprite: sprite,
            endState: endState,
            startState: startState,
            sprites: sprites
          },
        },
      ]
    }

    setData([...data, spock])

  }

  return (
    <div className="timeline-editor-engine">
       <div id="stage" ref={stageRef} 
          style={{ marginTop: '5.5vh', 
                    width: 1080, height: 650, 
                    border: "1px solid #d3d3d3", 
                    backgroundImage: `url(/assets/backgrounds/mountains.png)`, 
                    backgroundSize: "100% 100%" 
                }}/>
      <div className="player-panel" id="player-ground-1" ref={playerPanel}></div>
      <Button onClick={() => addCharacter()}>ADD CHAR TEST</Button>
      
      <TimelinePlayer timelineState={timelineState} autoScrollWhenPlay={true} />
      <Timeline
        scale={scale}
        scaleWidth={scaleWidth}
        startLeft={startLeft}
        autoScroll={true}
        ref={timelineState}
        editorData={data}
        style={{width: "100% "}}
        effects={mockEffect}
        onDoubleClickRow={(e, {row, time}) => {
          setData((pre) => {
            const rowIndex = pre.findIndex(item => item.id === row.id);
            const newAction = {
              id: `action${idRef.current++}`,
              start: time,
              end: time + 0.5,
              effectId: "effect0",
            }
            pre[rowIndex] = {...row, actions: row.actions.concat(newAction)};
            return [...pre];
          })
        }}
        onChange={(data) => {
          setData(data);
        }}
        getActionRender={(action, row) => {
          if (action.effectId === 'effect0') {
            return <AudioRender action={action} row={row} />;
          } else if (action.effectId === 'effect2') {
            return <SpriteRender action={action} row={row} />;
          }
        }}
      />
    </div>
  );
};

export default TimelineTest;
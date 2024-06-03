import React, { useEffect, useRef, useState } from 'react';
import './index.less';
import { CaretRightOutlined, PauseOutlined } from '@ant-design/icons';
import { Slider } from 'antd';
import { TimelineEngine } from '@xzdarcy/react-timeline-editor';
import { useRecoilValue, useRecoilState } from 'recoil';
import { storyline, storyProgression, storyTitle, startSceneID } from '../services/state';
import { mockEffect } from './mock';
import { Layer, Scene, Sprite } from 'spritejs';
import { v4 as uuidv4 } from 'uuid';
import { Backdrop, Stack, Typography, Button, AppBar, Toolbar } from '@mui/material';
import Particles from 'react-tsparticles';
import { RenderedSVGComponent } from './SVGComponents';
import { useSpeechSynthesizer } from '../services/SpeechSynthesizer';
import { useNavigate } from 'react-router-dom';


const StoryPreview = () => {
  const story = useRecoilValue(storyline)
  const progression = useRecoilValue(storyProgression)
  const [index, setIndex] = useState(0)
  const [timeline, setTimeline] = useState(null)
  const [isPlaying, setIsPlaying] = useState(false);
  const [isEnded, setIsEnded] = useState(false)
  const [duration, setDuration] = useState(0);
  const [time, setTime] = useState(0);
  const timelineEngine = useRef();
  const playerPanel = useRef();
  const [currentScene, setCurrentScene] = useState(null)
  const [sceneBackground, setSceneBackground] = useState("")  
  const [sceneQuestion, setSceneQuestion] = useState("")  
  const [sceneDefaultOptionIndex, setSceneDefaultOptionIndex] = useState(0)  
  const [sceneQuestionDuration, setSceneQuestionDuration] = useState(10)  
  const [sceneInteraction, setSceneInteraction] = useState([])
  const [sceneBubbles, setSceneBubbles] = useState([])
  const [sceneBackgroundDynamics, setSceneBackgroundDynamics] = useState({}) 
  const storyName = useRecoilValue(storyTitle)
  const startNodeID = useRecoilValue(startSceneID)
  const navigate = useNavigate()
  const [renderParticles, setRenderParticles] = useState(false)
  const [backdropOpen, setBackdropOpen] = useState(false);
  const synth_speech = useSpeechSynthesizer()
  const [responseButtonsDisabled, setResponseButtonsDisabled] = useState(false);

  const stageRef = useRef(null);
  const sceneRef = useRef(null);
  const layerRef = useRef(null);
  const containerRef = useRef();

  function delay(time) {
    return new Promise(resolve => setTimeout(resolve, time));
  }

  const generateRandomId = () => {
    return uuidv4().split('-')[0];
  };
  useEffect(() => {
    sceneRef.current = new Scene({ container: stageRef.current, width: 800, height: 600 });
    layerRef.current = new Layer();
    sceneRef.current.append(layerRef.current);
    return () => {
      layerRef.current.removeAllChildren()
      sceneRef.current.remove(layerRef.current)
      sceneRef.current.removeAllChildren()
    };
  }, [stageRef]);


  useEffect(() => {
    if(!timeline) return;
    console.log(layerRef.current.children)
  }, [timeline])
  
  useEffect(() => {
    if(!story) return;
    // Start playing the first scene
    if (story.length > 0) {
      const firstScene = story.find(node => node.id === startNodeID);
      setCurrentScene(firstScene)
      processSceneData(firstScene.data);
      setIndex((currentIndex) => currentIndex+1)
    }
  }, [story]);

  const handleLoadNextScene = (choice) => {
    if (!(choice == null)) {
      const nextSceneID = currentScene.data.options[choice].nextScene
      const nextScene = story.find((scene) => scene.id === nextSceneID);
      if(nextScene){
        setCurrentScene(nextScene)
        processSceneData(nextScene.data);
      } else {
        setIsEnded(true)
      }
    } else if (!(currentScene.data.interactions)){
      const nextScenes = progression.filter(edge => edge.source === currentScene.id)
      if(nextScenes.length > 0){
        const nextScene = story.find((scene) => scene.id === nextScenes[0].target);
        setCurrentScene(nextScene)
        processSceneData(nextScene.data);
      } else {
        setIsEnded(true)
      }
    }
    
    else {
      setIsEnded(true)
    }
  }

  const processSceneData = async (timelineData) => {
    const scene = []
    if(!isPlaying){
      setTimeline(null)
      layerRef.current.removeAllChildren()
    }
    if(!timelineData) return;
    setSceneBackground(timelineData.background)
    setSceneQuestion(timelineData.question)
    setSceneDefaultOptionIndex(timelineData.defaultOptionIndex)
    setSceneQuestionDuration(timelineData.questionDuration)
    setSceneInteraction(timelineData.options)
    setSceneBackgroundDynamics(timelineData.backgroundDynamics)
    setSceneBubbles(timelineData.bubbles ? timelineData.bubbles : [])

    timelineData.timeline.forEach(element => {
      console.log(element)
      switch(element.type){
        case 'audio':
          scene.push(addAudioElementToTimeline(element))
          break
        case 'sprite':
          scene.push(addSpriteElementToTimeline(element))
          break
        default:
          console.log("cannot process invalid element type")
          break
      }
    })

    setTimeline(scene)
  }


  const addSpriteElementToTimeline = (element) => {

    const element_copy = JSON.parse(JSON.stringify(element));
    const actionID = generateRandomId()

    const sprite = new Sprite({
      texture: element.sprites[0],
      pos: [element.startState ? element.startState.x : 0, element.startState ? element.startState.y : 0],
      size: [element.size && element.size[0] ? element.size[0] : 256, element.size && element.size[1] ? element.size[1] : 256],
      id: element_copy.id+actionID
    });


    let spriteElement = {
      id: element_copy.id+actionID,
      type: 'sprite',
      actions: [
        {
          id: element_copy.id+actionID,
          start: element_copy.start,
          end: element_copy.end,
          effectId: 'spriteEffect',
          endState: element_copy.endState,
          startState: element_copy.startState,
          data: {
            src: element_copy.id+actionID,
            name: element_copy.characterName + '-' + element_copy.actionName,
            sprite: sprite,
            endState: element_copy.endState,
            startState: element_copy.startState,
            sprites: element_copy.sprites
          },
        }
      ]
    }

    layerRef.current.append(sprite);

    return spriteElement;

  }

  const addAudioElementToTimeline = (element) => {

    console.log("<AUDIO ELEMENT>", element )

    let audioElement = {
      id: element.id,
      type: 'audio',
      actions: [
        {
          id: element.id,
          start: element.start,
          end: element.end,
          effectId: 'audioEffect',
          data: {
            src: element.src,
            name: element.name,
            ext: element.ext
          },
        }
      ]
    }

  return audioElement;
    
  }


  useEffect(() => {
    console.log('timeline data: updated', timeline)

    if(!timeline) return;

    const engine = new TimelineEngine();
    timelineEngine.current = engine;
    timelineEngine.current.effects = mockEffect;
    timelineEngine.current.data = timeline;
    timelineEngine.current.on('play', () => {setIsPlaying(true); setRenderParticles(true)});
    timelineEngine.current.on('paused', () => setIsPlaying(false));
    timelineEngine.current.on('ended', () => setRenderParticles(false));
    timelineEngine.current.on('afterSetTime', ({ time }) => setTime(time));
    timelineEngine.current.on('setTimeByTick', ({ time }) => setTime(time));
    timelineEngine.current.on('ended', () => {if(currentScene.data.interactions){setBackdropOpen(true); setResponseButtonsDisabled(false);
      let timer = setTimeout(() => {
        setResponseButtonsDisabled(true)
      }, duration * 1000);} else {handleLoadNextScene()}})
    let dur = 0;
    timeline.forEach(row => {
      row.actions.forEach(action => dur = Math.max(dur, action.end));
    })
    setDuration(dur);

    timelineEngine.current.play({ autoEnd : true })

    return () => {
      if (!timelineEngine.current) return;
      timelineEngine.current.pause();
      timelineEngine.current.offAll();
    };
  }, [timeline]);

  const handlePlayOrPause = () => {
    if (!timelineEngine.current) return;
    if (timelineEngine.current.isPlaying) {
      timelineEngine.current.pause();
    } else {
      setRenderParticles(true)
      timelineEngine.current.play({ autoEnd: true });
    }
  };

  const handleSetTime = (value) => {
    timelineEngine.current.setTime(Number(value));
    timelineEngine.current.reRender();
  }

  const handleReplay = () => {
    setIndex(0)
    handleSetTime(0)

    if (story.length > 0) {
      const firstScene = story[0];
      processSceneData(firstScene.data);
      setIndex((currentIndex) => currentIndex+1)
    }

  }

  // 时间展示
  const timeRender = (time) => {
    const float = (parseInt((time % 1) * 100 + '') + '').padStart(2, '0');
    const min = (parseInt(time / 60 + '') + '').padStart(2, '0');
    const second = (parseInt((time % 60) + '') + '').padStart(2, '0');
    return <>{`${min}:${second}.${float}`}</>;
  };

  useEffect(() => {
    console.log('render particles: ', renderParticles)
  }, [renderParticles])

  useEffect(() => {
    let timer;
    if (backdropOpen) {
      synth_speech.say(sceneQuestion)
      timer = setTimeout(() => {
        if (backdropOpen) { 
          const defaultResponse = sceneInteraction[sceneDefaultOptionIndex]?.response;
          if (defaultResponse) {
            handleClose(defaultResponse, sceneDefaultOptionIndex);
          }
        }
      }, sceneQuestionDuration * 1000); 
    }
    return () => clearTimeout(timer);
  }, [backdropOpen]);
  
  const handleClose = async (response, choice) => {
    setResponseButtonsDisabled(true);
    setBackdropOpen(false);
    const speak = synth_speech.say(response) 
    await speak
    await delay(500)
    handleLoadNextScene(choice)
  };

  const proxyServerURL = 'http://localhost:7053';

  return (
    <Stack direction={"row"} sx={{backgroundColor: 'primary'}} justifyContent="center" alignItems="center">
        <AppBar>
          <Toolbar>
              <Typography
                sx={{ flexGrow: 1 }}
                variant='h4'
              >
                Story Preview: {storyName}
              </Typography>

            <Stack direction={"row"} spacing={2} className="home-button">
                <Button variant="outlined" color="inherit" onClick={() => {navigate('/')}}>TO BOARD</Button>
            </Stack>
          </Toolbar>
        </AppBar>
    <div className="timeline-editor-engine">
       <div id="stage" 
           ref={stageRef} 
           style={{ marginTop: '5.5vh', 
                    width: 1080, height: 650, 
                    border: "1px solid #d3d3d3", 
                    backgroundImage: `url(${proxyServerURL}/file?path=${encodeURIComponent('../'+sceneBackground)})`, 
                    backgroundSize: "100% 100%" 
          }}
      >
        {renderParticles ? 
        <Particles options={sceneBackgroundDynamics} 
                   container={containerRef} 
                   style={{
                          margin: '2.5vh',
                          position: 'absolute',
                          maxWidth: "145vh",
                          maxHeight: "650px",
                   }}
        /> : <></>}
        {renderParticles ? sceneBubbles.map((bubble, i) => {
                return <RenderedSVGComponent 
                            key={i} initX={bubble.x} 
                            initY={bubble.y} text={bubble.text}
                            maxWidth={bubble.maxW}
                            fontSize={bubble.fontSize}
                            backgroundInfo={bubble.backgroundType}
                        />}) : <></> }
      </div>
      <div className="player-panel" id="player-ground-2" ref={playerPanel}></div>
      <div className="timeline-player">
        <div className="play-control" onClick={handlePlayOrPause}>
          {isPlaying ? <PauseOutlined /> : <CaretRightOutlined />}
        </div>
        <div className="play-time">
          <div className="play-time-current">{timeRender(time)}</div>
          <Slider onChange={handleSetTime} className="play-time-slider" step={0.01} min={0} max={duration} value={time} />
          <div className="play-time-duration">{timeRender(duration)}</div>
        </div>
      </div>
      {isEnded ? <Button onClick={() => {console.log("REPLAY"); handleReplay()}}> REPLAY </Button> : <></>}
          
      <Backdrop
        sx={{ color: '#fff', zIndex: 10 }}
        open={backdropOpen}
      >
        <Stack>
        <Typography variant="h2" sx={{margin: "5%", padding: "5%", backgroundColor: 'black'}}>{sceneQuestion}</Typography>
        <div style={{ display: 'flex', justifyContent: 'center' }}>
        {sceneInteraction.map((interaction, i) => {
          return <Button key={i} variant="contained" 
                          size="large" color="success" 
                          style={{padding:'2%', margin:'2%'}}
                          onClick={() => handleClose(interaction.response, i)}>
            <Typography variant='h3'>
             {interaction.option}
            </Typography>
            
          </Button>
        })}
        </div>
        </Stack>
      </Backdrop>

    </div>
    </Stack>
    );
};

export default StoryPreview;


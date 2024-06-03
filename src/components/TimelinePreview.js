import React, { useEffect, useRef, useState, useCallback } from 'react';
import './index.less';
import { mockEffect } from './mock';
import { useRecoilValue } from 'recoil';
import { testValue } from '../services/state';
import { Layer, Sprite, Scene } from 'spritejs';
import { Timeline } from '@xzdarcy/react-timeline-editor';
import TimelinePlayer from '../components/player';
import { SpriteRender, AudioRender } from '../components/custom';
import { useSpeechSynthesizer } from '../services/SpeechSynthesizer';
import { Backdrop, Stack, Typography, Button, Box } from '@mui/material';
import Particles from 'react-tsparticles';
import { RenderedSVGComponent } from '../components/SVGComponents';
import { useNavigate } from 'react-router-dom';

const TimelinePreview = ({loadNextScene = false, onLoadNextScene}) => {
  const navigate = useNavigate();
  
  const stageRef = useRef(null);
  const containerRef = useRef();
  const [duration, setDuration] = useState(0);
  const [time, setTime] = useState(0);
  const timelineState = useRef();

  const timelineData = useRecoilValue(testValue)
  const layer = new Layer()
  const [timeline, setTimeline] = useState([])
  const [sceneBackground, setSceneBackground] = useState("")  
  const [sceneQuestion, setSceneQuestion] = useState("")  
  const [sceneDefaultOptionIndex, setSceneDefaultOptionIndex] = useState(0)  
  const [sceneQuestionDuration, setSceneQuestionDuration] = useState(10)  
  const [sceneBubbles, setSceneBubbles] = useState([])
  const [sceneInteraction, setSceneInteraction] = useState([]) 
  const [sceneBackgroundDynamics, setSceneBackgroundDynamics] = useState({}) 
  const synth_speech = useSpeechSynthesizer()
  const [backdropOpen, setBackdropOpen] = useState(false);
  const [renderParticles, setRenderParticles] = useState(false)
  const [responseButtonsDisabled, setResponseButtonsDisabled] = useState(false); 

  useEffect(() => {
    const scene = new Scene({ container: stageRef.current, width: 800, height: 600 });
    scene.append(layer);
    return () => {
      layer.removeAllChildren()
      scene.remove(layer)
    };
  }, [stageRef]);

  const addSpriteElementToTimeline = (element) => {

    const sprite = new Sprite({
      texture: element.sprites[0],
      pos: [element.startState ? element.startState.x : 0, element.startState ? element.startState.y : 0],
      size: [element.size && element.size[0] ? element.size[0] : 256, element.size && element.size[1] ? element.size[1] : 256],
    });


    const element_copy = JSON.parse(JSON.stringify(element));

    let spriteElement = {
      id: element_copy.id,
      type: 'sprite',
      actions: [
        {
          id: element_copy.id,
          start: element_copy.start,
          end: element_copy.end,
          effectId: 'spriteEffect',
          endState: element_copy.endState,
          startState: element_copy.startState,
          data: {
            src: element_copy.id,
            name: element_copy.characterName + '-' + element_copy.actionName,
            sprite: sprite,
            endState: element_copy.endState,
            startState: element_copy.startState,
            sprites: element_copy.sprites
          },
        }
      ]
    }

    layer.append(sprite);

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

  const processSceneData = () => {
    const scene = []
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
  
  useEffect(() =>{
    if(timeline.length == 0) return;
    let dur = 0;
    timeline.forEach(row => {
      row.actions.forEach(action => dur = Math.max(dur, action.end));
    })
    setDuration(dur);
    console.log("duration: ", dur)

  }, [timeline])

  function delay(time) {
    return new Promise(resolve => setTimeout(resolve, time));
  }

  useEffect(() => {
    const getTime = () => {
      setTime(timelineState.current.getTime());
    };

    // Call the function every 100 ms
    const intervalId = setInterval(getTime, 100);

    // Clean up the interval when the component unmounts
    return () => {
      clearInterval(intervalId);
    };
  }, []);

  useEffect(() => {
    console.log("PROCESSING: ", timelineData)
    processSceneData(timelineData)
  }, []);

  useEffect(() => {
    if(duration == 0) return;
    if(time > duration && sceneQuestion && sceneQuestion != "") 
      { setResponseButtonsDisabled(false);
        setBackdropOpen(true);
        let timer = setTimeout(() => {
          setResponseButtonsDisabled(true)
        }, sceneQuestionDuration * 1000);
      }
    else if(loadNextScene){
      onLoadNextScene()
    }
  }, [time])

  useEffect(() => {
    let timer;
    if (backdropOpen) {
      synth_speech.say(sceneQuestion);
      timer = setTimeout(() => {
        if (backdropOpen && !responseButtonsDisabled) { // Check if backdrop is still open and buttons are not disabled
          const defaultResponse = sceneInteraction[sceneDefaultOptionIndex]?.response;
          if (defaultResponse) {
            handleClose(defaultResponse);
          }
        }
      }, (sceneQuestionDuration+1) * 1000);
    }
    return () => clearTimeout(timer);
  }, [backdropOpen]);
  
  const handleClose = async (response) => {
    setResponseButtonsDisabled(true); // Disable response buttons before speaking
    setBackdropOpen(false);
    const speak = synth_speech.say(response) //says question out loud
    await speak //delay for speech
    await delay(500)
    if(loadNextScene){
      onLoadNextScene()
    }
  };

  const getParticlesState = () => {
    console.log("returning: ", renderParticles)
    return renderParticles
  }

  useEffect(() => {
    console.log('render particles: ', renderParticles)
  }, [renderParticles])

  const proxyServerURL = 'http://localhost:7053';

  return (
    <Box display="flex" 
         flexDirection="column" 
         alignItems="center" 
         justifyContent="center"
    >
      <div id="stage" 
           ref={stageRef} 
           style={{ marginTop: '4.5rem', 
                    width: 1080, height: 650, 
                    border: "1px solid #d3d3d3", 
                    backgroundImage: `url(${proxyServerURL}/file?path=${encodeURIComponent('../'+sceneBackground)})`, 
                    backgroundSize: "100% 100%",
                    overflow: 'hidden' 
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
                        }}/> : <></>}

        {renderParticles ? sceneBubbles.map((bubble, i) => {
                return <RenderedSVGComponent 
                            key={i} initX={bubble.x} 
                            initY={bubble.y} text={bubble.text}
                            maxWidth={bubble.maxW}
                            fontSize={bubble.fontSize}
                            backgroundInfo={bubble.backgroundType}
                        />}) : <></> }


      </div>
      <Box sx={{marginTop: '1rem'}}>
        <TimelinePlayer 
          timelineState={timelineState} 
          autoScrollWhenPlay={true} 
          isPreview={false} 
          duration={duration}
          setRenderParticles={setRenderParticles}
          />
      </Box>
      <Box position="absolute" visibility="hidden">
          <Timeline
            scale={5}
            scaleWidth={160}
            startLeft={20}
            autoScroll={true}
            ref={timelineState}
            editorData={timeline}
            style={{width: "0% "}}
            effects={mockEffect}
            getActionRender={(action, row) => {
              if (action.effectId === 'audioEffect') {
                return <AudioRender action={action} row={row} />;
              } else if (action.effectId === 'spriteEffect') {
                return <SpriteRender action={action} row={row} />;
              }
            }}
          />
      </Box>

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
                          disabled={responseButtonsDisabled} // Disable buttons when needed
                          style={{padding:'2%', margin:'2%'}}
                          onClick={() => handleClose(interaction.response)}>
            <Typography variant='h3'>
             {interaction.option}
            </Typography>
            
          </Button>
        })}
        </div>
        </Stack>
      </Backdrop>
    
    </Box>
  );
};

export default TimelinePreview;


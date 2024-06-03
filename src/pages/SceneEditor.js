import React, { useState, useRef, useEffect, useCallback} from 'react';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Drawer from '@mui/material/Drawer';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import Dialog from '@mui/material/Dialog';
import Tooltip from '@mui/material/Tooltip';
import Chip from '@mui/material/Chip';
import Collapse from '@mui/material/Collapse';
import TextField from '@mui/material/TextField';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import QuestionAnswerOutlinedIcon from '@mui/icons-material/QuestionAnswerOutlined';
import RecordVoiceOverTwoToneIcon from '@mui/icons-material/RecordVoiceOverTwoTone';
import WallpaperIcon from '@mui/icons-material/Wallpaper';
import AndroidIcon from '@mui/icons-material/Android';
import AutoStoriesIcon from '@mui/icons-material/AutoStories';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import DesignServicesIcon from '@mui/icons-material/DesignServices';
import {  SpeechEditor, QuestionEditor, MovementEditor, 
          AudioPicker, TimelineElementManager, BackgroundManager, 
          AssetGenerator, BubbleManager, ScreenplayDisplay, TimelinePreview } from '../components'
import axios from 'axios';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import { currentSceneID, storyline, testValue, speechBubbles, screenplay, currentSceneData } from '../services/state';
import { useNavigate } from 'react-router-dom';
import { Button } from '@mui/material';
import { v4 as uuidv4 } from 'uuid';
import TimelinePlayer from '../components/player';
import '../components/index.less';
import { Timeline } from '@xzdarcy/react-timeline-editor';
import { SpriteRender, AudioRender, SpeechRender } from '../components/custom';
import { mockEffect} from '../components/mock';
import Particles from 'react-tsparticles';
import {loadFull} from 'tsparticles';

import { DraggableSVGComponent, RenderedSVGComponent } from '../components/SVGComponents';

const drawerWidth = '22vh';

const character = {
  id: 1,
  image: '/assets/sprites/rex/playful-walk/playful-walk-1.png',
  width: 256,
  height: 256,
};

const on = {
  particles: {
    color: {
      value: '#fff'
    },
    number: {
      value: 10
    },
    opacity: {
      value: {min: 1, max: 1}
    },
    shape: {
      type: "circle"
    },
    size: {
      value: {min:1, max:5}
    },
    move: {
      direction: "bottom-left",
      enable: true,
      speed: {min: 3, max: 5},
      straight: true
    },
  },
  fullScreen: {
    enable: false,
  },
};

function SceneEditor() {
  const navigate = useNavigate();
  const stageRef = useRef(null);
  const [story, setStory] = useRecoilState(storyline)
  const [dataBackup, setDataBackup] = useRecoilState(currentSceneData)
  const sceneID = useRecoilValue(currentSceneID)
  const [sceneName, setSceneName] = useState("")
  const [backgrounds, setBackgrounds] = useState([])
  const [audioList, setAudioList] = useState([])
  const [elementList, setElementList] = useState([])
  const [sprites, setSprites] = useState(character)
  const [selectedAudio, setSelectedAudio] = useState([]);
  const [selectedBackground, setSelectedBackground] = useState("");
  const [openAudioPicker, setOpenAudioPicker] = useState(false);
  const [openBackgroundPicker, setOpenBackgroundPicker] = useState(false);
  const [openSpeechEditor, setOpenSpeechEditor] = useState(false);
  const [openQuestionEditor, setOpenQuestionEditor] = useState(false);
  const [openCharacterPicker, setOpenCharacterPicker] = useState(false);
  const [openBubbleManager, setOpenBubbleManager] = useState(false);
  const [openAssetGenerator, setOpenAssetGenerator] = useState(false);
  const [showScript, setShowScript] = useState(false);
  const [scenePreview, setScenePreview] = useState(false);
  const [Screenplay, setScreenplay] = useRecoilState(screenplay)

  const [bubbles, setBubbles] = useState([])

  const [speech, setSpeech] = useState("");
  const [frames, setFrames] = useState([]);
  const timelineState = useRef();
  const [spriteTimelineData, setSpriteTimelineData] = useState([])
  const [timelineData, setTimelineData] = useState([]);
  const [characterToRemove, setCharacterToRemove] = useState(null)
  const [openTimelineElementManager, setOpenTimelineElementManager] = useState(false);
  const [selectedTimelineElement, setSelectedTimelineElement] = useState("");
  const [question, setQuestion] = useState(
    { text: '', 
    options: [{ option: '', response: '' }],
    defaultOptionIndex: 0,
    duration: 30}
  );
  const containerRef = useRef();
  const [sceneBackgroundDynamics, setSceneBackgroundDynamics] = useState(null)
  const [particlesOptions, setParticlesOptions] = useState(on)
  const setPreviewData = useSetRecoilState(testValue)
  const [renderParticles, setRenderParticles] = useState(false)

  const [hasSpeech, setHasSpeech] = useState(false)
  const [hasMusic, setHasMusic] = useState(false)

  const [open, setOpen] = useState(false);

  const initialize = useCallback(async (engine) => {
    await loadFull(engine);
  });
  
  const particlesLoaded = useCallback(async (container) => {
    await console.log(container);
  },[]);

  useEffect(() => {
    console.log("particles updated: ", particlesOptions)
  }, [particlesOptions])
  
  useEffect(() => {
    if (containerRef && containerRef.current) {
        console.log(containerRef.current);
    }
  });

  function getSceneById(id, story) {
    const scene = story.find(item => item.id === id);
    return scene || null;
  }

  useEffect(() => {
    console.log("scene set to: ", sceneID)
    console.log("story set to: ", story)
    if (!sceneID || !story) return;
    const scene = getSceneById(sceneID, story).data
    setSpeech(scene.speech)
    setQuestion({text: scene.question, options: scene.options, duration: scene.questionDuration, defaultOptionIndex: scene.defaultOptionIndex})
    setSelectedBackground(scene.background)
    setParticlesOptions(scene.backgroundDynamics)
    setSceneName(scene.label)
    setBubbles(scene.bubbles ? scene.bubbles : [])
    const audioTimelineData = scene.timeline.filter(item => item.type == 'audio');
    loadAudioTimelineData(audioTimelineData)
    const spriteTimelineData = scene.timeline.filter(item => item.type == 'sprite');
    setSpriteTimelineData(spriteTimelineData)
  }, [sceneID, story])

  useEffect(() => {
    console.log("timeline data to: ", timelineData)
  }, [timelineData])

  useEffect(() => {
    console.log("scene name to: ", sceneName)
  }, [sceneName])

  useEffect(() => {
    console.log("speech to: ", speech)
  }, [speech])

  useEffect(() => {
    console.log("frames set to: ", frames)
  }, [frames])

  const proxyServerURL = 'http://localhost:7053';

  const fetchAvailableBackgrounds = async () => {
    const response = await axios.get(`${proxyServerURL}/saved_backgrounds`)
    setBackgrounds(response.data)
  }

  const fetchAvailableAudio = async () => {
    const response = await axios.get(`${proxyServerURL}/saved_audio`)
    setAudioList(response.data)
  }

  const fetchAvailableSprites = async () => {
    const response = await axios.get(`${proxyServerURL}/get_sprites`)
    setSprites(response.data)
  }

  const fetchAvailableElements = async () => {
    const response = await axios.get(`${proxyServerURL}/saved_elements`)
    setElementList(response.data)
  }

  const fetchAllAssets = () => {
    fetchAvailableBackgrounds()
    fetchAvailableAudio()
    fetchAvailableElements()
  }

  const handleSaveGeneratedBackground = async (url, file) => {
    let filename = file + '.png';
    try {
      await axios.post(
        `${proxyServerURL}/save_generated_background`, 
        { url, filename }
      );
      console.log('Image saved successfully.');
      fetchAvailableBackgrounds()
    } catch (error) {
      console.error('An error occurred while saving the image.', error);
    }
  };

  const updateStory = (id, newData) => {
    setStory(prevStory => {
      const updatedStory = prevStory.map(scene => {
        if (scene.id === id) {
          return { ...scene, data: newData }; // Update the name property
        }
        return scene;
      });
      return updatedStory;
    });
  };

  function extractInfoFromPath(path) {
    const match = path.split('/');
    if (match && match.length > 3) {
      const characterName = match[3];
      const actionName = match[4];
      return { characterName, actionName };
    }
    return null;
  }

  function flattenTimeline(timeline) {
    const falttendTimeline = [];
    for (const element of timeline) {
      const { id, type, actions } = element;

      for (const action of actions) {
        const { id: actionId, start, end, data, startState, endState, size } = action;
        const { src, name, sprites } = data;

        if(type == 'sprite'){
          let charInfo = extractInfoFromPath(sprites[0])
          if(name.includes('static')){
            charInfo = {
              characterName: name.replace('-static', ''),
              actionName: 'static'
            }
          }

          const extractedActions = {
            id,
            type,
            actionId,
            start,
            end,
            effectId: action.effectId,
            name,
            characterName: charInfo.characterName,
            actionName: charInfo.actionName,
            sprites,
            size,
            startState,
            endState,
          };
          falttendTimeline.push(extractedActions);

        } else {

          if(action.effectId == 'audioEffect') {
            setHasMusic(true)
          } else if (action.effectId == 'speechEffect') {
            setHasSpeech(true)
          }

          const extractedActions = {
            id,
            type,
            actionId,
            start,
            end,
            effectId: action.effectId,
            ext: data.ext,
            src,
            name,
          };
          falttendTimeline.push(extractedActions);

        }
        
      }
    }
  
    return falttendTimeline;
  }

  const saveScene = () => {
    //generate frames from timeline
    console.log("<FRAMES>: ", frames)
    const flattenedTimeline = flattenTimeline(timelineData);
    let data = {
      frames: frames,
      speech: speech,
      background: selectedBackground,
      backgroundDynamics: particlesOptions,
      question:  question.text,
      options: question.options,
      defaultOptionIndex: question.defaultOptionIndex,
      questionDuration: question.duration,
      timeline: flattenedTimeline,
      bubbles: bubbles,
      label: sceneName,
      interactions: question.text !== "" ? true : false,
      music: flattenedTimeline.some((element) => element.effectId === 'audioEffect'),
      hasSpeech: flattenedTimeline.some((element) => element.effectId === 'speechEffect'),
      hasBubbles: bubbles.length > 0,
      characterCount: frames.length
    }

    console.log("<SAVED SCENE>: ", data)
    setDataBackup(null)
    updateStory(sceneID, data)
    navigate('/')
  }

  const previewScene = () => {
    let data = {
      frames: frames,
      speech: speech,
      background: selectedBackground,
      backgroundDynamics: particlesOptions,
      question: question.text,
      options: question.options,
      defaultOptionIndex: question.defaultOptionIndex,
      questionDuration: question.duration,
      timeline: flattenTimeline(timelineData),
      bubbles: bubbles,
      label: sceneName,
      interactions: question !== "" ? true : false,
      music: selectedAudio ? true : false
    }

    setPreviewData(data)
    setScenePreview(true)
  }

  useEffect(() => {
    fetchAvailableBackgrounds()
    fetchAvailableSprites()
    fetchAvailableAudio()
    fetchAvailableElements()
  }, [])

  useEffect(() => {
    console.log("available backgrounds: ", backgrounds)
  }, [backgrounds])
  

  const toggleCharacterPicker = () => {
    setOpenCharacterPicker(!openCharacterPicker)
  }

  const toggleAssetGenerator = () => {
    setOpenAssetGenerator(!openAssetGenerator)
  }

  const toggleBubbleManager = () => {
    setOpenBubbleManager(!openBubbleManager)
  }

  const toggleAudioPicker = () => {
    setOpenAudioPicker(!openAudioPicker)
  }

  const toggleQuestionEditor = () => {
    setOpenQuestionEditor(!openQuestionEditor)
  }

  const toggleSpeechEditor = () => {
    setOpenSpeechEditor(!openSpeechEditor)
  }

  const toggleBackgroundPicker = () => {
    setOpenBackgroundPicker(!openBackgroundPicker)
  }

  const toggleShowScript = () => {
    setShowScript(!showScript)
  }

  const togglePreviewScene = () => {
    setScenePreview(!scenePreview)
  }

  const handleBackgroundChange = (newBackground) => {
    setSelectedBackground(newBackground);
  };

  const handleClick = () => {
    setOpen(!open);
  };

  const generateRandomId = () => {
    return uuidv4().split('-')[0];
  };

  const loadAudioTimelineData = (audioTimelineData) => {
    audioTimelineData.forEach(audioData => {
      console.log("ADDING AUDIO DATA: ", audioData)
      let timelineAudio = {
        id: audioData.id,
        type: 'audio',
        actions: [
          {
            id: audioData.id,
            start: audioData.start,
            end: audioData.end,
            effectId: audioData.effectId,
            data: {
              src: audioData.src,
              name: audioData.name,
              ext: audioData.ext,
              volume: audioData.volume
            },
          }
        ]
      }

      setTimelineData((currentTimeline) => [...currentTimeline, timelineAudio])
      setSelectedAudio((currentAudio) => [...currentAudio, audioData.name]);
    })
  }

  const handleAudioChange = (audio_name, newAudio, volume, ext) => {
    console.log("adding: ", newAudio)
    //const audio_name = newAudio.split("/").pop().slice(0, -4);

    const actionID = generateRandomId()

    var audio = new Audio(newAudio);
            
    audio.addEventListener('loadedmetadata', function() {
        var durationInSeconds = Math.ceil(audio.duration);
        let timelineAudio = {
          id: audio_name + '-' + actionID,
          type: 'audio',
          actions: [
            {
              id: actionID,
              start: 0,
              end: durationInSeconds,
              effectId: 'audioEffect',
              data: {
                src: newAudio,
                ext: ext,
                name: audio_name,
                volume: volume
              },
            }
          ]
        }

        setTimelineData((currentTimeline) => [...currentTimeline, timelineAudio])
        setSelectedAudio((currentAudio) => [...currentAudio, newAudio]);
    }); 
  };

  const handleSpeechChange = (newSpeech, speechName, speechDuration) => {

    const actionID = generateRandomId()

    let timelineAudio = {
      id: speechName + '-' + actionID,
      type: 'audio',
      actions: [
        {
          id: actionID,
          start: 0,
          end: speechDuration,
          effectId: 'speechEffect',
          data: {
            src: newSpeech,
            name: speechName,
            volume: 0.5
          },
        }
      ]
    }

    setTimelineData((currentTimeline) => [...currentTimeline, timelineAudio])

  };

  const handleNewBubble = (bubbleName, text, maxW, fontSize, backgroundType) => {
    const actionID = generateRandomId()
    setBubbles((currentBubbles) => [...currentBubbles, {x: 400, y: -250, bubbleName, text, maxW, fontSize, backgroundType, actionID, renderStatus: false}])
  };
  
  const handleRemoveBubble = (index) => {
    const updatedBubbles = [...bubbles]
    updatedBubbles.splice(index, 1);
    setBubbles(updatedBubbles)
  }

  const updateTimelineBubble = (timelineBubbles, bubbleId, newText, newPosition) => {
    const updatedBubbles = timelineBubbles.map((bubble) => ({ ...bubble }));
  
    const bubbleIndex = updatedBubbles.findIndex(
      (bubble) => bubble.id === bubbleId
    );
  
    if (bubbleIndex !== -1) {
      updatedBubbles[bubbleIndex].actions[0].data.text = newText;
      updatedBubbles[bubbleIndex].actions[0].data.pos = newPosition;
    }
  
    return updatedBubbles;
  }

  const handleBubbleUpdate = (actionID, bubbleName, newPos, newText, index) => {

    const updatedTimelineData = updateTimelineBubble(
      timelineData,
      bubbleName + '-' + actionID,
      newText,
      newPos
    );

    const updatedBubbles = [...bubbles];
    const oldBubble = {...updatedBubbles[index]};
    updatedBubbles[index] = {x: newPos.x, y: newPos.y, bubbleName, text: newText, maxW: oldBubble.maxW, fontSize: oldBubble.fontSize, backgroundType: oldBubble.backgroundType, actionID, renderStatus: false}
    

    setBubbles(updatedBubbles)
    setTimelineData(updatedTimelineData)
  }

  const handleUpdateQuestion = (updatedQuestion) => {
    setQuestion(updatedQuestion);
  };

  const removeTimelineElement = () => {
    console.log(selectedTimelineElement)
    const updatedTimelineData = timelineData.filter(item => item.id !== selectedTimelineElement.id);
    if(selectedTimelineElement.type === "audio"){
      const updatedAudioSelection = selectedAudio.filter(item => item !== selectedTimelineElement.actions[0].data.src);
      setSelectedAudio(updatedAudioSelection)
    } else if (selectedTimelineElement.type === "sprite"){
      console.log("Removing character: ", selectedTimelineElement)
      setCharacterToRemove(selectedTimelineElement)
    }
    setTimelineData(updatedTimelineData)
  }

  const handleFramesUpdate = (updatedFrames) => {
    const timelineSpriteElements = updatedFrames.map(item => item.timelineElement).flat();

    updateTimelineData('sprite', timelineSpriteElements)

    let newFrames = JSON.parse(JSON.stringify(updatedFrames));
    delete newFrames.sprite

    setFrames(newFrames);
  };

  useEffect(() => {
    console.log("SETTING CHARACTER TO REMOVE: ", characterToRemove)
  }, [characterToRemove])

  const updateTimelineData = (type, updatedElements) => {
    const filteredTimelineData = timelineData.filter(item => item.type !== type);
    const updatedTimelineData = [...filteredTimelineData, ...updatedElements];
    setTimelineData(updatedTimelineData)
  };

  const renderListIcon = (icon, title, onClick) => {

    return(
      <Chip icon={icon} label={title} onClick={onClick} variant="outlined" sx={{backgroundColor: 'white'}}/>
    )
  }

  const onTimelineElementClick = (event, param) => {
   console.log('click registered', param)
   setSelectedTimelineElement(param.row)
   setOpenTimelineElementManager(true);
  };

  function updateVolumeById(elementId, newVolume) {  
    setTimelineData((timelineElements) =>
      timelineElements.map((item) => {
        if (item.id === elementId && item.type === 'audio' && item.actions && item.actions.length > 0) {
          const updatedActions = item.actions.map((action) => {
            if (action.data && action.data.id === elementId) {
              const updatedData = { ...action.data, volume: newVolume };
              return { ...action, data: updatedData };
            }
            return action;
          });
          const updatedItem = { ...item, actions: updatedActions };
          return updatedItem;
        }
        return item;
      })
    );
  }
  
  const [isSceneNameFocused, setIsSceneNameFocused] = useState(false);
  //inspired by: https://codesandbox.io/s/editable-field-material-ui-t1sq4?file=/src/index.tsx:809-1265

  const handleClose = (value) => {
    setOpenTimelineElementManager(false);
    setSelectedTimelineElement(value);
  };

  const handleUpdateBackgroundDynamics = (updatedBackgroundDynamics) => {
    console.log("updating background dynamics: ", updatedBackgroundDynamics)
    setSceneBackgroundDynamics(updatedBackgroundDynamics)
    setParticlesOptions(updatedBackgroundDynamics);
  };

  const [isPlayingScene, setIsPlayingScene] = useState(false)

  useEffect(() => {
    console.log("SCENE PLAYING: ", isPlayingScene )
  }, [isPlayingScene])



  return (
    <Stack spacing={2}>
      <AppBar >
        <Toolbar>
        {!isSceneNameFocused ? (
          <Typography
            onClick={() => {
              setIsSceneNameFocused(true);
            }}
            sx={{ flexGrow: 1, color: '#fff'}}
            variant='h4'
          >
            {sceneName}
          </Typography>
         ) : (
          <TextField
          sx={{ flexGrow: 1, color: '#fff' }}
            autoFocus
            value={sceneName}
            onChange={event => setSceneName(event.target.value)}
            onBlur={event => setIsSceneNameFocused(false)}
            InputProps={{
              style: { color: 'white' }, //set color to white
            }}
          />
         )}
         <Stack direction={"row"} spacing={2} >
            <Button variant="outlined" color="inherit" onClick={saveScene}>Save Scene</Button>
            <Button variant="outlined" color="inherit" onClick={previewScene}>Preview Scene</Button>
            <Button variant="outlined" color="inherit" onClick={() => {navigate('/')}}>TO BOARD</Button>
        </Stack>
        </Toolbar>
      </AppBar>
      <Grid container spacing={2}>
      <Grid item>
        <div id="stage" ref={stageRef} 
          style={{ marginTop: '5.5vh', 
                    width: 1080, height: 650, 
                    border: "1px solid #d3d3d3", 
                    backgroundImage: selectedBackground != "" ? `url(${proxyServerURL}/file?path=${encodeURIComponent('../'+selectedBackground)})` : '', 
                    backgroundSize: "100% 100%", 
                    position: 'relative',
                    overflow: 'hidden'                
                  }}>

          {renderParticles ? 
              <Particles options={particlesOptions} 
                         container={containerRef} 
                         init={initialize} 
                         loaded={particlesLoaded}
                         style={{
                          margin: '2.5vh',
                          position: 'absolute',
                          maxWidth: "145vh",
                          maxHeight: "650px",
                         }}/> 
               : <></>}

          {!isPlayingScene ? bubbles.map((bubble, i) => {
                return (<DraggableSVGComponent 
                            key={i} initX={bubble.x} 
                            initY={bubble.y} initText={bubble.text}
                            bubbleName={bubble.bubbleName}
                            maxWidth={bubble.maxW}
                            fontSize={bubble.fontSize}
                            url={bubble.backgroundType['url']}
                            margins={bubble.backgroundType['margin']}
                            actionID={bubble.actionID}
                            bubblesIndex={i}
                            onBubbleUpdate={handleBubbleUpdate}
                            onBubbleDelete={handleRemoveBubble}
                        />)
          }) : bubbles.map((bubble, i) => {
                return <RenderedSVGComponent 
                            key={i} initX={bubble.x} 
                            initY={bubble.y} text={bubble.text}
                            maxWidth={bubble.maxW}
                            fontSize={bubble.fontSize}
                            backgroundInfo={bubble.backgroundType}
                        />
          })}


        </div>
     </Grid>
     <Grid item>
     <MovementEditor 
        characters={sprites}
        elements={elementList}
        stageRef={stageRef} 
        openCharacterPicker={openCharacterPicker}  
        setOpenCharacterPicker={setOpenCharacterPicker}
        frames={frames}
        timeline={spriteTimelineData}
        onFramesUpdate={handleFramesUpdate}
        removedCharacter={characterToRemove}
      />
      </Grid>
      
    </Grid>
      <AudioPicker
        audioList={audioList}
        selectedAudio={selectedAudio}
        onAudioChange={handleAudioChange}
        openAudioPicker={openAudioPicker}
        setOpenAudioPicker={setOpenAudioPicker}
        handleSaveGeneratedAudio={handleSaveGeneratedBackground}
      />
      <SpeechEditor 
          speech={speech} 
          onSpeechChange={handleSpeechChange} 
          openSpeechEditor={openSpeechEditor}
          setOpenSpeechEditor={setOpenSpeechEditor}
        />
      <QuestionEditor
          question={question}
          onUpdate={(updatedQuestion) => handleUpdateQuestion(updatedQuestion)}
          openQuestionEditor={openQuestionEditor}
          setOpenQuestionEditor={setOpenQuestionEditor}
      />

      <BackgroundManager
        backgrounds={backgrounds}
        selectedBackground={selectedBackground}
        onBackgroundChange={handleBackgroundChange}
        openBackgroundManager={openBackgroundPicker}
        setOpenBackgroundManager={setOpenBackgroundPicker}
        handleSaveGeneratedBackground={handleSaveGeneratedBackground}
        particlesOptions={particlesOptions}
        onBackgroundDynamicsUpdate={handleUpdateBackgroundDynamics}
        setParticlesRenderState={setRenderParticles}
      />

      <TimelineElementManager
          selectedElement={selectedTimelineElement}
          open={openTimelineElementManager}
          onClose={handleClose}
          onDeleteElement={removeTimelineElement}
          updateVolumeByID={updateVolumeById}
      />

      <AssetGenerator 
       openAssetGenerator={openAssetGenerator}
       setOpenAssetGenerator={setOpenAssetGenerator}
       reFetchAssets={fetchAllAssets}
      />

      <BubbleManager 
          openBubbleManager={openBubbleManager} 
          setOpenBubbleManager={setOpenBubbleManager}
          onAddBubble={handleNewBubble}
      />

    <TimelinePlayer timelineState={timelineState} autoScrollWhenPlay={true} />
      <Timeline
        scale={5}
        scaleWidth={160}
        startLeft={20}
        autoScroll={true}
        ref={timelineState}
        editorData={timelineData}
        style={{width: "100% "}}
        dragLine={true}
        effects={mockEffect}
        onDoubleClickAction={onTimelineElementClick}
        onChange={(data) => {
          setTimelineData(data);
        }}
        getActionRender={(action, row) => {
          if (action.effectId === 'audioEffect') {
            return <AudioRender action={action} row={row} />;
          } else if (action.effectId === 'spriteEffect') {
            return <SpriteRender action={action} row={row} />;
          } else if (action.effectId === 'speechEffect') {
            return <SpeechRender action={action} row={row} />;
          } 
        }}
      />

    <Drawer
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          boxSizing: 'border-box',
          bottom: 0, // Position at the bottom
          display: 'flex',
          flexDirection: 'row', // Make the drawer horizontal
          justifyContent: 'space-between', // Align items horizontally
          alignItems: 'center', // Align items vertically
          paddingTop: '4rem',
          zIndex: 1000,
        },
      }}
      variant="permanent"
      anchor="right" // Anchor the drawer at the bottom
    >
      <Stack spacing={2}>   
        <Button variant="outlined" startIcon={<DesignServicesIcon />} onClick={toggleAssetGenerator} sx={{backgroundColor: 'white'}}>
          Create Assets
        </Button>

        <Button variant="outlined" startIcon={open ? <ExpandLess /> : <ExpandMore />} onClick={handleClick} sx={{backgroundColor: 'white'}}>
          Add Assets
        </Button>

        <Collapse in={open} timeout="auto" unmountOnExit>
          <Stack spacing={2} sx={{marginTop: '1rem', marginBottom: '1rem'}}>
            {renderListIcon(<WallpaperIcon />, "Add Background", toggleBackgroundPicker)}
            <Divider />
            {renderListIcon(<AndroidIcon />, "Add Character", toggleCharacterPicker)}
            <Divider />
            {renderListIcon(<RecordVoiceOverTwoToneIcon />, "Add Speech", toggleSpeechEditor)}
            <Divider />
            {renderListIcon(<AndroidIcon />, "Add Audio", toggleAudioPicker)}
            <Divider />
            {renderListIcon(<AndroidIcon />, "Add Bubble", toggleBubbleManager)}
            <Divider />
            {renderListIcon(<QuestionAnswerOutlinedIcon />, "Add Interaction", toggleQuestionEditor)}
            <Divider />
          </Stack>
        </Collapse>

        <Button variant="outlined" startIcon={<AutoStoriesIcon />} onClick={toggleShowScript} sx={{backgroundColor: 'white'}}>
          Show Script
        </Button>

        <FormGroup sx={{justifyContent:"center", alignItems:"center", marginLeft: '1rem'}}>
          <FormControlLabel control={<Switch checked={renderParticles} onChange={() => {setRenderParticles(!renderParticles)}} />} label="Particles" />
        </FormGroup>
        
      </Stack>
    </Drawer>

    <Dialog
        open={showScript}
        fullWidth={true}
        onClose={toggleShowScript}
        PaperProps={{
          style: {
            width: '75vw',
            maxWidth: '75vw',
          },
        }}
      >
        <ScreenplayDisplay scenes={Screenplay} setScenes={setScreenplay}/>

      </Dialog>

      <Dialog
        open={scenePreview}
        onClose={togglePreviewScene}
        fullScreen 
        PaperProps={{
          style: {
            margin: 'auto',
            width: '75%',
            maxWidth: 'none',
            backgroundColor: 'rgba(0, 0, 0, 0.5)'
          },
        }}
      >
        <TimelinePreview />
      </Dialog>
      
    </Stack>
  );
}

export default SceneEditor;

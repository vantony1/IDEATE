import React, { memo, useState, useEffect, useRef } from 'react';
import { Handle, useReactFlow, useStoreApi, Position, useEdges } from 'reactflow';
import MusicNoteIcon from '@mui/icons-material/MusicNote';
import QuestionAnswerTwoToneIcon from '@mui/icons-material/QuestionAnswerTwoTone';
import { Divider, Stack, Typography, Box, Avatar, Button, Popover, Paper} from '@mui/material';
import IconButton from '@mui/material/IconButton';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import StarIcon from '@mui/icons-material/Star';
import { useRecoilState, useSetRecoilState, useRecoilValue} from "recoil";
import { startSceneID, storyProgression, storyline } from '../services/state';
import Fab from '@mui/material/Fab';
import EditIcon from '@mui/icons-material/Edit';
import RecordVoiceOverIcon from '@mui/icons-material/RecordVoiceOver';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import BubbleChartIcon from '@mui/icons-material/BubbleChart';

function deepCopy(obj) {
  return JSON.parse(JSON.stringify(obj));
}

function Select({ value, handleId, nodeId, availableEdges, optionIndex, data }) {
  const { setNodes } = useReactFlow();
  const store = useStoreApi();
  const setStorylineState = useSetRecoilState(storyline);

  function updateNextSceneValue(id, optionIndex, nextSceneValue) {

    setStorylineState((oldStoryline) => {
      const updatedStoryline = JSON.parse(JSON.stringify(oldStoryline));
      const scene = updatedStoryline.find((item) => item.id === id);
  
      if (scene && scene.data && scene.data.options && scene.data.options[optionIndex]) {
        scene.data.options[optionIndex].nextScene = nextSceneValue;
      }
  
      return updatedStoryline;
    });
  }


  const [nextScene, setNextScene] = useState(value.nextScene);

  useEffect(() => {
    if(nextScene == -1){
      if(!availableEdges[0]) return;
      setNextScene(availableEdges[0]['target'])
    }

    console.log(availableEdges)
  }, [availableEdges])


  useEffect(() => {
    updateNextSceneValue(nodeId, optionIndex, nextScene)
  }, [nextScene])
  
  const onChange = (evt) => {
    const next = evt.target.value
    const i = evt.target.selectedIndex
    console.log('<CHOICE>: ', next, optionIndex, availableEdges[i])
    setNextScene(next);
  };

  return (
    <div className="custom-node__select">
      <div style={{backgroundColor: 'white', display: 'flex', justifyContent: 'center'}}>{value.option}</div>
      <select className="nodrag" onChange={onChange} value={nextScene}>
        {availableEdges.map((edge, index) => (
          <option key={index} value={edge.target}>
            {edge.targetName}
          </option>
        ))}
      </select>
    </div>
  );
}

function CustomNode({ id, data }) {
  const [connectedEdges, setConnectedEdges] = useState([]);
  const edges = useEdges();
  const { onConnect } = useReactFlow();
  const [showOptions, setShowOptions] = useState(false)
  const [progression, setProgression] = useRecoilState(storyProgression)
  const [story, setStory] = useRecoilState(storyline)
  const [startNodeID, setStartNodeID] = useRecoilState(startSceneID)
  const [anchorEl, setAnchorEl] = useState(null);

  const [fontSize, setFontSize] = useState('1rem'); 
  const labelRef = useRef(null); 

  useEffect(() => {
    const adjustFontSize = () => {
      if (labelRef.current) {
        const maxWidth = labelRef.current.offsetWidth;
        const actualWidth = labelRef.current.scrollWidth;
        if (actualWidth > maxWidth) {
          setFontSize((prevFontSize) => {
            const newSize = parseFloat(prevFontSize) - 0.05;
            return `${newSize}rem`;
          });
        }
      }
    };
    adjustFontSize();
  }, [data.label]);

  useEffect(() => {
    if (anchorEl) {
      const timer = setTimeout(() => {
        setAnchorEl(null);
      }, 5000);
  
      return () => {
        clearTimeout(timer);
      };
    }
  }, [anchorEl]);

  const handleContextMenuClose = () => {
    setAnchorEl(null);
  };
  
  useEffect(() => {
    const filteredEdges = edges.filter(
      (edge) => edge.source === id
    );
    setConnectedEdges(filteredEdges);

  }, [edges, id]);


  const toggleShowOptions = () => {
    setShowOptions(!showOptions)
  }

  const setAsStartNode = () => {
    setStartNodeID(id)
  }

  useEffect(() => {
    console.log("<EDGES>", connectedEdges)
    connectedEdges.forEach(edge => edge.value = "victor")

  }, [connectedEdges])

  const xeroxNode = () => {
    const newSceneId = `scene${story.length + 1}`;
    const newNode = {
      id: newSceneId,
      data: {  ...deepCopy(data) , label: `Scene ${story.length + 1}`},
      position: { x: -50, y: -20 },
      type: 'custom'
    };
    setStory([...story, newNode]);
  }

  const deleteNode = (id) => {
    const updatedStoryline = story.filter((element) => element.id !== id);
    const updatedProgression = progression.filter((element) => (element.target !== id && element.source !== id) )
    setStartNodeID(null)
    setProgression(updatedProgression);
    setStory(updatedStoryline);
  }
  
  const proxyServerURL = 'http://localhost:7053';

  return (
    <div
      style={{
        outline: '2px solid #0A2647', // Outline style
        padding: '15px 15px 35px 15px', // Add some padding around the outline
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center', // Center the contents horizontally
        justifyContent: 'center', // Center the contents vertically
        backgroundImage: `url(${proxyServerURL}/file?path=${encodeURIComponent('../'+data.background)})`, 
        backgroundSize: 'cover', // Resize the background image to cover the entire div
        backgroundRepeat: 'no-repeat', // Prevent the background image from repeating
        backgroundPosition: 'center center', // Center the background image
        position: 'relative', // Add position relative to the main div
        minWidth: '10rem',
        maxWidth: '10rem',
        minHeight: '8rem',
        maxHeight: '8rem'
      }}
    >

    <Box sx={{ backgroundColor: 'white', padding: '10px'}}>
        <Typography variant='h5' ref={labelRef} style={{ fontSize }}>{data.label}</Typography>
    </Box>
    
    <Divider/>
        
    <Stack 
      direction="column"
      justifyContent="center"
      alignItems="center"
      spacing={2}
      style={{
        position: 'absolute', 
        right: '-1.5rem',
        zIndex: 1,
      }}
    >
      <Avatar sx={{ bgcolor: 'white' }}>
        {data.interactions ? <QuestionAnswerTwoToneIcon style={{color: "green"}}/> : <QuestionAnswerTwoToneIcon style={{color: "grey"}}/> }
      </Avatar>
      <Avatar sx={{ bgcolor: 'white' }}>
        {data.hasBubbles ? <BubbleChartIcon style={{color: "green"}}/> : <BubbleChartIcon style={{color: "grey"}}/> }
      </Avatar>
      <Fab 
        color="primary" 
        aria-label="edit" 
        size="small"
        onClick={(event) => setAnchorEl(event.currentTarget)}
      >
        <EditIcon />
      </Fab>
      
      
      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={handleContextMenuClose}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
      >
                <Paper sx={{display: 'flex', flexDirection: 'column', padding: '1rem'}}>
                <Button 
                  sx={{marginBottom: '0.5rem'}}
                  variant="outlined" 
                  size="small" 
                  onClick={xeroxNode}
                >
                    Copy Scene
                </Button>
                <Button 
                  variant="outlined" 
                  size="small" 
                  onClick={() => deleteNode(id)}>
                    Delete Scene
                </Button>
                <Button 
                  variant="outlined" 
                  size="small" 
                  onClick={() => setAsStartNode()}>
                    Set as Start Scene
                </Button>
                </Paper>
        </Popover>


    </Stack>


    <Stack 
      direction="column"
      justifyContent="center"
      alignItems="center"
      spacing={2}
      style={{
        position: 'absolute',
        left: '-1.5rem',
        zIndex: 1,
      }}
    >
      <Avatar sx={{ bgcolor: 'white' }}>
        {data.hasSpeech ? <RecordVoiceOverIcon style={{color: "green"}}/> : <RecordVoiceOverIcon style={{color: "grey"}}/> }
      </Avatar>
      <Avatar sx={{ bgcolor: 'white' }}>
        {data.music ? <MusicNoteIcon style={{color: "green"}}/> : <MusicNoteIcon style={{color: "grey"}}/> }
      </Avatar>
      {startNodeID == id ?
      <Avatar sx={{ bgcolor: 'white' }}>
         <StarIcon style={{color: "#d4af37"}}/> 
      </Avatar>
      : <></> }

      </Stack>

      <IconButton 
        onClick={toggleShowOptions} 
        style={{ 
            backgroundColor: 'white', 
            borderRadius: '50%', 
        }} >
        {showOptions ? <KeyboardArrowUpIcon/> : <ExpandMoreIcon />}
    </IconButton>        

    {showOptions ? 
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {data.options.map((option, index) => (
            <Select
              key={option.option}
              optionIndex={index}
              availableEdges={connectedEdges}
              nodeId={id}
              value={option}
              handleId={id}
              data={data}
            />
          ))}
        </div>
            : <></>
          }
        <Handle
          type="target"
          position={Position.Top}
          id={`${id}-target`}
          onConnect={onConnect}
        />
        <Handle type="source" position={Position.Bottom} id={id} />

      </div>
  );
}

export default memo(CustomNode);
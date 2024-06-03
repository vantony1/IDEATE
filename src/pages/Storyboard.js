import React, { useState, useCallback, useEffect, useRef } from 'react';
import ReactFlow, {
  MiniMap,
  Controls,
  useNodesState,
  useEdgesState,
  MarkerType
} from 'reactflow';
import { useNavigate } from 'react-router-dom';
import { CustomNode, CustomEdge } from '../components';
import { useRecoilState } from 'recoil';
import { currentSceneID, screenplay, storyContent, storyProgression, storyTitle, storyline, firstLoad, startSceneID } from '../services/state';
import { Button,  Stack, Divider, Drawer, TextField, AppBar, Toolbar } from '@mui/material';
import Typography from '@mui/material/Typography';
import axios from 'axios';
import {ScreenplayDisplay} from '../components';
import { v4 as uuidv4 } from 'uuid';
import Joyride from 'react-joyride';
import 'react-toastify/dist/ReactToastify.css';
import { toast } from 'react-toastify';


const nodeTypes = {
  custom: CustomNode,
};

const edgeTypes = {
  sceneEdge: CustomEdge
};


const empty_scene = {
  frames: [],
  speech: "",
  background: "",
  backgroundDynamics: {},
  question: "",
  options: [
    { option: "", response: '', nextScene: -1 }
  ],
  bubble: [],
  timeline: [],
  label: "initial scene",
  interactions: false,
  music: false
}

function deepCopy(obj) {
  return JSON.parse(JSON.stringify(obj));
}
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const generateRandomID = () => {
  const uuid = uuidv4();
  // Take the first 4 characters and remove any hyphens
  const randomID = uuid.substring(0, 4).replace(/-/g, '');
  return randomID;
}

const Storyboard = () => {
  const navigate = useNavigate();
  const edgeUpdateSuccessful = useRef(true);
  const [story, setStory] = useRecoilState(storyline); //initialNodes
  const [screenplayScript, setScreenplayScript] = useRecoilState(screenplay);
  const [content, setContent] = useRecoilState(storyContent)
  const [progression, setProgression] = useRecoilState(storyProgression); 
  const [scene, setScene] = useRecoilState(currentSceneID)
  const [nodes, setNodes, onNodesChange] = useNodesState(story);
  const [edges, setEdges, onEdgesChange] = useEdgesState(progression? progression: []);
  const proxyServerURL = 'http://localhost:7053';
  const [storyName, setStoryName] = useRecoilState(storyTitle)
  const [isStoryNameFocused, setIsStoryNameFocused] = useState(false);
  const [startNodeID, setStartNodeID] = useRecoilState(startSceneID)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const [steps, setSteps] = useState([
    {
      content: <h2>Welcome to the storyboard!</h2>,
      locale: { skip: <strong aria-label="skip">S-K-I-P</strong> },
      placement: 'center',
      target: 'body',
    },
    {
      content: 'You can build your story by creating scenes which are displayed here and edit scenes by double clicking the nodes',
      floaterProps: {
        disableAnimation: true,
      },
      placement: 'auto',
      spotlightPadding: 20,
      target: '.storyboard',
    },
    {
      content: 'You can add scenes using this button.',
      placement: 'bottom',
      target: '.add-scene-button',
      title: 'The toolbar',
    },
    {
      content: 'You can edit the story name and navigate using this Toolbar',
      placement: 'bottom',
      styles: {
        options: {
          width: 300,
        },
      },
      target: '.toolbar-storyboard',
      title: 'The toolbar',
    },
    {
      content: 'Start building your story by first creating the storyline',
      placement: 'left',
      styles: {
        options: {
          width: 300,
        },
      },
      target: '.storyline-button',
      title: 'Click this button!',
    }
  ]);

  const [runWalkthrough, setRunWalkthrough] = useRecoilState(firstLoad)

  const toggleDrawer = (open) => {
    setIsDrawerOpen(open);
  };

  const saveStory = async () => {
    const currentStory = {nodes, edges, startNodeID, screenplayScript, content}
    try {
      axios.post(
        `${proxyServerURL}/save-story`, 
        {currentStory, storyName}
      )
      toast("story saved successfully.")
    } catch (error) {
      console.error('An error occurred while saving the story.', error);
    }
  }

  useEffect(() => {
    setProgression(edges)
  }, [edges])

  useEffect(() => {
    setNodes(story)
  }, [story])

  useEffect(() => {
    if(!progression) return;
    setEdges(progression)
  }, [progression])

  const getLabelById = (id, objects) => {
    for (let object of objects) {
      if (object.id === id && object.data) {
        return object.data.label;
      }
    }
    return null; // Return null if no matching id found
  }

  const onConnect = useCallback(
    (params) => {
      const label = getLabelById(params.target, nodes)
      const newEdge = {
        ...params,
        id: params.source+'-'+params.target,
        targetName: label,
        type: 'sceneEdge',
        data: { value: '...' },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          width: 20,
          height: 20,
          color: '#FF0072',
        },
        style: {
          strokeWidth: 2,
          stroke: '#FF0072',
        }
      };
      setEdges((eds) => [...eds, newEdge]);
    },
    [setEdges]
  );

  const addNode = () => {
    const rID = generateRandomID()
    const newSceneId = `scene-${rID}`;

    const newNode = {
      id: newSceneId,
      data: {  ...deepCopy(empty_scene) , label: `Scene ${story.length + 1}`},
      position: { x: 250, y: 200 },
      type: 'custom'
    };
    setNodes([...nodes, newNode]);
    setStory([...story, newNode]);

    if(!startNodeID) {
      setStartNodeID(newSceneId)
    }
  };

  const handleNodeDoubleClick = (event, node) => {
    console.log('Double-clicked node:', node);
    setScene(node.id)
    navigate('/editor');
  };

  const onNodeDragStop = (event, node) => {
    console.log(`Node ${node.id} position changed to (${node.position.x}, ${node.position.y})`);
    const updatedNodes = nodes.map(n => {
      if (n.id === node.id) {
        return {
          ...n,
          position: node.position
        };
      }
      return n;
    });
  
    setNodes(updatedNodes);
    setStory(updatedNodes)
  };

  const onPreviewStory = () => {
    if(nodes.length <= 0){
      toast.error("No scenes to preview")
      return
    } else if (!startNodeID) {
      toast.error("Please set a start node to preview the story")
      return
    }
    saveStory(); navigate('/storyPreview')
  }

  return (
<div style={{ position: 'relative'}}>
    <Stack direction={"row"} sx={{backgroundColor: 'primary'}}>
      <Joyride
          continuous
          hideCloseButton
          showProgress
          steps={steps}
          showSkipButton
          run={runWalkthrough}

          callback={(data) => {
            const { action } = data;
            if (action === 'close' || action === 'skip' || action === 'stop' || action === 'reset') {
              setRunWalkthrough(false);
            }
          }}
      />
    <AppBar>
      <Toolbar className='toolbar-storyboard'>
      {!isStoryNameFocused ? (
          <Typography
            onClick={() => {
              setIsStoryNameFocused(true);
            }}
            sx={{ flexGrow: 1 }}
            variant='h4'
          >
            Board: {storyName}
          </Typography>
         ) : (
          <TextField
          sx={{ flexGrow: 1 }}
            autoFocus
            value={storyName}
            onChange={event => setStoryName(event.target.value)}
            onBlur={event => setIsStoryNameFocused(false)}
            InputProps={{
              style: { color: 'white' }, 
            }}
          />
         )}

        <Stack direction={"row"} spacing={2} className="home-button">
            <Button variant="outlined" color="inherit" onClick={() => {navigate('/home')}}>TO GALLERY</Button>
        </Stack>
      </Toolbar>
    </AppBar>
    <div style={{ height: '90vh', width: '95%', marginTop: '2rem', backgroundColor: 'white' }}>
    
      <ReactFlow
        className="storyboard"
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeDragStop={onNodeDragStop} 
        onNodeDoubleClick={handleNodeDoubleClick} 
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        >
        
        <MiniMap />
        <Controls />
      </ReactFlow>
      <Stack direction={"row"} spacing={3} justifyContent="center" alignItems="center" className="add-scene">
        <Button variant='contained' onClick={addNode} className='add-scene-button'>Add Scene</Button>
        <Divider orientation="vertical" flexItem />
        <Button variant='outlined' onClick={() => onPreviewStory()}>Preview Story</Button>
        <Button variant='outlined' onClick={() => {saveStory()}}>Save Story</Button>
      </Stack>
    </div>
    <Divider style={{margin: '10px'}} variant="fullWidth" orientation="vertical" flexItem />
    <Button 
        variant="contained" 
        color="primary" 
        onClick={() => toggleDrawer(true)} 
        className="storyline-button"
        style={{
          position: 'absolute',
          top: '35%',
          right: '0rem', 
          borderRadius: '10rem 0 0 10rem',
          height: '20rem',
          width: '10rem'
        }}
      >
        <Typography variant='h5'>Story Content</Typography>
      </Button>
      <Drawer 
        anchor="right" 
        open={isDrawerOpen} 
        onClose={() => toggleDrawer(false)}
      >
         <div style={{ width: '33.33vw', display: 'flex', flexDirection: 'column' }}>
          { !content || content == "" ? <></> :
          <TextField
            disabled
            id="outlined-disabled"
            label="storyline"
            defaultValue={content}
            multiline 
            rows={10}   
            sx={{margin: '1rem', maxWidth: '35rem', backgroundColor: 'white'}}
          />}

          {screenplayScript ? <ScreenplayDisplay scenes={screenplayScript} setScenes={setScreenplayScript} /> : <></>}

          
          <Button variant='outlined' sx={{margin: '1rem', maxWidth: '20rem', backgroundColor: 'white'}} onClick={() => {navigate('/chat')}}>Create Storyline</Button>

        </div>
      </Drawer>
    </Stack>
    </div>
  );
};

export default Storyboard;
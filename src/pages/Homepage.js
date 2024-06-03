import React, { useState, useRef, useEffect} from 'react';
import AppBar from '@mui/material/AppBar';
import Button from '@mui/material/Button';
import CameraIcon from '@mui/icons-material/PhotoCamera';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CssBaseline from '@mui/material/CssBaseline';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import Link from '@mui/material/Link';
import {useDropzone} from 'react-dropzone';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useRecoilState } from 'recoil';
import { storyProgression, storyline, storyTitle, startSceneID, screenplay, storyContent} from '../services/state';

function Copyright() {
  return (
    <Typography variant="body2" color="text.secondary" align="center">
      {'Copyright © '}
      <Link color="inherit" href="https://mui.com/">
      </Link>{' '}
      {new Date().getFullYear()}
      {'.'}
    </Typography>
  );
}

const cards = [1, 2, 3, 4, 5, 6, 7, 8, 9];

function HomePage() {
  const navigate = useNavigate();
  const [stories, setStories] = useState([])
  const [story, setStory] = useRecoilState(storyline);
  const [_, setStoryTitle] = useRecoilState(storyTitle);
  const [screenplayScript, setScreenplayScript] = useRecoilState(screenplay);
  const [content, setContent] = useRecoilState(storyContent)

  const [progression, setProgression] = useRecoilState(storyProgression);
  const [startNodeID, setStartNodeID] = useRecoilState(startSceneID)


  const proxyServerURL = 'http://localhost:7053'

  const fetchAllStories = async () => {
    console.log("FETHC GETHC FGETCH")
    const response = await axios.get(`${proxyServerURL}/get-stories`)
    console.log(response.data)
    setStories(response.data)
  }

  useEffect(() => {
    fetchAllStories()
  }, [])

  const onDrop = (acceptedFiles) => {
    acceptedFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        const fileContent = reader.result;
        console.log(fileContent);
      };
      reader.readAsText(file);
    });
  };

  const {acceptedFiles, getRootProps, getInputProps} = useDropzone({
    accept: 'application/json',
    onDrop,
  });
  
  const loadStory = (i) => {
    setStoryTitle(stories[i].storyName)
    setStory(stories[i].currentStory.nodes)
    setProgression(stories[i].currentStory.edges)
    setStartNodeID(stories[i].currentStory.startNodeID)
    setScreenplayScript(stories[i].currentStory.screenplayScript)
    setContent(stories[i].currentStory.content)
    navigate('/')
  }

  const initStory = (i) => {
    setStoryTitle("Enter Story Name")
    setStory([])
    setProgression([])
    setScreenplayScript([])
    setContent('')
    navigate('/')
  }


  return (
    <div >
      <CssBaseline />
      <AppBar position="relative">
        <Toolbar>
          <CameraIcon sx={{ mr: 2 }} />
          <Typography variant="h6" color="inherit" noWrap>
            IDEATE
          </Typography>
        </Toolbar>
      </AppBar>
      <main>
        {/* Hero unit */}
        <Box
          sx={{
            bgcolor: 'background.paper',
            pt: 8,
            pb: 6,
          }}
        >
          <Container maxWidth="sm">
            <Typography
              component="h1"
              variant="h2"
              align="center"
              color="text.primary"
              gutterBottom
            >
              IDEATE
            </Typography>
            <Typography variant="h5" align="center" color="text.secondary" paragraph>
              Using Diffusion Models to Empower Creators
            </Typography>
            <Stack
              sx={{ pt: 4 }}
              direction="row"
              spacing={2}
              justifyContent="center"
            >
              <Button variant="contained" onClick={() => initStory()}>Create New Story</Button>
              <Button variant="outlined" {...getRootProps({className: 'dropzone'})}>
                <input {...getInputProps()} />
                <p>Load Saved Story</p>
              </Button>
            </Stack>
          </Container>
        </Box>
        <Container sx={{ py: 2 }} maxWidth="md">
          <Typography variant='overline' sx={{fontSize: '2rem', color: 'white', alignSelf: 'center', justifySelf: 'center'}}>Gallery</Typography>
          <Grid container spacing={4}>
            {stories.map((story, index) => (
              <Grid item key={index} xs={12} sm={6} md={4}>
                <Card
                  sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}
                >
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography gutterBottom variant="h5" component="h2">
                      {story.storyName}
                    </Typography>
                  </CardContent>
                  <CardActions>
                    <Button size="small">View</Button>
                    <Button size="small" onClick={() => loadStory(index)}>Edit</Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </main>
      {/* Footer */}
      <Box sx={{ bgcolor: 'background.paper', p: 6 }} component="footer">
        <Typography variant="h6" align="center" gutterBottom>
          work in progress
        </Typography>
        <Typography
          variant="subtitle1"
          align="center"
          color="text.secondary"
          component="p"
        >
          stay tuned for updates
        </Typography>
        <Copyright />
      </Box>
      {/* End footer */}
    </div>
  );
}

export default HomePage;

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const { promisify } = require('util');
const { fileURLToPath } = require('url');

const app = express();
const port = 7053; // Choose the desired port for your proxy server
app.use(cors());
app.use(bodyParser.json({ limit: '10mb' }));

const backgroundsDirectory = '/home/ideate/assets/backgrounds'; // Replace with the actual directory path
const sketchesDirectory = '/home/ideate/assets/sketches'; // Replace with the actual directory path
const elementsDirectory = '/home/ideate/assets/elements'; // Replace with the actual directory path
const audioDirectory = '/home/ideate/assets/audio'; // Replace with the actual directory path

const spritePathPrefix = '/assets/sprites/';


const writeFileAsync = promisify(fs.writeFile);


async function saveImageToBackgrounds(url, filename, retryCount = 0) {
  const maxRetries = 3;
  const retryDelay = 2000; // 2 seconds

  const imagePath = path.join(backgroundsDirectory, filename);
  
  try {
    const response = await axios({
      url,
      responseType: 'stream'
    });

    return new Promise((resolve, reject) => {
      response.data.pipe(fs.createWriteStream(imagePath))
        .on('finish', () => resolve(imagePath))
        .on('error', reject);
    });

  } catch (error) {
    if (error.response && error.response.status === 404 && retryCount < maxRetries) {
      console.log(`URL not found. Retrying in ${retryDelay / 1000} seconds...`);
      await new Promise(resolve => setTimeout(resolve, retryDelay));
      return saveImageToBackgrounds(url, filename, retryCount + 1);
    }

    if (retryCount === maxRetries) {
      throw new Error('Failed after 3 retries.');
    }

    throw error;
  }
}

async function saveImageToSketches(url, filename, retryCount = 0) {
  const maxRetries = 3;
  const retryDelay = 2000; // 2 seconds

  const imagePath = path.join(sketchesDirectory, filename);
  
  try {
    const response = await axios({
      url,
      responseType: 'stream'
    });

    return new Promise((resolve, reject) => {
      response.data.pipe(fs.createWriteStream(imagePath))
        .on('finish', () => resolve(imagePath))
        .on('error', reject);
    });

  } catch (error) {
    if (error.response && error.response.status === 404 && retryCount < maxRetries) {
      console.log(`URL not found. Retrying in ${retryDelay / 1000} seconds...`);
      await new Promise(resolve => setTimeout(resolve, retryDelay));
      return saveImageToSketches(url, filename, retryCount + 1);
    }

    if (retryCount === maxRetries) {
      throw new Error('Failed after 3 retries.');
    }

    throw error;
  }
}


function getBackgrounds(directory, fileExtension, pruneDirectory) {
  const backgrounds = [];
  const files = fs.readdirSync(directory);

  files.forEach(file => {
    const filePath = path.join(directory, file);
    const fileStats = fs.statSync(filePath);

    if (fileStats.isFile() && path.extname(file) === fileExtension) {
      const label = path.basename(file, fileExtension);
      let value = path.join(directory, file);
      if (pruneDirectory) {
        value = value.replace(pruneDirectory, '');
      }
      const ext = fileExtension == '.mp3' ? 'mp3' : fileExtension == '.wav' ? 'wav' : fileExtension
      backgrounds.push({ label, value, ext });
    }
  });

  return backgrounds;
}

// function getBackgrounds(directory, fileExtension) {
//   const backgrounds = [];
//   const files = fs.readdirSync(directory);

//   files.forEach(file => {
//     const filePath = path.join(directory, file);
//     const fileStats = fs.statSync(filePath);

//     if (fileStats.isFile() && path.extname(file) === fileExtension) {
//       const label = path.basename(file, fileExtension);
//       const value = fs.readFileSync(filePath, 'base64'); // Read file and convert to base64
//       const ext = fileExtension == '.mp3' ? 'mp3' : fileExtension == '.wav' ? 'wav' : fileExtension
//       backgrounds.push({ label, value, ext });
//     }
//   });

//   return backgrounds;
// }

function getSpriteList(spriteFolder) {
  const characters = [];
  
  // Read the contents of the sprite folder
  const files = fs.readdirSync(spriteFolder);
  
  for (const file of files) {
    const characterPath = path.join(spriteFolder, file);
    
    // Check if it's a directory
    if (fs.statSync(characterPath).isDirectory()) {
      const character = {
        name: file,
        actions: []
      };
      
      // Read the contents of the character folder
      const actionFolders = fs.readdirSync(characterPath);
      
      for (const actionFolder of actionFolders) {
        const actionPath = path.join(characterPath, actionFolder);
        
        // Check if it's a directory
        if (fs.statSync(actionPath).isDirectory()) {
          const action = {
            characterName: character.name,
            actionName: actionFolder,
            sprites: []
          };
          
          // Read the sprite images in the action folder
          const sprites = fs.readdirSync(actionPath);
          
          for (const sprite of sprites) {
            // Exclude non-image files
            if (sprite.endsWith('.png')) {
              action.sprites.push(spritePathPrefix + character.name + '/' + action.actionName + '/' + sprite);
            }
          }
          
          character.actions.push(action);
        }
      }
      
      characters.push(character);
    }
  }
  
  return characters;
}

app.post('/save-wav-64', async (req, res) => {
  const { base64Wav, name } = req.body;

  // Check if the base64 encoded string and name are provided
  if (!base64Wav || !name) {
    return res.status(400).json({ error: 'Base64 encoded WAV and name not provided in the request body.' });
  }

  try {
    // Convert the base64 encoded string into a Buffer
    const wavBuffer = Buffer.from(base64Wav, 'base64');

    // Create a unique filename for the .wav file
    const filename = `${name}.wav`;
    const filePath = path.join(audioDirectory, filename);

    // Save the .wav file to the specified folder
    fs.promises.writeFile(filePath, wavBuffer) // Changed from writeFileAsync to fs.promises.writeFile which is the built-in async version of writeFile in Node.js

    console.log('File saved successfully:', filename);
    return res.status(200).json({ message: 'File saved successfully.' });
  } catch (error) {
    console.error('Error saving the file:', error.message);
    return res.status(500).json({ error: 'Failed to save the file.' });
  }
});

app.post('/save-wav', async (req, res) => {
  const { url, name } = req.body;

  // Check if the URL and name are provided
  if (!url || !name) {
    return res.status(400).json({ error: 'URL and name not provided in the request body.' });
  }

  try {
    // Download the file from the provided URL
    const response = await axios.get(url, { responseType: 'arraybuffer' });
    const wavBuffer = Buffer.from(response.data);

    // Create a unique filename for the .wav file
    const filename = `${name}.wav`;
    const filePath = path.join(audioDirectory, filename);

    // Save the .wav file to the specified folder
    await writeFileAsync(filePath, wavBuffer);

    console.log('File saved successfully:', filename);
    return res.status(200).json({ message: 'File saved successfully.' });
  } catch (error) {
    console.error('Error saving the file:', error.message);
    return res.status(500).json({ error: 'Failed to save the file.' });
  }
});

app.get('/get-stories', (req, res) => {
  const directory = '/home/ideate/assets/stories';
  fs.readdir(directory, (err, files) => {
    if (err) {
      console.error(err);
      res.status(500).send('Error retrieving stories');
    } else {
      const jsonFiles = files.filter(file => path.extname(file) === '.json');
      const stories = jsonFiles.map(file => {
        const filePath = path.join(directory, file);
        const content = fs.readFileSync(filePath, 'utf-8');
        return JSON.parse(content);
      });
      res.json(stories);
    }
  });
});

app.post('/save-story', (req, res) => {
  const story = req.body;
  const title = req.body.storyName
  const directory = '/home/ideate/assets/stories';
  const filePath = directory + `/${title}.json`;

  fs.writeFile(filePath, JSON.stringify(story), (err) => {
    if (err) {
      console.error(err);
      res.status(500).send('Error saving the story');
    } else {
      res.send('Dictionary saved successfully');
    }
  });
});

app.get('/file', function(req, res) {
  const filePath = req.query.path; // Get the requested file path from the query string
  const absolutePath = path.resolve(__dirname, filePath); // Resolve the absolute file path

  // Send the file
  res.sendFile(absolutePath, function(err) {
    if (err) {
      console.log('Error sending file:', __dirname, err);
    }
  });
});

app.get('/image', (req, res) => {
  const filePath = req.query.path;
  res.sendFile(filePath, function(err) {
    if (err) {
      console.log('Error sending file:', filePath, err);
    }
  });
});

app.post('/save-base64', (req, res) => {
  const base64Image = req.body.image;
  const imageName = req.body.name
  
  // Check if the base64 string is provided
  if (!base64Image) {
    return res.status(400).json({ error: 'Image data not provided in the request body.' });
  }

  const imageBuffer = Buffer.from(base64Image, 'base64');


  // Create a unique filename for the image
  const filename = `${imageName}.png`;
  const imagePath = path.join(elementsDirectory, filename);

  // Save the image to the images folder
  fs.writeFile(imagePath, imageBuffer, (err) => {
    if (err) {
      console.error('Error saving the image:', err);
      return res.status(500).json({ error: 'Failed to save the image.' });
    }

    console.log('Image saved successfully:', filename);
    return res.status(200).json({ message: 'Image uploaded successfully.' });
  });
});

app.post('/save_generated_background', async (req, res) => {
  const { url, filename } = req.body;

  try {
    await saveImageToBackgrounds(url, filename);
    res.status(200).send('Image saved successfully.');
    console.log('Image saved successfully.');
  } catch (error) {
    console.error(error);
    res.status(500).send('An error occurred while saving the image.');
  }
});

app.post('/save_generated_sketch', async (req, res) => {
  const { url, filename } = req.body;

  try {
    await saveImageToSketches(url, filename);
    res.status(200).send('Sketch saved successfully.');
    console.log('Sketch saved successfully.');
  } catch (error) {
    console.error(error);
    res.status(500).send('An error occurred while saving the Sketch.');
  }
});

app.get('/saved_backgrounds', (req, res) => {
  const directory = '/home/ideate/assets/backgrounds'; // Replace with the actual directory path
  const fileExtension = '.png';
  const pruneDirectory = '/home/ideate/';
  const backgrounds = getBackgrounds(directory, fileExtension, pruneDirectory);
  res.json(backgrounds);
});

app.get('/saved_elements', (req, res) => {
  const directory = '/home/ideate/assets/elements'; // Replace with the actual directory path
  const fileExtension = '.png';
  const pruneDirectory = '/home/ideate';
  const png_elements = getBackgrounds(directory, fileExtension, pruneDirectory);
  res.json(png_elements);
});

app.get('/saved_audio', (req, res) => {
  const directory = '/home/ideate/assets/audio';
  const pruneDirectory = '/home/ideate/';
  const mp3 = getBackgrounds(directory, '.mp3', pruneDirectory);
  const wav = getBackgrounds(directory, '.wav', pruneDirectory);
  const audio = mp3.concat(wav)
  res.json(audio);
});

app.get('/get_sprites', (req, res) => {
  const spriteFolder = '/home/ideate/public/assets/sprites';
  const spriteList = getSpriteList(spriteFolder);
  res.json(spriteList);
});

app.post('/api/v3/text2img', async (req, res) => {
    try {
      console.log("sent request stable diffusion")
      const response = await axios.post('https://stablediffusionapi.com/api/v3/text2img', req.body);
      res.send(response.data);
      console.log("recieved response from stable diffusion")
    } catch (error) {
      console.error('Failed to proxy request:', error);
      res.status(500).send('An error occurred while proxying the request');
    }
  });

  app.post('/call_hf_space', async (req, res) => {
    const description = req.body.description;
  
    try {
  
      const hfSpaceUrl = 'https://facebook-musicgen--5phw9.hf.space/';
      const hfSpaceResponse = await axios.post(hfSpaceUrl, {
        'inputData': [description],
        'modelName': '2'  // assuming the model name is '0'
      });

      const result = hfSpaceResponse.data;
      console.log(result?.data);
      res.json(result?.data);
    } catch (error) {
      console.error('Failed to call HF Space:', error);
      res.status(500).send('An error occurred while calling HF Space');
    }
  });

  app.listen(port, () => {
    console.log(`Proxy server is running on port ${port}`);
  });
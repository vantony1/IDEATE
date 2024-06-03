const fs = require('fs');
const util = require('util');
const cors = require('cors');
const express = require('express')

const textToSpeech = require('@google-cloud/text-to-speech');
var bodyParser = require('body-parser')
const tts_server = express()
const port = 5001

const audioDirectory = '/home/ideate/assets/audio';

tts_server.use(cors())
var jsonParser = bodyParser.json()

const client = new textToSpeech.TextToSpeechClient();


tts_server.post('/vocalize', jsonParser, async (req, res) => {
  console.log('received request to vocalize: %s', String(req.body["speech"]));

  const filename = String(req.body["filename"]);
  const request = {
    input: { text: String(req.body["speech"]) },
    voice: { languageCode: 'en-US', name: String(req.body["voiceID"]), ssmlGender: 'NEUTRAL' },
    audioConfig: { audioEncoding: 'MP3', pitch: Number(req.body["pitch"]), speakingRate: Number(req.body["speakingRate"]) },
  };

  try {
    const [response] = await client.synthesizeSpeech(request);

    const audioContentBase64 = response.audioContent.toString('base64');

    // Calculate duration of the speech using rule of thumb: 150 words per minute.
  const words = String(req.body["speech"]).split(' ').length;
  const speechRate = Number(req.body["speakingRate"]);
  const duration = (words / 150) / speechRate;  // in minutes

    return res.send({ audio: audioContentBase64, duration: duration });
  } catch (err) {
    console.error('Error during TTS synthesis:', err);
    return res.status(500).send({ error: 'Error during TTS synthesis.' });
  }
});

tts_server.post('/save-mp3', async (req, res) => {
    console.log('Received request to save MP3');
  
    const base64Audio = String(req.body["audio"]);
    const filename = String(req.body["filename"]);
    const path = audioDirectory;
  
    const audioBuffer = Buffer.from(base64Audio, 'base64');
    const filePath = `${path}/${filename}`;
  
    try {
      await util.promisify(fs.writeFile)(filePath, audioBuffer);
      console.log('MP3 audio saved successfully: ' + filePath);
      return res.send({ message: 'MP3 audio saved successfully' });
    } catch (error) {
      console.error('Error saving MP3 audio: ' + error);
      return res.status(500).send({ error: 'Failed to save MP3 audio' });
    }
});
  

tts_server.listen(port, () => {
  console.log(`tts_server listening on port ${port}`)
})
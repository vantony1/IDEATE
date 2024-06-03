import { atom } from "recoil";
import axios from "axios";
import { v4 as uuidv4 } from 'uuid';

const sessionId = new Date().getTime();

export const storyline = atom({
    key: "storyline",
    default: [
        {
          id: 'Scene 1',
          type: 'custom',
          position: { x: 100, y: 200 },
          data: {
            frames: [],
            speech: "",
            background: "",
            backgroundDynamics: {
              particles: {
                color: {
                  value: '#880808'
                },
                number: {
                  value: 0
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
                fullScreen: {
                  enable: false,
                },
            
              }
            },
            question: "",
            options: [
              { option: "face his fears", response: 'that is correct', nextScene: -1 },
              { option: "run from his fears", response: 'hmmm i think rex will surprise you', nextScene: -1 }
            ],
            questionDuration: 10,
            defaultOptionIndex: 0,
            bubble: [],
            timeline: [],
            label: "initial scene",
            interactions: false,
            music: true
          },
        },
      ],
});

export const storyTitle = atom({
  key: "storyTitle",
  default: "Enter Story Name"
});

export const storyContent = atom({
  key: "storyContent",
  default: ''
});

export const screenplay = atom({
  key: "screenplay",
  default: []
});

export const testValue = atom({
  key: "testValue",
  default: null
});

export const storyProgression = atom({
  key: "storyProgression",
  default: [
    { id: 'e1-2', source: '1', target: '2', type: 'sceneEdge', data: { value: '...' } },
    { id: 'e2-3', source: '2', target: '3', type: 'sceneEdge', data: { value: '...' } }
  ],
})

export const startSceneID = atom({
  key: "startSceneID",
  default: null,
});

export const currentSceneID = atom({
    key: "currentSceneID",
    default: null,
});

export const currentSceneData = atom({
  key: "currentSceneData",
  default: null,
});

export const ttsData = atom({
  key: "ttsData",
  default: "empty",
});

export const ttsDuration = atom({
  key: "ttsDuration",
  default: 5,
});

export const speechBubbles = atom({
  key: "speechBubbles",
  default: [],
});

export const speechProfiles = atom({
  key: "speechProfiles",
  default: [{'name': 'James', 'voiceID' : 'en-US-Standard-A', 'pitch': 1, 'speakingRate': 1.2}],
});

export const clicksState = atom({
  key: 'clicksState',
  default: [],
});

export const imageState = atom({
  key: 'imageState',
  default: null,
});

export const maskImgState = atom({
  key: 'maskImgState',
  default: null,
});

export const imagePath = atom({
  key: 'imagePath',
  default: "../assets/data/dogs.jpg",
});

export const imageEmbedding = atom({
  key: 'imageEmbedding',
  default: "../assets/data/dogs.npy",
});

export const modelDir = atom({
  key: 'modelDir',
  default: "/model/sam_onnx_b.onnx",
});

export const firstLoad = atom({
  key: 'firstLoad',
  default: true,
});

export const chatWalkthrough = atom({
  key: 'chatWalkthrough',
  default: true,
});

export const loggerID = atom({
  key: 'loggerID',
  default: `${sessionId}`,
});


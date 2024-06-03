import { useEffect, useState } from "react";
import { useRecoilState, useRecoilValue } from "recoil";
import "@chatscope/chat-ui-kit-styles/dist/default/styles.min.css";
import {
  MainContainer,
  ChatContainer,
  MessageList,
  Message,
  MessageInput,
  TypingIndicator,
} from "@chatscope/chat-ui-kit-react";
import {
  Typography,
  Button,
  Stack,
  CircularProgress,
  Paper,
  AppBar,
  Toolbar,
  Divider,
} from "@mui/material";
import LinearProgress from "@mui/material/LinearProgress";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogTitle from "@mui/material/DialogTitle";
import TextField from "@mui/material/TextField";
import {
  screenplay,
  storyContent,
  storyTitle,
  chatWalkthrough,
  storyline as storyData,
  loggerID,
} from "../services/state";
import { useNavigate } from "react-router-dom";
import { ScreenplayDisplay, ScreenplayDisplaySkeleton } from "../components";
import "../components/chat.css";
import { v4 as uuidv4 } from "uuid";
import Joyride from "react-joyride";
import "react-toastify/dist/ReactToastify.css";
import { toast } from "react-toastify";
import _ from "lodash";
import axios from "axios";
import { useLogger } from "../services/Logger";

const systemMessage = {
  role: "system",
  content:
    "Speak as if you are collaboratively creating a story with the user. Try to iteratively and collaboratively create the story with the user by asking the user questions that determine story content and progression; Feel free to suggest your own thoughts on what would be good to add",
};

const empty_scene = {
  id: "",
  type: "custom",
  position: { x: 100, y: 200 },
  data: {
    frames: [],
    speech: "",
    background: "",
    backgroundDynamics: {
      particles: {
        color: {
          value: "#880808",
        },
        number: {
          value: 0,
        },
        opacity: {
          value: { min: 1, max: 1 },
        },
        shape: {
          type: "circle",
        },
        size: {
          value: { min: 1, max: 5 },
        },
        move: {
          direction: "bottom-left",
          enable: true,
          speed: { min: 3, max: 5 },
          straight: true,
        },
        fullScreen: {
          enable: false,
        },
      },
    },
    question: "",
    options: [{ option: "", response: "", nextScene: -1 }],
    bubble: [],
    timeline: [],
    label: "initial scene",
    interactions: false,
    music: true,
  },
};

function StorylineCreator() {
  const API_KEY = "ENTER_OPENAI_API_KEY";

  const [messages, setMessages] = useState([
    {
      message:
        "Hello, I'm Leela! What kind of story would you like to start creating today? Please tell me the general idea and I will create a base to work off of",
      sentTime: "just now",
      sender: "ChatGPT",
    },
  ]);

  const navigate = useNavigate();
  const sessionId = useRecoilValue(loggerID);
  const [open, setOpen] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentMessage, setCurrentMessage] = useState(0);
  const [storyline, setStoryline] = useRecoilState(storyContent);
  const [scenes, setScenes] = useRecoilState(screenplay);
  const [nodes, setNodes] = useRecoilState(storyData);
  const storyName = useRecoilValue(storyTitle);
  const [runWalkthrough, setRunWalkthrough] = useRecoilState(chatWalkthrough);
  const logger = useLogger();

  const [progress, setProgress] = useState(0);
  const [buffer, setBuffer] = useState(10);

  const proxyServerURL = "http://localhost:7053";

  const generateRandomID = () => {
    const uuid = uuidv4();
    const randomID = uuid.substring(0, 4).replace(/-/g, "");
    return randomID;
  };

  const [steps, setSteps] = useState([
    {
      content: <h2>Welcome to the storyline creator!</h2>,
      locale: { skip: <strong aria-label="skip">S-K-I-P</strong> },
      placement: "center",
      target: "body",
    },
    {
      content: "You can collaborate with Leela to create a story here",
      floaterProps: {
        disableAnimation: true,
      },
      placement: "auto",
      spotlightPadding: 20,
      target: ".chat-main",
    },
    {
      content: "You can double click on any message to select it as the story",
      floaterProps: {
        disableAnimation: true,
      },
      placement: "auto",
      spotlightPadding: 20,
      target: ".chat-messages",
    },
    {
      content: "You can edit the story directly here",
      floaterProps: {
        disableAnimation: true,
      },
      placement: "auto",
      spotlightPadding: 20,
      target: ".story-editor",
    },
    {
      content:
        "You can then generate a scene-by-scene script for your story by pressing this button",
      floaterProps: {
        disableAnimation: true,
      },
      placement: "auto",
      spotlightPadding: 20,
      target: ".screenplay-button",
    },
  ]);

  useEffect(() => {
    console.log("screenplay set to: ", scenes);
  }, [scenes]);

  const handleSend = async (message) => {
    const newMessage = {
      message,
      direction: "outgoing",
      sender: "user",
    };

    logger.logEvent(
      `storyline_chat_logs_${sessionId}.txt`,
      `sender: user, message: ${message} \n \n`
    );

    const newMessages = [...messages, newMessage];

    setMessages(newMessages);

    setIsTyping(true);
    await processMessageToChatGPT(newMessages);
  };

  async function processMessageToChatGPT(chatMessages) {
    let apiMessages = chatMessages.map((messageObject) => {
      let role = "";
      if (messageObject.sender === "ChatGPT") {
        role = "assistant";
      } else {
        role = "user";
      }
      return { role: role, content: messageObject.message };
    });

    const apiRequestBody = {
      model: "gpt-3.5-turbo",
      messages: [systemMessage, ...apiMessages],
    };

    await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: "Bearer " + API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(apiRequestBody),
    })
      .then((data) => {
        return data.json();
      })
      .then((data) => {
        console.log(data);

        const response_message = data.choices[0].message.content;

        logger.logEvent(
          `storyline_chat_logs_${sessionId}.txt`,
          `sender: chatGPT, message: ${response_message} \n \n`
        );
        setMessages([
          ...chatMessages,
          {
            message: response_message,
            sender: "ChatGPT",
          },
        ]);
        setIsTyping(false);
      });
  }

  async function generateScreenPlay() {
    if (!storyline || storyline == "") {
      toast.warn("please create a storyline first");
      return;
    }

    setScenes([]);
    setProgress(0);
    setProgress(10);
    setIsGenerating(true);
    toast("Generating storyline");
    const screenPlayPrompt =
      "for the storyline provided, provide a screenplay in json format as a list of scenes each in the following format: {'sceneName': '','backgroundDescription': '', 'narration': '','characters':[''],'dialogue':[{'speaker':'','speech':''}]} -- no extra commentary, balance narration 60% and dialogue: 40%, provide each scene a descriptive name. backgroundDescription should have a short, simple descrpition of the background setting of the scene. do not use double quotes: ";
    const apiRequestBody = {
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "you are a creative, imaginative screen writer",
        },
        { role: "user", content: screenPlayPrompt + storyline },
      ],
    };

    await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: "Bearer " + API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(apiRequestBody),
    })
      .then((data) => {
        return data.json();
      })
      .then((data) => {
        toast.success("Script generated");
        const screenplay = extractJSONDataFromString(
          data.choices[0].message.content
        );
        console.log("screenplay: ", screenplay);
        generateStoryboard(screenplay);
        screenplay.map((scene) => console.log(scene));
        setScenes(screenplay);
        setIsGenerating(false);
      });
  }

  const generateStoryboard = async (screenplayData) => {
    console.log("GENERATING STORYBOARD");
    const sceneNum = screenplayData.length;
    for (let i = 0; i < screenplayData.length; i++) {
      const toastId = toast(`creating storyboard scene: ${i + 1}/${sceneNum}`, {
        autoClose: null,
        progress: 1,
      });
      await createNewNode(screenplayData[i], i);
      toast.dismiss(toastId);
      const newProgress = ((i + 1) / screenplayData.length) * 100;
      const newBuffer = newProgress + 10 > 100 ? 100 : newProgress + 10;
      setProgress(newProgress);
      setBuffer(newBuffer);
    }
    toast.success("storyboard generated, you can go build your scenes now");
  };

  const isValidImage = async (url) => {
    try {
      const response = await axios.head(url);
      const contentType = response.headers["content-type"];
      return contentType.startsWith("image/");
    } catch (error) {
      return false;
    }
  };

  const createNewNode = async (scene, index) => {
    const rID = generateRandomID();
    const newSceneId = `scene-${rID}`;

    const sceneLabel = `${index + 1}:${scene.sceneName}`;

    console.log("fetching background");
    let backgroundURL = await fetchGeneratedBackgrounds(
      scene.backgroundDescription +
        ", black and white rough storyboard sketch style"
    );

    while (backgroundURL === undefined || backgroundURL === null) {
      console.log("RE-Fetching background");
      backgroundURL = await fetchGeneratedBackgrounds(
        scene.backgroundDescription +
          ", black and white rough storyboard sketch style"
      );
    }

    const valid = await isValidImage(backgroundURL);
    console.log("saving sketch: ", backgroundURL, valid);

    await handleSaveGeneratedSketch(backgroundURL, newSceneId + "_background");

    const sceneBackground = "assets/sketches/" + newSceneId + "_background.png";

    const newNode = _.cloneDeep(empty_scene);
    newNode.id = newSceneId;
    newNode.data = {
      ...newNode.data,
      background: sceneBackground,
      label: sceneLabel,
    };
    setNodes((currentNodes) => [...currentNodes, newNode]);
  };

  const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  const handleSaveGeneratedSketch = async (url, file) => {
    let filename = file + ".png";
    try {
      await axios.post(`${proxyServerURL}/save_generated_sketch`, {
        url,
        filename,
      });
      console.log("Image saved successfully.");
    } catch (error) {
      console.error("An error occurred while saving the image.", error);
    }
  };

  const fetchGeneratedBackgrounds = async (prompt) => {
    try {
      let response = await axios.post(`${proxyServerURL}/api/v3/text2img`, {
        key: "ENTER_STABLE_DIFFUSION_API_KEY",
        prompt: prompt,
        negative_prompt: "",
        width: "1080",
        height: "720",
        samples: 1,
        num_inference_steps: "20",
        seed: null,
        enhance_prompt: "no",
        guidance_scale: 7.5,
        safety_checker: "no",
        multi_lingual: "no",
        panorama: "no",
        self_attention: "no",
        upscale: "no",
        embeddings_model: "embeddings_model_id",
        webhook: null,
        track_id: null,
      });

      if (response.data.status == "processing") {
        const delayDuration = response.data.eta * 1000 + 4000;
        await delay(delayDuration);
        const data = {
          key: "ENTER_STABLE_DIFFUSION_API_KEY",
        };
        const fetch_url = response.data.fetch_result;
        response = await axios.post(fetch_url, data, {
          headers: {
            "Content-Type": "application/json",
          },
        });
      }
      return response.data.output[0];
    } catch (error) {
      console.error("Failed to fetch generated backgrounds:", error);
    }
  };

  function extractJSONDataFromString(inputString) {
    try {
      const jsonData = JSON.parse(inputString);
      return jsonData;
    } catch (error) {
      console.error("Error parsing JSON data:", error);
      return null;
    }
  }

  const handleClose = () => {
    setOpen(false);
  };

  const handleTextChange = (event) => {
    setStoryline(event.target.value);
  };

  const assignStoryline = () => {
    setStoryline(messages[currentMessage].message);
    setOpen(false);
  };

  return (
    <div>
      <Joyride
        continuous
        hideCloseButton
        showProgress
        steps={steps}
        showSkipButton
        run={runWalkthrough}
        callback={(data) => {
          const { action } = data;
          console.log(action);
          if (
            action === "close" ||
            action === "skip" ||
            action === "stop" ||
            action === "reset"
          ) {
            setRunWalkthrough(false);
          }
        }}
      />

      <Stack spacing={6}>
        <AppBar>
          <Toolbar>
            <Typography sx={{ flexGrow: 1, color: "#fff" }} variant="h4">
              Storyline: {storyName}
            </Typography>

            <Stack direction={"row"} spacing={2}>
              <Button
                variant="outlined"
                color="inherit"
                onClick={() => {
                  navigate("/");
                }}
              >
                TO BOARD
              </Button>
            </Stack>
          </Toolbar>
        </AppBar>

        <Stack
          direction="row"
          justifyContent="space-around"
          alignItems="stretch"
          spacing={2}
        >
          <div className="chat-main">
            <Typography variant="overline" sx={{ fontSize: "2em" }}>
              CHAT
            </Typography>
            <Paper sx={{ height: "40rem", maxWidth: "40rem" }}>
              <MainContainer>
                <ChatContainer>
                  <MessageList
                    scrollBehavior="smooth"
                    typingIndicator={
                      isTyping ? (
                        <TypingIndicator content="Leela is typing" />
                      ) : null
                    }
                  >
                    {messages.map((message, i) => {
                      return (
                        <Message
                          className="chat-messages"
                          key={i}
                          style={{ fontSize: "1.2em" }}
                          model={message}
                          onDoubleClick={() => {
                            setCurrentMessage(i);
                            setOpen(true);
                          }}
                        />
                      );
                    })}
                  </MessageList>
                  <MessageInput
                    attachButton={false}
                    placeholder="Type message here"
                    onSend={handleSend}
                    style={{ fontSize: "1.2em" }}
                  />
                </ChatContainer>
              </MainContainer>
            </Paper>
          </div>

          <Divider orientation="vertical" flexItem />
          <Stack
            sx={{ width: "90vh", padding: "10px", margin: "10px" }}
            direction="column"
            justifyContent="space-between"
            alignItems="stretch"
            spacing={2}
          >
            <Stack sx={{ flex: 1 }}>
              <Typography variant="overline" sx={{ fontSize: "2em" }}>
                STORY{" "}
              </Typography>

              <TextField
                value={storyline}
                onChange={handleTextChange}
                fullWidth
                label="storyline"
                id="storyline"
                multiline // Enable multiline
                rows={10} // Set the number of rows
                sx={{ display: "flex" }}
                className="story-editor"
              />
            </Stack>

            <Stack sx={{ flex: 1 }}>
              <Stack direction="row" spacing={3} justifyContent="space-between">
                <Typography variant="overline" sx={{ fontSize: "2em" }}>
                  SCRIPT{" "}
                </Typography>
                {scenes.length > 0 ? (
                  <Button
                    variant="outlined"
                    size="large"
                    sx={{ maxWidth: "15rem", alignSelf: "center" }}
                    onClick={() => generateScreenPlay()}
                  >
                    regenerate script
                  </Button>
                ) : (
                  <></>
                )}
              </Stack>
              {scenes.length > 0 ? (
                <div>
                  <div style={{ marginBottom: "1.5rem" }}>
                    <Typography
                      variant="body2"
                      color="textSecondary"
                      style={{ marginTop: 10 }}
                      gutterBottom
                    >
                      Storyboard Generation Status: {progress.toFixed(2)}%
                    </Typography>
                    <LinearProgress
                      variant="buffer"
                      value={progress}
                      valueBuffer={buffer}
                      sx={{ height: 10, borderRadius: 5 }}
                    />
                  </div>
                  <ScreenplayDisplay scenes={scenes} setScenes={setScenes} />
                </div>
              ) : isGenerating ? (
                <CircularProgress color="secondary" />
              ) : (
                <>
                  <ScreenplayDisplaySkeleton sceneCount={1} />
                  <Button
                    variant="contained"
                    size="large"
                    sx={{ maxWidth: "15rem", alignSelf: "center" }}
                    onClick={() => generateScreenPlay()}
                    className="screenplay-button"
                  >
                    generate script
                  </Button>
                </>
              )}
            </Stack>
          </Stack>

          <Dialog open={open} onClose={handleClose}>
            <DialogTitle>{"Save message as story?"}</DialogTitle>
            <DialogActions>
              <Button onClick={handleClose}>Cancel</Button>
              <Button onClick={assignStoryline} autoFocus>
                Yes
              </Button>
            </DialogActions>
          </Dialog>
        </Stack>
      </Stack>
    </div>
  );
}

export default StorylineCreator;

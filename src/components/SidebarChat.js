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
import { Box } from "@mui/material";
import { screenplay, storyContent, loggerID } from "../services/state";
import { useNavigate } from "react-router-dom";
import { useLogger } from "../services/Logger";

function SidebardChat() {
  const API_KEY = "ENTER_OPENAI_API_KEY_HERE";

  const systemMessage = {
    role: "system",
    content:
      "our task is to help the user in creating detailed and specific descriptions of a given object/subject based on an initial prompt. The descriptions should be comprehensive and convey all characteristic details. The descriptions should be in clear and concise language, effectively capturing the essence of the subject in less than 30 words. don’t describe what it is, describe how it is",
  };
  const [messages, setMessages] = useState([
    {
      message:
        "hey, Leela here! Let me know if you want me to elaborate on a prompt",
      sentTime: "just now",
      sender: "ChatGPT",
    },
  ]);
  const sessionId = useRecoilValue(loggerID);
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [currentMessage, setCurrentMessage] = useState(0);
  const [storyline, setStoryline] = useRecoilState(storyContent);
  const [scenes, setScenes] = useRecoilState(screenplay);
  const logger = useLogger();

  useEffect(() => {
    console.log("screenplay set to: ", scenes);
  }, [scenes]);
  const handleSend = async (message) => {
    const newMessage = {
      message,
      direction: "outgoing",
      sender: "user",
    };

    const newMessages = [...messages, newMessage];

    setMessages(newMessages);

    logger.logEvent(
      `sd_chat_logs_${sessionId}.txt`,
      `sender: user, message: ${message} \n \n`
    );

    // Initial system message to determine ChatGPT functionality
    // How it responds, how it talks, etc.
    setIsTyping(true);
    await processMessageToChatGPT(newMessages);
  };

  async function processMessageToChatGPT(chatMessages) {
    // messages is an array of messages
    // Format messages for chatGPT API
    // API is expecting objects in format of { role: "user" or "assistant", "content": "message here"}
    // So we need to reformat

    let apiMessages = chatMessages.map((messageObject) => {
      let role = "";
      if (messageObject.sender === "ChatGPT") {
        role = "assistant";
      } else {
        role = "user";
      }
      return { role: role, content: messageObject.message };
    });

    // Get the request body set up with the model we plan to use
    // and the messages which we formatted above. We add a system message in the front to'
    // determine how we want chatGPT to act.
    const apiRequestBody = {
      model: "gpt-3.5-turbo",
      messages: [
        systemMessage, // The system message DEFINES the logic of our chatGPT
        ...apiMessages, // The messages from our chat with ChatGPT
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
        console.log(data);
        setMessages([
          ...chatMessages,
          {
            message: data.choices[0].message.content,
            sender: "ChatGPT",
          },
        ]);
        logger.logEvent(
          `sd_chat_logs_${sessionId}.txt`,
          `sender: chatGPT, message: ${data.choices[0].message.content} \n \n`
        );

        setIsTyping(false);
      });
  }

  return (
    <Box
      sx={{
        position: "relative",
        height: "90vh",
        maxWidth: "30rem",
        display: "flex",
        flexDirection: "row",
      }}
    >
      <MainContainer>
        <ChatContainer>
          <MessageList
            scrollBehavior="smooth"
            typingIndicator={
              isTyping ? <TypingIndicator content="Leela is typing" /> : null
            }
          >
            {messages.map((message, i) => {
              return (
                <Message
                  key={i}
                  style={{ fontSize: "1.2em" }}
                  model={message}
                  onClick={() => {
                    setCurrentMessage(i);
                    setOpen(true);
                  }}
                />
              );
            })}
          </MessageList>
          <MessageInput placeholder="Type message here" onSend={handleSend} />
        </ChatContainer>
      </MainContainer>
    </Box>
  );
}

export default SidebardChat;

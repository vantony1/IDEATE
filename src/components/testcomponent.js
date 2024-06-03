import React, { useEffect, useState, useRef } from 'react';
import TextField from '@mui/material/TextField';
import { Fab } from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';

const DraggableSVGComponent = ({ initX, initY, text, onTextChange, onPosChange }) => {
  const [isDown, setIsDown] = useState(false);
  const [pos, setPos] = useState({ x: initX, y: initY });
  const [screenPos, setScreenPos] = useState({ x: 0, y: 0 });
  const [editing, setEditing] = useState(false);
  
  const onMouseDown = e => {
    if (editing) return; 
    setIsDown(true);
    setScreenPos({ x: e.screenX, y: e.screenY });
  };

  useEffect(() => {
    onPosChange(pos)
  }, [pos])

  const onMouseMove = e => {
    if (!isDown) return;

    const shiftX = e.screenX - screenPos.x;
    const shiftY = e.screenY - screenPos.y;

    setPos({ x: pos.x + shiftX, y: pos.y - shiftY });
    setScreenPos({ x: e.screenX, y: e.screenY });
  };

  const onMouseUp = () => {
    setIsDown(false);
    setScreenPos({ x: 0, y: 0 });
  };

  const handleTextChange = (event) => {
    onTextChange(event.target.value);
  };

  const doubleClickHandler = () => {
    setEditing(!editing);
  }

  return (
    <span
      style={{
        backgroundImage: 'url(https://s3-us-west-2.amazonaws.com/s.cdpn.io/4273/speech-bubble.svg)',
        display: 'inline-block',
        width: 'auto',
        maxWidth: '20%',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat !important',
        margin: '0 auto',
        textAlign: 'center',
        boxSizing: 'content-box',
        height: 'auto',
        minHeight: '12.5%',
        position: 'absolute',
        top: Math.abs(pos.y),
        left: Math.abs(pos.x)
      }}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onDoubleClick={doubleClickHandler}
    >
      <Fab
        color="primary"
        aria-label="edit"
        size="small"
        style={{ position: 'absolute', right: 0, top: 0 }} 
        onClick={() => console.log('saving position now')}
      >
        <SaveIcon />
      </Fab>
      {editing ? (
        <input
          style={{ fontSize: 'large', margin: '30px 40px 100px 40px' }}
          autoFocus
          value={text}
          onChange={handleTextChange}
          onBlur={() => setEditing(false)}
        />
      ) : (
        <div style={{ margin: '30px 40px 100px 40px', fontSize: 'large' }}>
          {text}
        </div>
      )}
    </span>
  );
};

const TestingBubble = () => {
  const stageRef = useRef(null)
  const [text, setText] = useState("I can put in anything here and it will look good!");
  const [bubblePos, setBubblePos] = useState({x: 729, y: -257})
  
  useEffect(() => {
    console.log("new bubble pos: ", bubblePos)
  }, [bubblePos])
  
  const handleTextChange = (event) => {
    setText(event.target.value);
  };

  const onTextChange = (newText) => {
    setText(newText)
  }
  
  return(
    <div>
      <h2>React Drag example</h2>

      <div id="stage" ref={stageRef} 
            style={{ marginTop: '5.5vh', 
                      width: 1080, height: 650, 
                      border: "1px solid #d3d3d3", 
                      backgroundSize: "100% 100%", 
                      position: 'relative'
                  }}>
          <DraggableSVGComponent initX={729} initY={-257} text={text} onTextChange={onTextChange} onPosChange={setBubblePos}/>

      </div>

      <TextField
        id="outlined-basic"
        label="Outlined"
        variant="outlined"
        value={text}
        onChange={handleTextChange}
      />
    </div>
  );
};

export default TestingBubble;
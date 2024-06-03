import React, { useEffect, useState, useRef} from 'react';
import { Button, Popover, Stack } from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';

export const DraggableSVGComponent = ({ initX, initY, initText, maxWidth, fontSize, url, margins, actionID, bubbleName, bubblesIndex, onBubbleUpdate, onBubbleDelete }) => {
  const [isDown, setIsDown] = useState(false);
  const [pos, setPos] = useState({ x: initX, y: initY });
  const [screenPos, setScreenPos] = useState({ x: 0, y: 0 });
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(initText)
  const [anchorEl, setAnchorEl] = useState(null);
  const spanRef = useRef(null); 


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

  
  const onMouseDown = e => {
    if (editing) return;
    setIsDown(true);
    setScreenPos({ x: e.screenX, y: e.screenY });
  };

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

  const onMouseLeave =  (event) => {
    setAnchorEl(event.target);
  }

  const handleTextChange = (event) => {
    setText(event.target.value);
  };

  const doubleClickHandler = () => {
    setEditing(!editing);
  }

  const onUpdate = () => {
    onBubbleUpdate(actionID, bubbleName, pos, text, bubblesIndex)
  }

  const onDelete = () => {
    onBubbleDelete(bubblesIndex)
  }

  const handleContextMenuClose = () => {
    setAnchorEl(null);
  };

  return (
    <span
      style={{
        backgroundImage: url,
        display: 'inline-block',
        width: 'auto',
        maxWidth: maxWidth,
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
      onMouseLeave={onMouseLeave}
    >
      
      {editing ? (
        <input
          style={{ fontSize: 'large', margin: '30px 40px 100px 40px', fontFamily: 'Verdana' }}
          autoFocus
          value={text}
          onChange={handleTextChange}
          onBlur={() => setEditing(false)}
        />
      ) : (
        <div style={{ margin: margins, fontSize: fontSize, fontFamily: 'Verdana' }}>
          {text}
        </div>
      )}

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
        <Stack>
          <Button size="small" variant="outlined" 
              style={{ 
                  margin: '0.5rem',
                }} 
              onClick={onUpdate}>
               Save Location
          </Button>

          <Button size="small" variant="outlined" 
              style={{ 
                  margin: '0.5rem',
                }} 
              onClick={onDelete}>
               Delete
          </Button>
        </Stack>
      </Popover>


    </span>
  );
};


export const RenderedSVGComponent = ({ initX, initY, text, maxWidth, fontSize, backgroundInfo }) => {
    const [width, setWidth] = useState(maxWidth)
    const [fontSpec, setFontSpec] = useState(fontSize)

    useEffect(() => {
        setWidth(maxWidth)
    }, [maxWidth])

    useEffect(() => {
        console.log("font size; ", fontSpec)
        setFontSpec(fontSize)
    }, [fontSize])

    return (
      <span
        style={{
          backgroundImage: backgroundInfo['url'],
          display: 'inline-block',
          width: 'auto',
          maxWidth: width,
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat !important',
          margin: '0 auto',
          textAlign: 'center',
          boxSizing: 'content-box',
          height: 'auto',
          minHeight: '12.5%',
          position: 'absolute',
          top: Math.abs(initY),
          left: Math.abs(initX)
        }}
      >
        <div style={{ margin: backgroundInfo['margin'], fontSize: fontSpec }}>
          {text}
        </div>
      </span>
    );
};
import { Timeline, TimelineState } from '@xzdarcy/react-timeline-editor';
import { Switch } from 'antd';
import { cloneDeep } from 'lodash';
import React, { useRef, useState } from 'react';
import { AudioRender, SpriteRender } from './custom';
import './index.less';
import { mockData, mockEffect, scale, scaleWidth, startLeft } from './mock';
import TimelinePlayer from './player';

const defaultEditorData = cloneDeep(mockData);

const TimelineEditor = () => {
  const [data, setData] = useState(defaultEditorData);
  const timelineState = useRef();
  const playerPanel = useRef();
  const autoScrollWhenPlay = useRef(true);

  return (
    <div className="timeline-editor-engine">
      <div className="player-panel" id="player-ground-1" ref={playerPanel} />
      <TimelinePlayer timelineState={timelineState} autoScrollWhenPlay={true} />
      <Timeline
        scale={scale}
        scaleWidth={scaleWidth}
        startLeft={startLeft}
        autoScroll={true}
        ref={timelineState}
        editorData={data}
        style={{width: "100% "}}
        effects={mockEffect}
        onChange={(data) => {
          setData(data);
        }}
        getActionRender={(action, row) => {
          if (action.effectId === 'effect0') {
            return <AudioRender action={action} row={row} />;
          } else if (action.effectId === 'effect1') {
            return <SpriteRender action={action} row={row} />;
          }
        }}
      />
    </div>
  );
};

export default TimelineEditor;
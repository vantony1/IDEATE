import React, { useEffect } from 'react';
import { BaseEdge, EdgeLabelRenderer, EdgeProps, getBezierPath } from 'reactflow';
import { useRecoilState } from "recoil";
import { storyProgression, storyline } from '../services/state';

import './buttonedge.css';

const onEdgeClick = (evt, id) => {
  evt.stopPropagation();
  alert(`remove ${id}`);
};

export default function CustomEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data = {value: '...'},
  style = {},
  markerEnd,
}) {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const [progression, setProgression] = useRecoilState(storyProgression)
  const [story, setStory] = useRecoilState(storyline)


  useEffect(() => {
    console.log("<EDGE DATA>: ", data)
  }, [data.value])

  const handleSceneProgressionUpdate = (id) => {
    const oldEdge = progression.filter((element) => (element.id === id))[0]
    const sourceNode = story.filter((node) => node.id === oldEdge.source);  
    const newNode = JSON.parse(JSON.stringify(sourceNode[0]));
  
    const modifiedOptions = newNode.data.options.map((option) =>
      option.nextScene === oldEdge.target
        ? { ...option, nextScene: -1 }
        : option
    );
  
    const modifiedNode = {
      ...newNode,
      data: {
        ...newNode.data,
        options: modifiedOptions,
      },
    };
  
    const newNodes = story.filter((node) => node.id !== oldEdge.source);
    setStory([...newNodes, modifiedNode]);
  };

  const deleteEdge = (id) => {
    const updatedProgression = progression.filter((element) => (element.id !== id))
    handleSceneProgressionUpdate(id)
    setProgression(updatedProgression)
  };

  return (
    <>
      <BaseEdge path={edgePath} markerEnd={markerEnd} style={style} />
      <EdgeLabelRenderer>
        <div
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            fontSize: 12,
            pointerEvents: 'all',
          }}
          className="nodrag nopan"
        >
          <button className="edgebutton" onClick={() => deleteEdge(id)}>
            x {/* Use the value prop instead of 'x' */}
          </button>
        </div>
      </EdgeLabelRenderer>
    </>
  );
}

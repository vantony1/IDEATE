import React from 'react';
import ReactFlow, { addEdge, removeElements } from 'react-flow-renderer';
import CustomNode from '../components/CustomNode';

const TestFlow = () => {
  const initialElements = [
    {
      id: '1',
      type: 'custom',
      data: {
        label: 'Node 1',
        variable1: true,
        variable2: false,
      },
      position: { x: 100, y: 100 },
    },
  ];

  const onConnect = (params) => console.log('onConnect', params);
  const onElementsRemove = (elementsToRemove) =>
    console.log('onElementsRemove', elementsToRemove);

  const elements = initialElements.map((el) => ({
    ...el,
    type: 'custom',
    data: { ...el.data },
  }));

  const nodeTypes = {
    custom: CustomNode,
  };

  return (
    <div style={{ height: '600px' }}>
      <ReactFlow
        elements={elements}
        nodeTypes={nodeTypes}
        onConnect={onConnect}
        onElementsRemove={onElementsRemove}
      />
    </div>
  );
};

export default TestFlow;

import audioControl from './audioControl';
import spriteControl from './spriteControl';
import bubbleControl from './bubbleControl';

export const scaleWidth = 160;
export const scale = 5;
export const startLeft = 20;


export const mockEffect = {
  bubbleEffect: {
    id: 'bubbleEffect',
    name: 'bubble-player',
    source: {
      start: ({ action, engine, isPlaying, time }) => {
        if (isPlaying) {
          const id = (action).id;
          const toggleRender = (action).data.toggleRender
          bubbleControl.start({ id, toggleRender });
        }
      },
      enter: ({ action, engine, isPlaying, time }) => {
        if (isPlaying) {
          const id = (action).id;
          const toggleRender = (action).data.toggleRender
          bubbleControl.start({ id, toggleRender });
        }
      },
      leave: ({ action, engine }) => {
        const id = (action).id;
        const toggleRender = (action).data.toggleRender
        bubbleControl.stop({ id, toggleRender });
      },
      stop: ({ action, engine }) => {
        const id = (action).id;
        const toggleRender = (action).data.toggleRender
        bubbleControl.stop({ id, toggleRender });
      },
    },
  },
  audioEffect: {
    id: 'audioEffect',
    name: 'audio-player',
    source: {
      start: ({ action, engine, isPlaying, time }) => {
        if (isPlaying) {
          const src = (action).data.src;
          const volume = (action).data.volume
          const aud_id = (action).id
          const ext = (action).data.ext
          audioControl.start({ id: aud_id, src, startTime: action.start, engine, time, volume, ext });
        }
      },
      enter: ({ action, engine, isPlaying, time }) => {
        if (isPlaying) {
          const src = (action).data.src;
          const volume = (action).data.volume
          const aud_id = (action).id
          const ext = (action).data.ext
          audioControl.start({ id: aud_id, src, startTime: action.start, engine, time, volume, ext });
        }
      },
      leave: ({ action, engine }) => {
        const src = (action).data.src;
        const aud_id = (action).id
        audioControl.stop({ id: aud_id, engine });
      },
      stop: ({ action, engine }) => {
        const src = (action).data.src;
        const aud_id = (action).id
        audioControl.stop({ id: aud_id, engine });
      },
    },
  },
  speechEffect: {
    id: 'speechEffect',
    name: 'speech-player',
    source: {
      start: ({ action, engine, isPlaying, time }) => {
        if (isPlaying) {
          const src = (action).data.src;
          audioControl.start({ id: src, src, startTime: action.start, engine, time, loop: false });
        }
      },
      enter: ({ action, engine, isPlaying, time }) => {
        if (isPlaying) {
          const src = (action).data.src;
          audioControl.start({ id: src, src, startTime: action.start, engine, time, loop: false  });
        }
      },
      leave: ({ action, engine }) => {
        const src = (action).data.src;
        audioControl.stop({ id: src, engine });
      },
      stop: ({ action, engine }) => {
        const src = (action).data.src;
        audioControl.stop({ id: src, engine });
      },
    },
  },
  spriteEffect: {
    id: 'spriteEffect',
    name: 'sprite-animator',
    source: {
      enter: ({ action, time }) => {
        const src = (action).data.src;
        spriteControl.enter({ id: src, 
          startTime: action.start, 
          endTime: action.end, 
          time, 
          sprite: action.data.sprite, 
          startState: action.startState, 
          endState: action.endState 
        });
      },
      update: ({ action, time }) => {
        const src = (action).data.src;
        spriteControl.update({ id: src, 
          startTime: action.start, 
          endTime: action.end, 
          startState: action.startState, 
          endState: action.endState,
          sprites: action.data.sprites,
          type: action.data.type,
          time 
        });
      },
      leave: ({ action, time }) => {
        const src = (action).data.src;
        spriteControl.leave({ id: src, 
          startTime: action.start, 
          endTime: action.end, 
          startState: action.startState, 
          time });
      },
    },
  },
};

export const mockData = [
    {
      id: '0',
      actions: [
        {
          id: 'action3',
          start: 2,
          end: 4,
          effectId: 'effect0',
          data: {
            src: '/assets/audio/1.mp3',
            name: 'audio test',
          },
        },
      ],
    },
  ];

export const oldmockData = [
  {
    id: '0',
    type: 'sprite',
    actions: [
      {
        id: 'action0',
        start: 9.5,
        end: 16,
        effectId: 'effect1',
        data: {
          src: '/lottie/lottie1/data.json',
          name: '点赞',
        },
      },
    ],
  },
  {
    id: '1',
    type: 'sprite',
    actions: [
      {
        id: 'action1',
        start: 5,
        end: 9.5,
        effectId: 'effect1',
        data: {
          src: '/lottie/lottie2/data.json',
          name: '工作',
        },
      },
    ],
  },
  {
    id: '2',
    type: 'audio',
    actions: [
      {
        id: 'action2',
        start: 0,
        end: 5,
        effectId: 'effect1',
        data: {
          src: '/lottie/lottie3/data.json',
          name: '奶牛',
        },
      },
    ],
  },
  {
    id: '3',
    type: 'audio',
    actions: [
      {
        id: 'action3',
        start: 0,
        end: 20,
        effectId: 'effect0',
        data: {
          src: '/assets/audio/1.mp3',
          name: '背景音乐',
        },
      },
    ],
  },
];
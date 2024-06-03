# ID.8: Integrated Authoring System for Visual Story Creation

Welcome to ID.8 (ideate), a prototype, open-source platform designed to support the creation of visual stories through the power of generative AI. This system simplifies the storytelling process, allowing users to collaborate with AI to co-write scripts, generate visuals, and synthesize audio for immersive storytelling experiences.

We are open-sourcing this system to enable further scientific exploration of human-AI co-creation in a multi-modal creative process that is visual story creation. We hope that further work on ID.8 may lead to more successful human-AI collaboration strategies and design.

Please see our pre-print [here](https://arxiv.org/pdf/2309.14228.pdf)

## System Overview

ID.8 integrates several advanced AI models to assist users in creating complex, interactive visual narratives. The workflow involves multiple stages:

1. **Story Development**: Begin by interacting with a GPT-3.5 model to develop your story's initial concept and script.
2. **Storyboarding**: Translate your script into a visual storyboard that outlines the sequence of your narrative.
3. **Scene Creation**: Use our custom Scene Editor to refine scenes and integrate generated assets such as characters, backgrounds, and audio.

## Getting Started

Before you can use ID.8, you need API access keys for the following services, placed in the specified project directories:

- **OpenAI**: `/src/components/VisualsGenerator`, `SidebarChat`, `/src/Pages/StorylineCreator`
- **Google Cloud**: `/src/tts_creds`, `/servers/tts_creds` for Text-to-Speech services
- **Hugging Face**: `/servers/hf_audiocraft` for advanced audio generation
- **Stable Diffusion API**: This API is crucial for generating high-quality visual assets directly from textual descriptions. Learn more [here](https://stablediffusionapi.com/).

You also need to download segment anything model checkpoints from [this github](https://github.com/facebookresearch/segment-anything) and save them to `/servers/segment-anything` folder

## Installation

To set up ID.8, follow these steps:

1. Clone the repository to your local machine.
2. Install the required dependencies by running `npm install` in the project root.
3. Place your API keys in the designated directories.
4. Start the development server using `npm start`. Navigate to `localhost:3000` in your web browser to access IDEATE.

## Contributing

We welcome contributions from the community. Whether it's fixing bugs, adding features, or improving documentation, please feel free to make a pull request.

Please note that this is a prototype platform meant to support further work towards better understanding human-AI co-creation and there may be unknown bugs/issues, please feel free to ask questions and we will try our best to resolve them for you.

## License

IDEATE is released under the MIT license. For more details, see the LICENSE file in the repository.

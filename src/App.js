import { SceneEditor, Storyboard, StorylineCreator, HomePage } from "./pages";
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { BrowserRouter, Route, Routes} from 'react-router-dom';
import TimelinePreview from "./components/TimelinePreview";
import StoryPreview from "./components/StoryPreview";
import { useEffect } from "react";
import TestingBubble from "./components/testcomponent";
import Segmenter from "./components/Segmenter";
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify';


const theme = createTheme({
  palette: {
    primary: {
      main: '#1C3879',
    },
    secondary: {
      main: '#607EAA',
    },
    background: {
      default: '#132653',
      paper: '#E9F1F7',
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <BrowserRouter>
            <Routes>
                <Route path="/home" element={<HomePage />} />
                <Route path="/" element={<Storyboard />} />
                <Route path="/editor" element={<SceneEditor />} />
                <Route path="/chat" element={<StorylineCreator />} />
                <Route path="/storyPreview" element={<StoryPreview />} />
                <Route path="/preview" element={<TimelinePreview />} />
                <Route path="/test" element={<Segmenter />} />
            </Routes>
        </BrowserRouter>
        <ToastContainer
          position="bottom-left"
          autoClose={2000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
      </ThemeProvider>
  );
}

export default App;

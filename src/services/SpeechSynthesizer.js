import axios from "axios"
import { useRecoilState, useSetRecoilState } from "recoil"
import { ttsData, ttsDuration } from "./state"
import { useRef } from "react"

export const useSpeechSynthesizer = () => {

    const [TTSData, setTTSData] = useRecoilState(ttsData);
    const [_, setTTSDuration] = useRecoilState(ttsDuration);
    const vocalsRef = useRef(null); 

    const say = async (speech, pitch=1.0, speakingRate=1.0, voiceID='en-US-Standard-A', movement="normal") => {
        
        const vocalize = {
        "speech" : speech,
        "pitch": pitch,
        "speakingRate": speakingRate,
        "voiceID": voiceID
        }
	
	  const speechData = await axios.post('http://localhost:5001/vocalize', vocalize)

    console.log(speechData.data)
    
    setTTSData("data:audio/mpeg;base64,"+speechData.data.audio)
    

        return new Promise(res=>{

            const vocalized = "data:audio/mpeg;base64,"+speechData.data.audio;
            vocalsRef.current = new Audio(vocalized);

            vocalsRef.current.onloadstart = () => {
                console.log("load start")
            }

            vocalsRef.current.onloadedmetadata = () => {
              setTTSDuration(vocalsRef.current.duration);
          };

            vocalsRef.current.load()
            vocalsRef.current.play() 
            vocalsRef.current.onended = res
      })
        
        
    }

    const stop = () => {
      if (vocalsRef.current) {
        vocalsRef.current.pause();
        vocalsRef.current.currentTime = 0; // optional, to start from beginning next time
      }
    };

    const saveFile = async (filename) => {
      const savingSpecs = {
        "audio" : TTSData,
        "filename": filename
        }

        await axios.post('http://localhost:5001/save-mp3', savingSpecs).then((res) => {return res})
    }

    return {
      say, saveFile, stop
    };
}
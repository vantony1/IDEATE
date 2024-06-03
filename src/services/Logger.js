import axios from "axios"
import { useRecoilState } from "recoil"
import { loggerID } from "./state"

export const useLogger = () => {

    const logEvent = (logFileName, logContent) => {
      axios.post('http://localhost:5005/appendLog', {
      logFileName: logFileName,
      log: logContent
      })
      .then(response => {
        console.log('Log appended successfully:', response.data);
      })
      .catch(error => {
        console.error('Error appending log:', error.response.data);
      });
    } 

    return {
      logEvent
    };
}

import { useEffect, useState } from "react";
import fs from 'fs'
import path from "path"
import * as child_process from 'child_process'

function padTo2Digits(num: number) {
    return num.toString().padStart(2, '0');
}

export function convertMsToTime(milliseconds: number) {
    let seconds = Math.floor(milliseconds / 1000);
    let minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
  
    seconds = seconds % 60;
    minutes = minutes % 60;
  
    return {
      time: `${padTo2Digits(hours)}:${padTo2Digits(minutes)}:${padTo2Digits(seconds)}`,
      hours: hours,
      minutes: minutes,
      seconds: seconds
    };
}

export function useIsTabVisible() {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    document.addEventListener('visibilitychange', () => {
      setIsVisible(!document.hidden)
    })

    return () => {
      document.removeEventListener('visibilitychange', () => {
        setIsVisible(!document.hidden)
      })
    }
  }, [])

  return isVisible
}

import React, { useCallback, useEffect, useState } from 'react';
import './App.css';

const initialGain = 0.5;
const maxGainValue = 1;

function App(this: any) {
  const [gain, setGain] = useState<number | null>(null);

  const makeNoise = useCallback(() => {
      (window as any).electron.sendMessage({
        type: 'emit-sound',
        value: {
          gain: initialGain
        }
      });
      document.querySelector('output')!.innerHTML = String(initialGain);
  }, []);

  const stopSound = useCallback(() => {
      (window as any).electron.sendMessage({
        type: 'stop-sound',
        value: {
          gain: 0
        },
      });
      document.querySelector('output')!.innerHTML = '0';
  }, []);

  const maxGain = useCallback(() => {
    (window as any).electron.sendMessage({
      type: 'max-gain',
      value: {
        gain: maxGainValue
      },
    });
    document.querySelector('output')!.innerHTML = String(maxGainValue);
  }, []);
  
  const gainVolume = useCallback(() => {
    const i = document.querySelector('input')!;
    let step = 0.1;
    if (Number(i.value) < 0.2){
      step = 0.01;
    }
    i.setAttribute('step', String(step));
    setGain(Number(i.value));
    (window as any).electron.sendMessage({
      type: 'gain-volume',
      value: {
        gain: Number(i.value)
      },
    });
    document.querySelector('output')!.innerHTML = i.value;
  }, [setGain]);

  useEffect(() => {
    document.querySelector('input')!.focus();

    document.getElementById('muteButton')!
      .addEventListener('click', stopSound);

    return () => {
      document.removeEventListener('click', stopSound);
    };
  }, [stopSound, maxGain, makeNoise, gainVolume]);

  function handleKeypress(event: React.KeyboardEvent<HTMLInputElement>) {
      if (event.key === 'a') {
        makeNoise();
      } else if (event.key === 's'){
        stopSound();
      } else if (event.key === 'w'){
        maxGain();
      } else if (event.key === 'ArrowUp'){
        gainVolume();
      } else if (event.key === 'ArrowDown'){
        gainVolume();
      }
   }

  useEffect(() => {
    (window as any).electron.onUpdate((_e: unknown, messageData: any) => {
      if (messageData.type === 'update') {
        setGain(messageData.value.gain);
      }
    });
  }, [gainVolume]);

  return (
    <div className='App'>
      <h1>elementary-volume</h1>
      <input autoFocus id='gainVolume2' min='0' max='1' step='0.1' value={String(gain)} type='range' onKeyPress={event => handleKeypress(event)} onChange={gainVolume}/>
      <p><output>{initialGain}</output></p>
      <button id='muteButton' onClick={stopSound}>MUTE</button>
    </div>
  );
}

export default App;

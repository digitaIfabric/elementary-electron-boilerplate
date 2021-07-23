import MessageData from '../types/MessageData';
import EmitSoundEvent from '../types/EmitSoundEvent';
const el: any = require('@nick-thompson/elementary');
const core = require('elementary-core');

process.on("message",  (rawMessage: MessageData) => {
  switch (rawMessage.type) {
    case "emit-sound":
      emitSound(rawMessage.value as EmitSoundEvent);
      break;
    case "stop-sound":
      stopSound(rawMessage.value as EmitSoundEvent);
      break;
    case "gain-volume":
      changeGain(rawMessage.value as EmitSoundEvent);
      break;
    case "max-gain":
      changeGain(rawMessage.value as EmitSoundEvent);
      break;
  }
});

const initialGain = 0.5;

const b4 = 493.88 * 0.5;
const e4 = 329.63 * 0.5;
const a4 = 440 * 0.5;
const g4 = 391.99 * 0.5;

const s1 = [e4, g4, b4, a4];
const s2 = [e4, g4, b4, a4].map(x => x * 0.999);

function voice(fq: any) {
  return el.cycle(
    el.add(
      fq,
      el.mul(
        el.mul(el.add(16, el.cycle(0.1)), el.mul(fq, 3.17)),
        el.cycle(fq),
      ),
    ),
  );
}

function modulate(x: any, rate: number, amount: number) {
  return el.add(x, el.mul(amount, el.cycle(rate)));
}

core.on("load", () => {
  console.log("elementary Core Loaded");
  renderTone(initialGain);
});

function emitSound(event: EmitSoundEvent) {
  renderTone(event.gain);
  process.send!(new MessageData('update', event));
}

function changeGain(event: EmitSoundEvent) {
  renderTone(event.gain);
  process.send!(new MessageData('update', event));
}

function stopSound(event: EmitSoundEvent) {
  renderTone(event.gain);
  process.send!(new MessageData('update', event));
}

function renderTone(gain: number) {
  let gate = el.train(4);

  let env = el.adsr(0.004, 0.01, 0.2, 0.5, gate);

  let left = el.mul(env, voice(el.seq({seq: s1, hold: true}, gate)));
  let right = el.mul(env, voice(el.seq({seq: s2, hold: true}, gate)));

  let filteredLeft = el.lowpass(modulate(1000, 1, 400), 1.4, left);
  let filteredRight= el.lowpass(modulate(1000, 1, 400), 1.4, right);
  let delayedLeft = el.delay({size: 44100}, el.ms2samps(375), 0.5, filteredLeft);
  let delayedRight = el.delay({size: 44100}, el.ms2samps(375), 0.5, filteredRight);
  let outL = el.add(filteredLeft, delayedLeft);
  let outR = el.add(filteredRight, delayedRight);

  return core.render(
      el.mul(el.const({key: 'gainCh1', value: gain}), outL),
      el.mul(el.const({key: 'gainCh2', value: gain}), outR)
  );
}

let ctx = null;
const gc = () => {
  if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
};
const p = fn => { try { fn(gc()); } catch (e) {} };

export const Audio = {
  tick()    { p(c => { const o=c.createOscillator(),g=c.createGain(); o.connect(g); g.connect(c.destination); o.frequency.value=500+Math.random()*300; o.type='square'; g.gain.setValueAtTime(.03,c.currentTime); g.gain.exponentialRampToValueAtTime(.001,c.currentTime+.06); o.start(); o.stop(c.currentTime+.06); }); },
  click()   { p(c => { const o=c.createOscillator(),g=c.createGain(); o.connect(g); g.connect(c.destination); o.frequency.value=1100; o.type='sine'; g.gain.setValueAtTime(.06,c.currentTime); g.gain.exponentialRampToValueAtTime(.001,c.currentTime+.07); o.start(); o.stop(c.currentTime+.07); }); },
  bet()     { p(c => { [320,420,540].forEach((f,i) => { const o=c.createOscillator(),g=c.createGain(); o.connect(g); g.connect(c.destination); o.frequency.value=f; o.type='triangle'; const t=c.currentTime+i*.09; g.gain.setValueAtTime(.09,t); g.gain.exponentialRampToValueAtTime(.001,t+.28); o.start(t); o.stop(t+.28); }); }); },
  round(n)  { p(c => { const f=[440,520,640][n]||440,o=c.createOscillator(),g=c.createGain(); o.connect(g); g.connect(c.destination); o.frequency.value=f; o.type='triangle'; g.gain.setValueAtTime(.1,c.currentTime); g.gain.exponentialRampToValueAtTime(.001,c.currentTime+.35); o.start(); o.stop(c.currentTime+.35); }); },
  win()     { p(c => { [523,659,784,1047].forEach((f,i) => { const o=c.createOscillator(),g=c.createGain(); o.connect(g); g.connect(c.destination); o.frequency.value=f; o.type='triangle'; const t=c.currentTime+i*.13; g.gain.setValueAtTime(0,t); g.gain.linearRampToValueAtTime(.13,t+.06); g.gain.exponentialRampToValueAtTime(.001,t+.45); o.start(t); o.stop(t+.45); }); }); },
  loss()    { p(c => { [300,240,180].forEach((f,i) => { const o=c.createOscillator(),g=c.createGain(); o.connect(g); g.connect(c.destination); o.frequency.value=f; o.type='sawtooth'; const t=c.currentTime+i*.16; g.gain.setValueAtTime(.09,t); g.gain.exponentialRampToValueAtTime(.001,t+.35); o.start(t); o.stop(t+.35); }); }); },
  nearMiss(){ p(c => { const o=c.createOscillator(),g=c.createGain(); o.connect(g); g.connect(c.destination); o.frequency.setValueAtTime(440,c.currentTime); o.frequency.linearRampToValueAtTime(210,c.currentTime+.55); o.type='triangle'; g.gain.setValueAtTime(.12,c.currentTime); g.gain.exponentialRampToValueAtTime(.001,c.currentTime+.55); o.start(); o.stop(c.currentTime+.55); }); },
};
/**
 * مؤثرات صوتية مولّدة برمجيًا عبر Web Audio — بلا ملفات خارجية، تعمل دون إنترنت.
 * تُشغَّل عقب تفاعل المستخدم (نقر)، فيُنشأ سياق الصوت ويُستأنف بأمان.
 */

let ctx: AudioContext | null = null;
let enabled = true;

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AC) return null;
  if (!ctx) ctx = new AC();
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

function tone(freq: number, startAt: number, dur: number, type: OscillatorType = "triangle", peak = 0.25) {
  const c = getCtx();
  if (!c || !enabled) return;
  const t0 = c.currentTime + startAt;
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  gain.gain.setValueAtTime(0.0001, t0);
  gain.gain.exponentialRampToValueAtTime(peak, t0 + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.connect(gain).connect(c.destination);
  osc.start(t0);
  osc.stop(t0 + dur + 0.03);
}

export function setSoundEnabled(on: boolean) {
  enabled = on;
}

/** نغمة نجاح صاعدة عند الإجابة الصحيحة ومنح النقطة. */
export function playCorrect() {
  tone(660, 0, 0.14, "triangle", 0.28);
  tone(880, 0.09, 0.2, "triangle", 0.26);
}

/** تصفيق جمهور مولّد من ضجيج مُرشَّح مع رفرفة سريعة تحاكي التصفيق. */
function applause(dur = 1.9, startAt = 0) {
  const c = getCtx();
  if (!c || !enabled) return;
  const t0 = c.currentTime + startAt;

  const frames = Math.floor(c.sampleRate * dur);
  const buffer = c.createBuffer(1, frames, c.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < frames; i++) data[i] = Math.random() * 2 - 1;

  const src = c.createBufferSource();
  src.buffer = buffer;

  const band = c.createBiquadFilter();
  band.type = "bandpass";
  band.frequency.value = 1900;
  band.Q.value = 0.8;

  const gain = c.createGain();
  gain.gain.setValueAtTime(0.0001, t0);
  gain.gain.linearRampToValueAtTime(0.22, t0 + 0.18); // يعلو التصفيق تدريجيًا
  gain.gain.setValueAtTime(0.2, t0 + dur * 0.55);
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);

  // رفرفة تعطي إحساس ضربات الكفوف.
  const lfo = c.createOscillator();
  lfo.type = "square";
  lfo.frequency.value = 12;
  const lfoGain = c.createGain();
  lfoGain.gain.value = 0.1;
  lfo.connect(lfoGain).connect(gain.gain);

  src.connect(band).connect(gain).connect(c.destination);
  src.start(t0);
  src.stop(t0 + dur);
  lfo.start(t0);
  lfo.stop(t0 + dur);
}

/** نبضة عدّاد تنازلي قصيرة. */
export function playTick(high = false) {
  tone(high ? 880 : 440, 0, 0.08, "square", 0.16);
}

/** انطلاق: كنس تردّدي صاعد يحاكي محرّك مركبة. */
export function playLaunch() {
  const c = getCtx();
  if (!c || !enabled) return;
  const t0 = c.currentTime;
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.type = "sawtooth";
  osc.frequency.setValueAtTime(80, t0);
  osc.frequency.exponentialRampToValueAtTime(880, t0 + 1.1);
  gain.gain.setValueAtTime(0.0001, t0);
  gain.gain.exponentialRampToValueAtTime(0.28, t0 + 0.2);
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + 1.3);
  osc.connect(gain).connect(c.destination);
  osc.start(t0);
  osc.stop(t0 + 1.35);
  applause(1.4, 0.6);
}

/** فتح قفل: نقرتان معدنيتان صاعدتان مع بريق. */
export function playUnlock() {
  tone(523.25, 0, 0.1, "square", 0.2);
  tone(784, 0.1, 0.16, "triangle", 0.22);
  tone(1319, 0.2, 0.3, "sine", 0.14);
}

/** دوران العجلة: نقرات متسارعة (تِك تِك) توحي بمرور القطاعات، تتباطأ تدريجيًا. */
export function playWheelSpin(dur = 3.4) {
  const c = getCtx();
  if (!c || !enabled) return;
  const t0 = c.currentTime;
  // نقرات تبدأ سريعة ثم تتباعد (يحاكي تباطؤ العجلة)
  let t = 0.04;
  let gap = 0.05;
  while (t < dur) {
    tone(1200, t, 0.03, "square", 0.13);
    gap *= 1.11; // تتباعد النقرات تدريجيًا
    t += gap;
  }
  void t0;
}

/** توقّف العجلة على اسم: ضربة حماسية صاعدة + رشقة بريق (بلا موسيقى). */
export function playWheelStop() {
  tone(523.25, 0, 0.12, "square", 0.24);
  tone(783.99, 0.08, 0.16, "triangle", 0.24);
  tone(1046.5, 0.16, 0.28, "sine", 0.2);
  tone(1567.98, 0.2, 0.3, "sine", 0.14);
  applause(1.1, 0.18);
}

/** مبارزة فردية: نغمتان حادّتان سريعتان كصليل السيوف. */
export function playDuel() {
  tone(1200, 0, 0.06, "sawtooth", 0.2);
  tone(1600, 0.05, 0.06, "sawtooth", 0.2);
  tone(900, 0.12, 0.1, "square", 0.16);
}

/** ضربة طبل جماعية: نبضة منخفضة دافئة تحفّز روح الفريق. */
export function playDrum() {
  const c = getCtx();
  if (!c || !enabled) return;
  const t0 = c.currentTime;
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.type = "sine";
  osc.frequency.setValueAtTime(180, t0);
  osc.frequency.exponentialRampToValueAtTime(60, t0 + 0.18);
  gain.gain.setValueAtTime(0.0001, t0);
  gain.gain.exponentialRampToValueAtTime(0.32, t0 + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.24);
  osc.connect(gain).connect(c.destination);
  osc.start(t0); osc.stop(t0 + 0.26);
}

/** أجواء ملعب: تصفيق وهتاف جماعي ضخم لتحدّي الفصول. */
export function playStadium() {
  applause(2.4, 0);
  tone(196, 0.1, 0.5, "sawtooth", 0.12); // هتاف منخفض
  tone(261.63, 0.5, 0.5, "sawtooth", 0.12);
}

/** نبض القلب: ضربتان خافتتان في لحظة الترقّب قبل كشف الفائز. */
export function playHeartbeat() {
  tone(70, 0, 0.16, "sine", 0.3);
  tone(65, 0.3, 0.18, "sine", 0.26);
}

/** إنذار نابض: تردّدان متبادلان يوحيان بالطوارئ. */
export function playAlarm() {
  tone(740, 0, 0.22, "sawtooth", 0.18);
  tone(587, 0.24, 0.22, "sawtooth", 0.18);
}

/** فرحة الفوز: فانفير نحاسي حماسي + بريق + تصفيق الجمهور. */
export function playWin() {
  const fanfare: [number, number, number][] = [
    [392.0, 0.0, 0.16], // صول
    [523.25, 0.12, 0.16], // دو
    [659.25, 0.24, 0.16], // مي
    [783.99, 0.36, 0.55], // صول (ممدودة)
  ];
  fanfare.forEach(([f, s, d]) => {
    tone(f, s, d, "sawtooth", 0.2);
    tone(f * 1.006, s, d, "triangle", 0.12); // طبقة تعطي دفئًا وقوّة
  });
  tone(1046.5, 0.42, 0.5, "sine", 0.16); // بريق عالٍ
  tone(1567.98, 0.5, 0.5, "sine", 0.11);
  applause(1.9, 0.28); // تصفيق يعلو مع الفرحة
}

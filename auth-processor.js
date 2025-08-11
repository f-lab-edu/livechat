// ./auth-processor.js
module.exports = {
  setupRooms,
  initCursor,
  pickNextRoom,
  setNow, // ← 추가
  syncStart,
  hold,
  assignRoom,
};

let GLOBAL_START_AT = null;

function assignRoom(context, events, done) {
  // roomCount 내에서 loginId를 해시해 'myRoom' 배정 (균등 분산용)
  const n = Number(context.vars.roomCount ?? 1000);
  const id = String(context.vars.loginId || '');
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  context.vars.myRoom = (h % n) + 1;
  return done();
}

async function setNow(req, context, ee) {
  context.vars.nowISO = new Date().toISOString();
}

function syncStart(context, events, done) {
  // 모든 VU를 같은 시각까지 대기시켜 '동시성'을 맞춤
  const delayMs = Number(context.vars.syncDelayMs ?? 1500);
  if (!GLOBAL_START_AT) GLOBAL_START_AT = Date.now() + delayMs;
  const wait = GLOBAL_START_AT - Date.now();
  setTimeout(done, wait > 0 ? wait : 0);
}

function hold(context, events, done) {
  // 연결을 유지하기 위한 단순 wait
  const ms = Number(context.vars.holdMs ?? 10000);
  setTimeout(done, ms);
}

function setupRooms(context, events, done) {
  const N = Number(context.vars.roomCount);
  context.vars.rooms = Array.from({ length: N }, (_, i) => i + 1);
  return done();
}
function initCursor(context, events, done) {
  context.vars.cursor = 0;
  return done();
}
function pickNextRoom(context, events, done) {
  const rooms = context.vars.rooms || [];
  if (!rooms.length) return done(new Error('rooms not initialized'));
  const i = context.vars.cursor % rooms.length;
  context.vars.currentRoom = rooms[i];
  context.vars.cursor += 1;
  return done();
}

// ★ 지금 시각을 ms/ISO 둘 다 변수로 넣어줌
function setNow(context, events, done) {
  const now = new Date();
  context.vars.nowMs = now.getTime(); // 1712345678901
  context.vars.nowISO = now.toISOString(); // 2025-08-09T07:58:31.123Z
  return done();
}

// eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjUsImxvZ2luSWQiOiJ0ZXN0dXNlcjUiLCJpYXQiOjE3NTQ3OTAyMDAsImV4cCI6MTc1NDgzMzQwMH0.qkJcTgkW6XzM0Pe1zSBkspj_A1CguC_blC1bKxBWauA

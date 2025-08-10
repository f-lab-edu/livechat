'use strict';

// ---- export hooks ----
module.exports = {
  beforeScenario,
  setupRooms,
  initCursor,
  pickNextRoom,
  setNow,
  hold,
};

// ---- utils ----
const sleep = (ms) => new Promise((res) => setTimeout(res, ms));

function makePayload(size) {
  const buf = Buffer.alloc(size);
  for (let i = 0; i < size; i++) buf[i] = Math.floor(Math.random() * 256);
  return buf.toString('base64');
}

// ---- hooks (Promise/async style) ----

// 시나리오 시작 전에 1회 실행
async function beforeScenario(req, context, ee) {
  const size = Number(context.vars.payloadSize || 2048);
  context.vars.randomPayload = makePayload(size);
  // return 또는 아무것도 안 해도 됨(한 번만 resolve)
}

async function setupRooms(req, context, ee) {
  const n = Number(context.vars.roomCount || 1000);
  context.vars.rooms = Array.from({ length: n }, (_, i) => i + 1);
  context.vars.targetRoomId = 1;
}

async function initCursor(req, context, ee) {
  context.vars._cursor = 0;
}

async function pickNextRoom(req, context, ee) {
  const rooms = context.vars.rooms || [1];
  const c = context.vars._cursor || 0;
  const idx = c % rooms.length;
  context.vars.currentRoom = rooms[idx];
  context.vars._cursor = c + 1;
}

async function setNow(req, context, ee) {
  context.vars.nowISO = new Date().toISOString();
}

async function hold(req, context, ee) {
  const ms = Number(context.vars.holdMs || 0);
  if (ms > 0) await sleep(ms);
}

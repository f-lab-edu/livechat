// ./auth-processor.js
module.exports = {
  setupRooms,
  initCursor,
  pickNextRoom,
  setNow, // ← 추가
};

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

// config:
//   target: 'http://localhost:3000'
//   phases:
//     - duration: 60 # 테스트 총 길이(예: 10분)
//       arrivalCount: 10 # 딱 1명의 VU만 생성 (한 명의 유저)
//   socketio:
//     path: '/socket.io'
//   processor: './auth-processor.js'

//   payload: # ★ 각 VU에 계정 1개씩 할당
//     path: './users.csv'
//     fields:
//       - loginId
//       - loginPassword
//     order: sequence # 순서대로 할당 (랜덤하려면 random)
//     skipHeader: true

// scenarios:
//   - name: '유저 한명이 10개 채팅방 접속'
//     engine: socketio
//     flow:
//       # 1) 로그인 & 토큰 캡처
//       - post:
//           url: '/api/users/login'
//           json:
//             loginId: '{{ loginId }}'
//             loginPassword: '{{ loginPassword }}'
//           capture:
//             - json: '$.accessToken' # 응답 구조에 맞게 필요 시 수정($.data.accessToken 등)
//               as: accessToken
//               log: '{{ loginId }} logged in, accessToken: {{ accessToken }}'

//       # 2) 1..roomCount 배열 만들기
//       - function: 'setupRooms'

//       # 3) 모든 방에 한 번씩 joinRoom
//       - loop:
//           - namespace: '/chat'
//             emit:
//               channel: 'joinRoom'
//               data:
//                 youtubeStreamId: '{{ $loopElement }}'
//                 token: '{{ accessToken }}'
//           - think: 0.01 # 폭주 방지용(선택)
//         over: 'rooms' # setupRooms가 만든 배열

//       # 4) 2초마다 다음 방으로 chat (무한 루프)
//       - function: 'initCursor'
//       - loop:
//           - function: 'pickNextRoom' # currentRoom 설정
//           - function: 'setNow' # ← 매 전송 직전에 현재 시각 갱신
//           - namespace: '/chat'
//             emit:
//               channel: 'chat'
//               data:
//                 youtubeStreamId: '{{ currentRoom }}'
//                 message: 'RR chat to room {{ currentRoom }} at {{ nowISO }}'
//                 token: '{{ accessToken }}'
//           - think: 2 # 2초마다 한 건
//         count: 100

// 3 eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjYsImxvZ2luSWQiOiJ0ZXN0dXNlcjYiLCJpYXQiOjE3NTQ3Mzk4MjAsImV4cCI6MTc1NDc0MzQyMH0.ta_PdoZj-AtavnfV2bL_5cbDUMyFu_FMEabVN7m1dx4

// 39 token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjM5LCJsb2dpbklkIjoidGVzdHVzZXIzOSIsImlhdCI6MTc1NDczNTEzMiwiZXhwIjoxNzU0NzM4NzMyfQ.fdcCJI2hA8NuoxZPi7M9uyPMNxWn3rGfUjkifoGr2Ds

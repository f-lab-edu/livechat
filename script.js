import http from 'k6/http';
import { sleep, check } from 'k6';
import exec from 'k6/execution';
import ws from 'k6/ws'; // xk6-socketio 확장 필요

export const options = {
  vus: 10,
  duration: '30s',
};

// 환경 변수로 계정/방ID 주입 가능 (없으면 기본값 사용)
const BASE_URL = 'https://liveschats.store';
const LOGIN_ID = 'atestuser1';
const LOGIN_PASSWORD = 'password123';
const ROOM_ID = 1;

export default function () {
  // 1) 로그인 (HTTP)
  // const res = http.post(`${BASE_URL}/api/users/login`, JSON.stringify({ loginId: LOGIN_ID, loginPassword: LOGIN_PASSWORD }), {
  //   headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
  // });

  // check(res, {
  //   'login 200': (r) => r.status === 200,
  //   'accessToken exists': (r) => !!r.json('accessToken'),
  // });

  // const token = res.json('accessToken');
  const token = '123';
  if (!token) {
    console.log('Login failed, no token received');
    // 로그인 실패 시 이후 단계 진행하지 않음
    return;
  }

  // 2) 소켓 연결 (Socket.IO)
  const socket = ws.connect(
    BASE_URL,
    {
      path: '/chat',
      transports: ['websocket'],
      // 서버가 핸드셰이크에서 토큰을 읽는다면 query/headers 중 서버 구현에 맞게 전달
      // extraHeaders: { Authorization: `Bearer ${token}` },
    },
    function (socket) {
      socket.on('open', function () {
        console.log('WebSocket connection established');
      });

      socket.on('close', function () {
        console.log('WebSocket connection closed');
      });

      socket.on('error', function (error) {
        console.error(`WebSocket error: ${error}`);
      });
    },
  );

  // try {
  //   // 3) 방 입장 (ACK 확인)
  //   let joined = false;
  //   socket.emit('joinRoom', { youtubeStreamId: ROOM_ID, token }, (ack) => {
  //     // 서버 ACK 형태에 맞춰 성공 판단
  //     joined = ack === true || (ack && (ack.success === true || ack.status === 'ok'));
  //   });

  //   // 잠깐 대기해 ACK 기회 제공
  //   sleep(0.5);
  //   if (!joined) {
  //     // join 실패 시 채팅 생략
  //     return;
  //   }

  //   // 4) 채팅 메시지 전송 (N회, ACK 확인)
  //   for (let i = 0; i < 5; i++) {
  //     socket.emit('chat', { youtubeStreamId: ROOM_ID, message: `hello #${i} from ${LOGIN_ID}`, token }, (ack) => {
  //       // 필요하면 ack 검사/수집
  //     });
  //     sleep(1);
  //   }
  // } finally {
  //   // 5) 종료
  //   socket.emit('leaveRoom', { youtubeStreamId: ROOM_ID });
  //   socket.disconnect();
  // }
}

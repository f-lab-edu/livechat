const jwt = require('jsonwebtoken');

module.exports = {
  /**
   * Socket.IO 연결 직전에 호출됨
   */
  beforeConnect: function (userContext, events, done) {
    console.log('=== JWT 생성 시작 ===');
    console.log('userContext.vars:', JSON.stringify(userContext.vars, null, 2));

    const { userId, loginId } = userContext.vars;
    console.log('Input userId:', userId, 'loginId:', loginId);

    // JWT payload 생성
    const payload = {
      userId: Number(userId),
      loginId: loginId,
    };
    console.log('JWT payload:', JSON.stringify(payload, null, 2));

    // JWT 토큰 생성
    const secret = 'livechat';
    const token = jwt.sign(payload, secret, { expiresIn: '1h' });
    console.log('Generated JWT token:', token);

    // Socket.IO 연결 옵션 설정 (올바른 방식)
    userContext.socketio = {
      transports: ['websocket'],
      auth: {
        token: token,
      },
    };

    // 템플릿 변수로도 저장
    userContext.vars.jwt = token;

    console.log('Final userContext.socketio:', JSON.stringify(userContext.socketio, null, 2));
    console.log('=== JWT 생성 완료 ===');

    return done();
  },

  /**
   * 랜덤 메시지 생성 함수
   */
  generateMessage: function (userContext, events, done) {
    const messages = ['안녕하세요!', '테스트 메시지입니다.', '라이브 채팅 테스트', 'Hello World!', '성능 테스트 중...'];

    const randomMessage = messages[Math.floor(Math.random() * messages.length)];
    userContext.vars.message = randomMessage;

    console.log('Generated message:', randomMessage);
    return done();
  },
};

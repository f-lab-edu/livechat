const jwt = require('jsonwebtoken');

module.exports = {
  /**
   * Socket.IO 연결 직전에 호출됨
   * userContext.vars에는 payload(csv)에서 읽은 userId, loginId가 이미 들어 있습니다.
   */
  beforeConnect: function (userContext, events, done) {
    console.log('=== JWT 생성 시작 ===');

    var _a = userContext.vars,
      userId = _a.userId,
      loginId = _a.loginId;

    console.log('Input userId:', userId, 'loginId:', loginId);

    // 서버와 동일한 payload 구조로 생성
    var payload = {
      userId: Number(userId), // 서버에서 사용하는 필드명
      loginId: loginId,
    };

    console.log('JWT payload:', payload);

    // 실제 환경변수 또는 하드코딩된 secret 사용
    var secret = 'livechat';

    var token = jwt.sign(payload, secret, { expiresIn: '1h' });

    console.log('Generated JWT token:', token);

    // connectOptions 설정
    userContext.connectOptions = {
      transports: ['websocket'],
      auth: { token: token },
    };

    // {{ jwt }} 변수로 사용할 수 있도록 저장
    userContext.vars.jwt = token;

    console.log('JWT 변수 저장 완료:', userContext.vars.jwt);
    console.log('=== JWT 생성 완료 ===');

    return done();
  },
};

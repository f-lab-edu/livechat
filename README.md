<p align="center">"실시간 라이브 서비스"<br> <span>유튜브</span>의 실시간 라이브 서비스 기능만 구현한 프로젝트입니다.</p>

<br>
<br>

### 📺 유튜브 라이브 클론 프로젝트 입니다.

## 📺 프로젝트 설계

- [📋 API 명세서]()
- [📒 요구사항 정의서](https://github.com/f-lab-edu/livechat/wiki/PRD_v1)
- [📊 ERD (Entity Relationship Diagram)](https://github.com/f-lab-edu/livechat/wiki/ERD_v1)
- [📃 System architecture](https://github.com/f-lab-edu/livechat/wiki/%EC%8B%9C%EC%8A%A4%ED%85%9C-%EC%95%84%ED%82%A4%ED%85%8D%EC%B2%98_v1)

## 동작시키는 방법

1. docker-compose build
2. docker-compose up
3. docker exec -it <백엔드 컨테이너> npx prisma migrate --name init

## 기능

- 방송 스트리밍 관리 ( 컴퓨터 화면 , 웹캠)
  - 방송 시작 및 종료
  - 방송 상태 관리
- 실시간 채팅 기능
  - 클라이언트 간 메시지 전송
  - WebSocket을 통한 실시간 통신

## 기술 스택

- NestJS: 서버 사이드 애플리케이션 프레임워크
- TypeScript: 정적 타입을 지원하는 JavaScript의 상위 집합
- Socket.IO: 실시간 웹 애플리케이션을 위한 JavaScript 라이브러리
- FFmpeg: 비디오 및 오디오 스트리밍을 위한 멀티미디어 프레임워크

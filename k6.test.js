import ws from 'k6/ws';

export default function () {
  const url = 'wss://liveschats.store';
  const resp = ws.connect(url, null, function (socket) {
    socket.on('open', function () {
      console.log('WebSocket connection established');
      socket.send(JSON.stringify({ type: 'subscribe', channel: 'live_chat' }));
    });

    socket.on('message', function (message) {
      console.log(`Received message: ${message}`);
    });

    socket.on('close', function () {
      console.log('WebSocket connection closed');
    });

    socket.on('error', function (error) {
      console.error(`WebSocket error: ${error}`);
    });
  });
}

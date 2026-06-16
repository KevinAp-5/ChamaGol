const { Client } = require('@stomp/stompjs');
const SockJS = require('sockjs-client');

const WS_URL = 'https://chamagol.com/ws/chat?token=1234';
const NUM_CLIENTS = 1000;

let totalMessages = 0;

for (let i = 0; i < NUM_CLIENTS; i++) {
  const client = new Client({
    webSocketFactory: () => new SockJS(WS_URL),
    debug: () => {},
    reconnectDelay: 0,
  });

  client.onConnect = () => {
    console.log(`Cliente ${i} conectado!`);
    client.subscribe('/topic/messages', (message) => {
      totalMessages++;
      console.log(`Cliente ${i} recebeu:`, message.body);
      console.log(`Total de mensagens recebidas por todos os clientes: ${totalMessages}`);
      totalMessage = 0;
    });
  };

  client.onWebSocketClose = (event) => {
    console.warn(`Cliente ${i} WebSocket fechado:`, event.code, event.reason);
  };

  client.activate();
}

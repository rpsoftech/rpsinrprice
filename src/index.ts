import { randomBytes } from 'crypto';
import { EventEmitter } from 'stream';
import * as WebSocket from 'ws';
const InrPriceEmiter1 = new EventEmitter();
const url = process.env.inr_url || 'wss://stream123.forexpros.com/echo';
function getRandomArbitrary(min:number, max) {
  return Math.floor(Math.random() * (max - min) + min);
}
function GetRandom3Digits() {
  const num = getRandomArbitrary(99,999);
  if (num > 99) {
    return num;
  } else {
    return GetRandom3Digits();
  }
}
const msg1 = JSON.stringify({
  _event: 'subscribe',
  tzID: 8,
  message: 'pid-160:',
});
const msg2 = JSON.stringify({
  _event: 'subscribe',
  tzID: 8,
  message: 'isOpenPair-160:',
});
const heartbeat = JSON.stringify({ _event: 'heartbeat', data: 'h' });
function Init() {
  const ws = new WebSocket(
    `${url}/${GetRandom3Digits()}/${randomBytes(4).toString('hex')}/websocket`
  );
  let Interval = null;
  ws.on('open', () => {
  });
  ws.on('message', (data) => {
    if (data === 'o') {
      setTimeout(() => {
        ws.send(JSON.stringify([msg1]));
        ws.send(JSON.stringify([msg2]));
        ws.send(JSON.stringify([heartbeat]));
        Interval = setInterval(() => {
          ws.send(JSON.stringify([heartbeat]));
        }, 4590);
      });
    } else if (data.toString().startsWith('a')) {
      let data1 = data.toString().replace('a', '');
      try {
        data1 = JSON.parse(data1);
        if (Array.isArray(data1)) {
          data1.forEach((a) => {
            a = JSON.parse(a);
            if (typeof a['message'] === 'string') {
              const data = JSON.parse(a['message'].replace('pid-160::', ''));
              try {
                const price = {
                  'bid-price': data['bid'],
                  'bid-high-price': data['high'],
                  'bid-low-price': data['low'],
                  'ask-price': data['ask'],
                  'last-high': data['high'],
                  'last-low': data['low'],
                  'ask-high-price': data['high'],
                  'ask-low-price': data['low'],
                };
                InrPriceEmiter1.emit('rate', price);
              } catch (error) {}
            }
          });
        }
      } catch (error) {}
    }
  });
  ws.on('error', console.log);
  ws.on('close', () => {
    ws.removeAllListeners();
    ws.close();
    if (Interval !== null) {
      clearInterval(Interval);
    }
    setTimeout(() => {
      Init();
    }, 2000);
  });
  ws.on('unexpected-response', a=>{
    console.log(a);
    
  });
}
Init();

export const InrPriceEmiter = InrPriceEmiter1;

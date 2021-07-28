import { randomBytes } from 'crypto';
import { EventEmitter } from 'stream';
import * as WebSocket from 'ws';
import { JSDOM } from 'jsdom';
const InrPriceEmiter1 = new EventEmitter();
InrPriceEmiter1.addListener('rate', console.log);
const url = process.env.inr_url || 'wss://stream123.forexpros.com/echo';
function getRandomArbitrary(min: number, max) {
  return Math.floor(Math.random() * (max - min) + min);
}
function GetRandom3Digits() {
  const num = getRandomArbitrary(99, 999);
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
async function GetInrFromUrl() {
  const a = await JSDOM.fromURL(
    'https://in.widgets.investing.com/live-currency-cross-rates?theme=darkTheme&roundedCorners=true&pairs=160&cols=bid,ask,last,prev,high,low'
  );
  const ele = a.window.document.getElementById('pair_160');
  if (ele.children.length > 6) {
    const rate = {
      symbol: ele.children.item(0).textContent,
      bid: ele.children.item(1).textContent,
      ask: ele.children.item(2).textContent,
      last: ele.children.item(3).textContent,
      open: ele.children.item(4).textContent,
      high: ele.children.item(5).textContent,
      low: ele.children.item(6).textContent,
    };
    const rate1 = {
      'bid-price': rate['bid'],
      'bid-high-price': rate['high'],
      'bid-low-price': rate['low'],
      'ask-price': rate['ask'],
      'last-high': rate['high'],
      'last-low': rate['low'],
      'ask-high-price': rate['high'],
      'ask-low-price': rate['low'],
    };
    InrPriceEmiter1.emit('rate', rate1);
  }
  Init();
}
async function Init() {
  const ws = new WebSocket(
    `${url}/${GetRandom3Digits()}/${randomBytes(4).toString('hex')}/websocket`
  );
  let Interval = null;
  ws.on('open', () => {});
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
  ws.on('unexpected-response', (a) => {
    console.log(a);
  });
}
GetInrFromUrl();
export const InrPriceEmiter = InrPriceEmiter1;

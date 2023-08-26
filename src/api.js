const API_KEY = '93d126ace6ea67e6ca421b2de3e885ecf7c71b9228233fcefb33881cde854ef1';
const MAIN_FIAT_CURRENCY = 'USD';
const currenciesHandlers = new Map();

const AGREGATE_INDEX = '5';
const socket = new WebSocket(`wss://streamer.cryptocompare.com/v2?api_key=${API_KEY}`)


socket.addEventListener("message", e => {
    const {TYPE: type, FROMSYMBOL: currency, PRICE: price} = JSON.parse(e.data);
    if (type !== AGREGATE_INDEX || !price) {
        return;
    }

    const handlers = currenciesHandlers.get(currency) ?? [];
    handlers.forEach(fn => fn(price));
})

function subscribeToCurrencyOnWebSocket(currency) {
    sendToWebSocket({
        "action": "SubAdd",
        "subs": [`5~CCCAGG~${currency}~${MAIN_FIAT_CURRENCY}`]
    });
}

function unsubscribeCurrencyOnWebSocket(currency) {
    sendToWebSocket({
        "action": "SubRemove",
        "subs": [`5~CCCAGG~${currency}~${MAIN_FIAT_CURRENCY}`]
    });
}

function sendToWebSocket(message) {
    const stringifyMessage = JSON.stringify(message);

    if (socket.readyState === WebSocket.OPEN) {
        socket.send(stringifyMessage);
        return;
    }

    socket.addEventListener(
        'open', 
        () => {
            socket.send(stringifyMessage);
        }, 
        { once: true }
    );
}

export function subscribeToCurrency(currency, cb) {
    const existingSubscribers = currenciesHandlers.get(currency) || [];
    currenciesHandlers.set(currency, [...existingSubscribers, cb])
    subscribeToCurrencyOnWebSocket(currency);
}

export function unsubscribeCurrency(currency) {
    currenciesHandlers.delete(currency);
    unsubscribeCurrencyOnWebSocket(currency);
}
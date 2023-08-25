const API_KEY = '93d126ace6ea67e6ca421b2de3e885ecf7c71b9228233fcefb33881cde854ef1';

// TODO URL_SEARCH_PARAMS
export function loadCurrencies(currencies) {
    return fetch(
        `https://min-api.cryptocompare.com/data/price?fsym=USD&tsyms=${currencies.join(',')}&api_key=${API_KEY}`
    ).then(r => r.json());
}
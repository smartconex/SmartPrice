const ccxt = require("ccxt");

var kraken = new ccxt.kraken();
var bitstamp = new ccxt.bitstamp();
var bitfinex = new ccxt.bitfinex();
var gdax = new ccxt.gdax();
var gemini = new ccxt.gemini();

var thisPriceObj = {};

// courtesy of MDN
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/round
function precisionRound(number, precision) {
  var factor = Math.pow(10, precision);
  return Math.round(number * factor) / factor;
}

function setPriceObj(result, property) {
  if (result.average != undefined) {
    thisPriceObj[property] = result.average;
  } else if (result.ask && result.bid) {
    thisPriceObj[property] = (result.ask + result.bid) / 2;
  }
}

function updatePrice() {
  return new Promise((resolve, reject) => {
    thisPriceObj = {};
    resolve(bitstamp.fetchTicker('ETH/USD')
    .then(result => {
      setPriceObj(result, 'bitstamp');
      return kraken.fetchTicker('ETH/USD');
    })
    .catch((err) => {
      console.log(err);
      return kraken.fetchTicker('ETH/USD');
    })
    .then(result => {
      setPriceObj(result, 'kraken');
      return bitfinex.fetchTicker('ETH/USD');
    })
    .catch((err) => {
      console.log(err);
      return bitfinex.fetchTicker('ETH/USD');
    })
    .then(result => {
      setPriceObj(result, 'bitfinex');
      return gdax.fetchTicker('ETH/USD');
    })
    .catch((err) => {
      console.log(err);
      return gdax.fetchTicker('ETH/USD');
    })
    .then(result => {
      setPriceObj(result, 'gdax');
      return gemini.fetchTicker('ETH/USD');
    })
    .catch((err) => {
      console.log(err);
      return gemini.fetchTicker('ETH/USD');
    })
    .then(result => {
      setPriceObj(result, 'gemini');
    })
    .catch((err) => {
      console.log(err);
    })
    .then(() => {
      var totalPrice = 0.0;
      var rejects = 0;

      for (const obj in thisPriceObj) {
        if (!isNaN(thisPriceObj[obj])) {
          totalPrice += thisPriceObj[obj];
        } else {
          rejects++;
        }
      }

      thisPriceObj['avgPrice'] = precisionRound((totalPrice / (Object.keys(thisPriceObj).length - rejects)), 2);
      return thisPriceObj;
    }));
  });
}

module.exports.priceObj = thisPriceObj;

module.exports.updatePrice = updatePrice;

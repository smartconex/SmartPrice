const ccxt = require("ccxt");

var kraken = new ccxt.kraken();
var bitstamp = new ccxt.bitstamp();
var bitfinex = new ccxt.bitfinex();
var gemini = new ccxt.gemini();

var thisPriceObj = {};

// courtesy of MDN
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/round
function precisionRound(number, precision) {
  var factor = Math.pow(10, precision);
  return Math.round(number * factor) / factor;
}

var ccxtPromise = bitstamp.fetchTicker('ETH/USD')
  .then(result => {
    if (result.average != undefined) {
      thisPriceObj.bitStampPrice = result.average;
    }
    else if (result.last != undefined) {
      thisPriceObj.bitStampPrice = result.last;
    }
    return kraken.fetchTicker('ETH/USD');
  })
  .then(result => {
    if (result.average != undefined) {
      thisPriceObj.kraken = result.average;
    }
    else if (result.last != undefined) {
      thisPriceObj.kraken = result.last;
    }
    return bitfinex.fetchTicker('ETH/USD');
  })
  .then(result => {
    if (result.average != undefined) {
      thisPriceObj.bitfinex = result.average;
    }
    else if (result.last != undefined) {
      thisPriceObj.bitfinex = result.last;
    }
    return gemini.fetchTicker('ETH/USD');
  })
  .then(result => {
    if (result.average != undefined) {
      thisPriceObj.gemini = result.average;
    }
    else if (result.last != undefined) {
      thisPriceObj.gemini = result.last;
    }
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
      }
      else {
        rejects++;
      }
    }

    thisPriceObj['avgPrice'] = precisionRound((totalPrice / (Object.keys(thisPriceObj).length - rejects)), 2);
  });

var thisPromise = new Promise((resolve, reject) => {
  thisPriceObj = {};
  resolve(ccxtPromise);
})

module.exports.priceObj = thisPriceObj;

module.exports.updatePrice = thisPromise;
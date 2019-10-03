'use strict';

var _ = require('lodash');

var errors = require('./errors');
var $ = require('./util/preconditions');

var UNITS = {
  'ZEN'      : [1e8, 8],
  'mZEN'     : [1e5, 5],
  'uZEN'     : [1e2, 2],
  'bits'     : [1e2, 2],
  'zatoshis' : [1, 0]
};

/**
 * Utility for handling and converting bitcoins units. The supported units are
 * ZEN, mZEN, bits (also named uZEN) and zatoshis. A unit instance can be created with an
 * amount and a unit code, or alternatively using static methods like {fromZEN}.
 * It also allows to be created from a fiat amount and the exchange rate, or
 * alternatively using the {fromFiat} static method.
 * You can consult for different representation of a unit instance using it's
 * {to} method, the fixed unit methods like {toZatoshis} or alternatively using
 * the unit accessors. It also can be converted to a fiat amount by providing the
 * corresponding ZEN/fiat exchange rate.
 *
 * @example
 * ```javascript
 * var zats = Unit.fromZEN(1.3).toZatoshis();
 * var mili = Unit.fromBits(1.3).to(Unit.mZEN);
 * var bits = Unit.fromFiat(1.3, 350).bits;
 * var btc = new Unit(1.3, Unit.bits).ZEN;
 * ```
 *
 * @param {Number} amount - The amount to be represented
 * @param {String|Number} code - The unit of the amount or the exchange rate
 * @returns {Unit} A new instance of an Unit
 * @constructor
 */
function Unit(amount, code) {
  if (!(this instanceof Unit)) {
    return new Unit(amount, code);
  }

  // convert fiat to ZEN
  if (_.isNumber(code)) {
    if (code <= 0) {
      throw new errors.Unit.InvalidRate(code);
    }
    amount = amount / code;
    code = Unit.ZEN;
  }

  this._value = this._from(amount, code);

  var self = this;
  var defineAccesor = function(key) {
    Object.defineProperty(self, key, {
      get: function() { return self.to(key); },
      enumerable: true,
    });
  };

  Object.keys(UNITS).forEach(defineAccesor);
}

Object.keys(UNITS).forEach(function(key) {
  Unit[key] = key;
});

/**
 * Returns a Unit instance created from JSON string or object
 *
 * @param {String|Object} json - JSON with keys: amount and code
 * @returns {Unit} A Unit instance
 */
Unit.fromObject = function fromObject(data){
  $.checkArgument(_.isObject(data), 'Argument is expected to be an object');
  return new Unit(data.amount, data.code);
};

/**
 * Returns a Unit instance created from an amount in ZEN
 *
 * @param {Number} amount - The amount in ZEN
 * @returns {Unit} A Unit instance
 */
Unit.fromZEN = function(amount) {
  return new Unit(amount, Unit.ZEN);
};

/**
 * Returns a Unit instance created from an amount in mZEN
 *
 * @param {Number} amount - The amount in mZEN
 * @returns {Unit} A Unit instance
 */
Unit.fromMillis = Unit.fromMilis = function(amount) {
  return new Unit(amount, Unit.mZEN);
};

/**
 * Returns a Unit instance created from an amount in bits
 *
 * @param {Number} amount - The amount in bits
 * @returns {Unit} A Unit instance
 */
Unit.fromMicros = Unit.fromBits = function(amount) {
  return new Unit(amount, Unit.bits);
};

/**
 * Returns a Unit instance created from an amount in zatoshis
 *
 * @param {Number} amount - The amount in zatoshis
 * @returns {Unit} A Unit instance
 */
Unit.fromZatoshis = function(amount) {
  return new Unit(amount, Unit.zatoshis);
};

/**
 * Returns a Unit instance created from a fiat amount and exchange rate.
 *
 * @param {Number} amount - The amount in fiat
 * @param {Number} rate - The exchange rate ZEN/fiat
 * @returns {Unit} A Unit instance
 */
Unit.fromFiat = function(amount, rate) {
  return new Unit(amount, rate);
};

Unit.prototype._from = function(amount, code) {
  if (!UNITS[code]) {
    throw new errors.Unit.UnknownCode(code);
  }
  return parseInt((amount * UNITS[code][0]).toFixed());
};

/**
 * Returns the value represented in the specified unit
 *
 * @param {String|Number} code - The unit code or exchange rate
 * @returns {Number} The converted value
 */
Unit.prototype.to = function(code) {
  if (_.isNumber(code)) {
    if (code <= 0) {
      throw new errors.Unit.InvalidRate(code);
    }
    return parseFloat((this.ZEN * code).toFixed(2));
  }

  if (!UNITS[code]) {
    throw new errors.Unit.UnknownCode(code);
  }

  var value = this._value / UNITS[code][0];
  return parseFloat(value.toFixed(UNITS[code][1]));
};

/**
 * Returns the value represented in ZEN
 *
 * @returns {Number} The value converted to ZEN
 */
Unit.prototype.toZEN = function() {
  return this.to(Unit.ZEN);
};

/**
 * Returns the value represented in mZEN
 *
 * @returns {Number} The value converted to mZEN
 */
Unit.prototype.toMillis = Unit.prototype.toMilis = function() {
  return this.to(Unit.mZEN);
};

/**
 * Returns the value represented in bits
 *
 * @returns {Number} The value converted to bits
 */
Unit.prototype.toMicros = Unit.prototype.toBits = function() {
  return this.to(Unit.bits);
};

/**
 * Returns the value represented in zatoshis
 *
 * @returns {Number} The value converted to zatoshis
 */
Unit.prototype.toZatoshis = function() {
  return this.to(Unit.zatoshis);
};

/**
 * Returns the value represented in fiat
 *
 * @param {string} rate - The exchange rate between ZEN/currency
 * @returns {Number} The value converted to zatoshis
 */
Unit.prototype.atRate = function(rate) {
  return this.to(rate);
};

/**
 * Returns a the string representation of the value in zatoshis
 *
 * @returns {string} the value in zatoshis
 */
Unit.prototype.toString = function() {
  return this.zatoshis + ' zatoshis';
};

/**
 * Returns a plain object representation of the Unit
 *
 * @returns {Object} An object with the keys: amount and code
 */
Unit.prototype.toObject = Unit.prototype.toJSON = function toObject() {
  return {
    amount: this.ZEN,
    code: Unit.ZEN
  };
};

/**
 * Returns a string formatted for the console
 *
 * @returns {string} the value in zatoshis
 */
Unit.prototype.inspect = function() {
  return '<Unit: ' + this.toString() + '>';
};

module.exports = Unit;

'use strict';

var _ = require('lodash');
var BN = require('../crypto/bn');
var BufferUtil = require('../util/buffer');
var BufferReader = require('../encoding/bufferreader');
var BufferWriter = require('../encoding/bufferwriter');
var Hash = require('../crypto/hash');
var $ = require('../util/preconditions');
var Networks = require('../networks');


var GENESIS_BITS_MAINNET = 0x1f07ffff;
var GENESIS_BITS_TESTNET = 0x2007ffff;
var GENESIS_BITS_REGTEST = 0x200f0f0f;


/**
 * Instantiate a BlockHeader from a Buffer, JSON object, or Object with
 * the properties of the BlockHeader
 *
 * @param {*} - A Buffer, JSON string, or Object
 * @returns {BlockHeader} - An instance of block header
 * @constructor
 */
var BlockHeader = function BlockHeader(arg) {
  if (!(this instanceof BlockHeader)) {
    return new BlockHeader(arg);
  }
  var info = BlockHeader._from(arg);
  this.version = info.version;
  this.prevHash = info.prevHash;
  this.merkleRoot = info.merkleRoot;
  if (this.version === BlockHeader.SC_CERT_BLOCK_VERSION) {
    this.scTxsCommitment = info.scTxsCommitment;
  } else {
    this.reserved = info.reserved;
  }
  this.time = info.time;
  this.timestamp = info.time;
  this.bits = info.bits;
  this.nonce = info.nonce;
  this.solution = info.solution;

  if (info.hash) {
    $.checkState(
      this.hash === info.hash,
      'Argument object hash property does not match block hash.'
    );
  }

  return this;
};

/**
 * @param {*} - A Buffer, JSON string or Object
 * @returns {Object} - An object representing block header data
 * @throws {TypeError} - If the argument was not recognized
 * @private
 */
BlockHeader._from = function _from(arg) {
  var info = {};
  if (BufferUtil.isBuffer(arg)) {
    info = BlockHeader._fromBufferReader(BufferReader(arg));
  } else if (_.isObject(arg)) {
    info = BlockHeader._fromObject(arg);
  } else {
    throw new TypeError('Unrecognized argument for BlockHeader');
  }
  return info;
};

/**
 * @param {Object} - A JSON string
 * @returns {Object} - An object representing block header data
 * @private
 */
BlockHeader._fromObject = function _fromObject(data) {
  $.checkArgument(data, 'data is required');
  const info = {};
  info.hash = data.hash;
  info.version = data.version;
  info.prevHash = data.prevHash;
  info.merkleRoot = data.merkleRoot;
  info.time = data.time;
  info.bits = data.bits;
  info.nonce = data.nonce;
  info.solution = data.solution;
  if (data.scTxsCommitment) {
    info.scTxsCommitment = data.scTxsCommitment;
    if (_.isString(data.scTxsCommitment)) {
      info.scTxsCommitment = BufferUtil.reverse(new Buffer(data.scTxsCommitment, 'hex'));
    }
  } else if (data.reserved) {
    info.reserved = data.reserved;
    if (_.isString(data.reserved)) {
      info.scTxsCommitment = BufferUtil.reverse(new Buffer(data.reserved, 'hex'));
    }
  }
  if (_.isString(data.prevHash)) {
    info.prevHash = BufferUtil.reverse(new Buffer(data.prevHash, 'hex'));
  }
  if (_.isString(data.merkleRoot)) {
    info.merkleRoot = BufferUtil.reverse(new Buffer(data.merkleRoot, 'hex'));
  }
  if (_.isString(data.nonce)) {
    info.nonce = BufferUtil.reverse(new Buffer(data.nonce, 'hex'));
  }
  if (_.isString(data.solution)) {
    info.solution = new Buffer(data.solution, 'hex');
  }

  return info;
};

/**
 * @param {Object} - A plain JavaScript object
 * @returns {BlockHeader} - An instance of block header
 */
BlockHeader.fromObject = function fromObject(obj) {
  var info = BlockHeader._fromObject(obj);
  return new BlockHeader(info);
};

/**
 * @param {Binary} - Raw block binary data or buffer
 * @returns {BlockHeader} - An instance of block header
 */
BlockHeader.fromRawBlock = function fromRawBlock(data) {
  if (!BufferUtil.isBuffer(data)) {
    data = new Buffer(data, 'binary');
  }
  var br = BufferReader(data);
  br.pos = BlockHeader.Constants.START_OF_HEADER;
  var info = BlockHeader._fromBufferReader(br);
  return new BlockHeader(info);
};

/**
 * @param {Buffer} - A buffer of the block header
 * @returns {BlockHeader} - An instance of block header
 */
BlockHeader.fromBuffer = function fromBuffer(buf) {
  var info = BlockHeader._fromBufferReader(BufferReader(buf));
  return new BlockHeader(info);
};

/**
 * @param {string} - A hex encoded buffer of the block header
 * @returns {BlockHeader} - An instance of block header
 */
BlockHeader.fromString = function fromString(str) {
  var buf = new Buffer(str, 'hex');
  return BlockHeader.fromBuffer(buf);
};

/**
 * @param {BufferReader} - A BufferReader of the block header
 * @returns {Object} - An object representing block header data
 * @private
 */
BlockHeader._fromBufferReader = function _fromBufferReader(br) {
  var info = {};
  info.version = br.readUInt32LE();
  info.prevHash = br.read(32);
  info.merkleRoot = br.read(32);
  if (info.version === BlockHeader.SC_CERT_BLOCK_VERSION) {
    info.scTxsCommitment = br.read(32);
  } else {
    info.reserved = br.read(32);
  }
  info.time = br.readUInt32LE();
  info.bits = br.readUInt32LE();
  info.nonce = br.read(32);
  var lenSolution = br.readVarintNum();
  info.solution = br.read(lenSolution);
  return info;
};

/**
 * @param {BufferReader} - A BufferReader of the block header
 * @returns {BlockHeader} - An instance of block header
 */
BlockHeader.fromBufferReader = function fromBufferReader(br) {
  var info = BlockHeader._fromBufferReader(br);
  return new BlockHeader(info);
};

/**
 * @returns {Object} - A plain object of the BlockHeader
 */
BlockHeader.prototype.toObject = BlockHeader.prototype.toJSON = function toObject() {
  const info = {};
  info.hash = this.hash;
  info.version = this.version;
  info.prevHash = BufferUtil.reverse(this.prevHash).toString('hex');
  info.merkleRoot = BufferUtil.reverse(this.merkleRoot).toString('hex');
  if (this.scTxsCommitment) {
    info.scTxsCommitment = BufferUtil.reverse(this.scTxsCommitment).toString('hex');
  } else if (this.reserved) {
    info.reserved = BufferUtil.reverse(this.reserved).toString('hex');
  }
  info.time = this.time;
  info.bits = this.bits;
  info.nonce = BufferUtil.reverse(this.nonce).toString('hex');
  info.solution = this.solution.toString('hex');
  return info;
};

/**
 * @returns {Buffer} - A Buffer of the BlockHeader
 */
BlockHeader.prototype.toBuffer = function toBuffer() {
  return this.toBufferWriter().concat();
};

/**
 * @returns {string} - A hex encoded string of the BlockHeader
 */
BlockHeader.prototype.toString = function toString() {
  return this.toBuffer().toString('hex');
};

/**
 * @param {BufferWriter} - An existing instance BufferWriter
 * @returns {BufferWriter} - An instance of BufferWriter representation of the BlockHeader
 */
BlockHeader.prototype.toBufferWriter = function toBufferWriter(bw) {
  if (!bw) {
    bw = new BufferWriter();
  }
  bw.writeUInt32LE(this.version);
  bw.write(this.prevHash);
  bw.write(this.merkleRoot);
  if (this.scTxsCommitment) {
    bw.write(this.scTxsCommitment);
  } else if (this.reserved) {
    bw.write(this.reserved);
  }
  bw.writeUInt32LE(this.time);
  bw.writeUInt32LE(this.bits);
  bw.write(this.nonce);
  bw.writeVarintNum(this.solution.length);
  bw.write(this.solution);
  return bw;
};

BlockHeader.getGenesisBits = function(network) {
  network = network || Networks.defaultNetwork;
  switch (network.name) {
    case 'livenet': {
      return GENESIS_BITS_MAINNET;
    }
    case 'testnet': {
      return GENESIS_BITS_TESTNET;
    }
    case 'regtest': {
      return GENESIS_BITS_REGTEST;
    }
  }
};

/**
 * Returns the target difficulty for this block
 * @param {Number} bits
 * @returns {BN} An instance of BN with the decoded difficulty bits
 */
BlockHeader.prototype.getTargetDifficulty = function getTargetDifficulty(bits) {
  bits = bits || this.bits;

  var target = new BN(bits & 0xffffff);
  var mov = 8 * ((bits >>> 24) - 3);
  while (mov-- > 0) {
    target = target.mul(new BN(2));
  }
  return target;
};

/**
 * @link https://en.bitcoin.it/wiki/Difficulty
 * @return {Number}
 */
BlockHeader.prototype.getDifficulty = function getDifficulty(network) {
  var difficulty1TargetBN = this.getTargetDifficulty(BlockHeader.getGenesisBits(network)).mul(new BN(Math.pow(10, 8)));
  var currentTargetBN = this.getTargetDifficulty();

  var difficultyString = difficulty1TargetBN.div(currentTargetBN).toString(10);
  var decimalPos = difficultyString.length - 8;
  difficultyString = difficultyString.slice(0, decimalPos) + '.' + difficultyString.slice(decimalPos);

  return parseFloat(difficultyString);
};

/**
 * @returns {Buffer} - The little endian hash buffer of the header
 */
BlockHeader.prototype._getHash = function hash() {
  var buf = this.toBuffer();
  return Hash.sha256sha256(buf);
};

var idProperty = {
  configurable: false,
  enumerable: true,
  /**
   * @returns {string} - The big endian hash buffer of the header
   */
  get: function() {
    if (!this._id) {
      this._id = BufferReader(this._getHash()).readReverse().toString('hex');
    }
    return this._id;
  },
  set: _.noop
};
Object.defineProperty(BlockHeader.prototype, 'id', idProperty);
Object.defineProperty(BlockHeader.prototype, 'hash', idProperty);

/**
 * @returns {Boolean} - If timestamp is not too far in the future
 */
BlockHeader.prototype.validTimestamp = function validTimestamp() {
  var currentTime = Math.round(new Date().getTime() / 1000);
  if (this.time > currentTime + BlockHeader.Constants.MAX_TIME_OFFSET) {
    return false;
  }
  return true;
};

/**
 * @returns {Boolean} - If the proof-of-work hash satisfies the target difficulty
 */
BlockHeader.prototype.validProofOfWork = function validProofOfWork() {
  var pow = new BN(this.id, 'hex');
  var target = this.getTargetDifficulty();

  if (pow.cmp(target) > 0) {
    return false;
  }
  return true;
};

/**
 * @returns {string} - A string formatted for the console
 */
BlockHeader.prototype.inspect = function inspect() {
  return '<BlockHeader ' + this.id + '>';
};

BlockHeader.Constants = {
  START_OF_HEADER: 8, // Start buffer position in raw block data
  MAX_TIME_OFFSET: 2 * 60 * 60, // The max a timestamp can be in the future
  LARGEST_HASH: new BN('10000000000000000000000000000000000000000000000000000000000000000', 'hex')
};

BlockHeader.SC_CERT_BLOCK_VERSION = 3;

module.exports = BlockHeader;

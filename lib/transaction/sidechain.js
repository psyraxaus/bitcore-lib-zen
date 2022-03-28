'use strict';

var _ = require('lodash');
var $ = require('../util/preconditions');
var BN = require('../crypto/bn');
var buffer = require('buffer');
var BufferWriter = require('../encoding/bufferwriter');
var BufferReader = require('../encoding/bufferreader');
var BufferUtil = require('../util/buffer');
var JSUtil = require('../util/js');

function Sidechain(params) {
  if (!(this instanceof Sidechain)) {
    return new Sidechain(params);
  }
  this.vcsw_ccin =  [];
  this.vsc_ccout = [];
  this.vft_ccout = [];
  this.vmbtr_out = [];

  if (params) {
    return this._fromObject(params);
  }
}

class Vsc_ccout {
    constructor (epoch_length, satoshis, satoshisBN, address, customData, constantData, certVk, wCeasedVk,
                 vFieldElementCertificateFieldConfig, vBitVectorCertificateFieldConfig, forwardTransferScFee,
                 forwardTransferScFeeBN, mainchainBackwardTransferScFee, mainchainBackwardTransferScFeeBN,
                 mbtrRequestDataLength, sidechainVersion) {
        this.epoch_length = epoch_length;
        this.satoshis = satoshis;
        this.satoshisBN = satoshisBN;
        this.address = address;
        this.customData = customData;
        this.constantData = constantData;
        this.certVk = certVk;
        this.wCeasedVk = wCeasedVk;
        this.vFieldElementCertificateFieldConfig = vFieldElementCertificateFieldConfig;
        this.vBitVectorCertificateFieldConfig = vBitVectorCertificateFieldConfig;
        this.forwardTransferScFee = forwardTransferScFee;
        this.forwardTransferScFeeBN = forwardTransferScFeeBN;
        this.mainchainBackwardTransferScFee = mainchainBackwardTransferScFee;
        this.mainchainBackwardTransferScFeeBN = mainchainBackwardTransferScFeeBN;
        this.mbtrRequestDataLength = mbtrRequestDataLength;
        this.sidechainVersion = sidechainVersion
    }
}

class Vft_ccout {
    constructor (satoshis,satoshisBN, address, scid, mcReturnAddress) {
      this.satoshis = satoshis;
      this.satoshisBN = satoshisBN;
      this.address = address;
      this.scid = scid;
      this.mcReturnAddress = mcReturnAddress;
    }
}

class Vmbtr_out {
  constructor (scid,vScRequestData, mcDestinationAddress, scFee, scFeeBN) {
    this.scid = scid;
    this.vScRequestData = vScRequestData;
    this.mcDestinationAddress = mcDestinationAddress;
    this.scFee = scFee;
    this.scFeeBN = scFeeBN;
  }
}

class Vcsw_ccin {
  constructor (value, valueBN, scid, nullifier, pubKeyHash, scProof, actCertDataHash, ceasingCumScTxCommTree, redeemScript) {
    this.value = value;
    this.valueBN = valueBN;
    this.scid = scid;
    this.nullifier = nullifier;
    this.pubKeyHash = pubKeyHash;
    this.scProof = scProof;
    this.actCertDataHash = actCertDataHash;
    this.ceasingCumScTxCommTree = ceasingCumScTxCommTree;
    this.redeemScript = redeemScript;
  }
}

Sidechain.fromObject = function(obj) {
  $.checkArgument(_.isObject(obj));
  var sc = new Sidechain();
  return sc._fromObject(obj);
};

Sidechain.prototype._fromObject = function(params) {
  var vcsw=[];
  _.each(params.vcsw_ccin, function(vcsw_ccin){
    var values = new Sidechain._checkAmount(vcsw_ccin.value);
    vcsw.push(new Vcsw_ccin(
      values[0],
      values[1],
      BufferUtil.reverse(new buffer.Buffer(vcsw_ccin.scId, 'hex')),
      new buffer.Buffer(vcsw_ccin.nullifier, 'hex'),
      BufferUtil.reverse(new buffer.Buffer(vcsw_ccin.pubKeyHash, 'hex')),
      new buffer.Buffer(vcsw_ccin.scProof, 'hex'),
      new buffer.Buffer(vcsw_ccin.actCertDataHash, 'hex'),
      new buffer.Buffer(vcsw_ccin.ceasingCumScTxCommTree, 'hex'),
      new buffer.Buffer(vcsw_ccin.redeemScript, 'hex')
    ));
  });
  this.vcsw_ccin = vcsw;

  var vsc=[];
  _.each(params.vsc_ccout, function (vsc_ccout){
    var amounts = new Sidechain._checkAmount(vsc_ccout.satoshis);
    var amountsforwardTransferScFee = new Sidechain._checkAmount(vsc_ccout.forwardTransferScFee);
    var amountsmainchainBackwardTransferScFee = new Sidechain._checkAmount(vsc_ccout.mainchainBackwardTransferScFee);
    vsc.push(new Vsc_ccout(
      vsc_ccout.epoch_length,
      amounts[0],
      amounts[1],
      BufferUtil.reverse(new buffer.Buffer(vsc_ccout.address, 'hex')),
      new buffer.Buffer(vsc_ccout.customData, 'hex'),
      vsc_ccout.constantData ? new buffer.Buffer(vsc_ccout.constantData, 'hex') : undefined,
      new buffer.Buffer(vsc_ccout.certVk, 'hex'),
      vsc_ccout.wCeasedVk ? new buffer.Buffer(vsc_ccout.wCeasedVk, 'hex') : undefined,
      vsc_ccout.vFieldElementCertificateFieldConfig,
      vsc_ccout.vBitVectorCertificateFieldConfig,
      amountsforwardTransferScFee[0],
      amountsforwardTransferScFee[1],
      amountsmainchainBackwardTransferScFee[0],
      amountsmainchainBackwardTransferScFee[1],
      vsc_ccout.mbtrRequestDataLength,
      vsc_ccout.sidechainVersion
      ));
   });
  this.vsc_ccout = vsc;

  var vft=[];
  _.each(params.vft_ccout, function (vft_ccout){
        var amounts = new Sidechain._checkAmount(vft_ccout.satoshis);
        vft.push(new Vft_ccout(
            amounts[0],
            amounts[1],
            BufferUtil.reverse(new buffer.Buffer(vft_ccout.address, 'hex')),
            BufferUtil.reverse(new buffer.Buffer(vft_ccout.scid, 'hex')),
            BufferUtil.reverse(new buffer.Buffer(vft_ccout.mcReturnAddress, 'hex'))
            )
         );
  });
  this.vft_ccout = vft;

  var vmbtr=[];
  _.each(params.vmbtr_out, function(vmbtr_out) {
    var fee = new Sidechain._checkAmount(vmbtr_out.scFee);
    vmbtr.push(new Vmbtr_out(
        BufferUtil.reverse(new buffer.Buffer(vmbtr_out.scid, 'hex')),
        vmbtr_out.vScRequestData,
        BufferUtil.reverse(new Buffer(vmbtr_out.mcDestinationAddress, 'hex')),
        fee[0],
        fee[1]
    ));
  });
  this.vmbtr_out = vmbtr;

  return this;
};


Sidechain._checkAmount = function(num) {
  var satoshis;
  var satoshisBN;
  if (num instanceof BN) {
        satoshisBN = num;
        satoshis = num.toNumber();
      } else if (_.isString(num)) {
        satoshis = parseInt(num);
        satoshisBN = BN.fromNumber(satoshis);
      } else {
        $.checkArgument(
          JSUtil.isNaturalNumber(num),
          'Output amount is not a natural number'
        );
        satoshisBN = BN.fromNumber(num);
        satoshis = num;
      }
      $.checkState(
        JSUtil.isNaturalNumber(satoshis),
        'Output satoshis is not a natural number'
      );
  return [satoshis,satoshisBN];
};



Sidechain.fromBufferReader = function(br) {
  var i,j,y;
  var sc = new Sidechain();

  var withdrawal_epoch_length, satoshisBN, satoshis, address, mcReturnAddress, customData_len, customData,
      constantData_len, constantData, constantData_option, certVk, certVk_len,
      wCeasedVk_len, wCeasedVk, wCeasedVk_option, value, valueBN, scid, len_nullifier, nullifier,
      len_proof, proof, len_actCertDataHash, actCertDataHash, len_ceasingCumScTxCommTree, ceasingCumScTxCommTree,
      len_redeemScript, redeemScript,
      vFieldElementCertificateFieldConfig_len,
      vBitVectorCertificateFieldConfig_len,
      forwardTransferScFee,
      forwardTransferScFeeBN,
      mainchainBackwardTransferScFee,
      mainchainBackwardTransferScFeeBN,
      mbtrRequestDataLength, pubKeyHash, scFee, scFeeBN, sidechainVersion;

  var vFieldElementCertificateFieldConfig = [];
  var vBitVectorCertificateFieldConfig = [];

  //Read Vcsw
  var n_vcsw = br.readVarintNum();
  for (i=0; i<n_vcsw; i++) {
    let tmp = this._checkAmount(br.readUInt64LEBN());
    value = tmp[0];
    valueBN = tmp[1];
    scid =  br.read(32);
    len_nullifier = br.readVarintNum();
    nullifier = br.read(len_nullifier);
    pubKeyHash = br.read(20);
    len_proof = br.readVarintNum();
    proof = br.read(len_proof);
    len_actCertDataHash = br.readVarintNum();
    actCertDataHash = br.read(len_actCertDataHash);
    len_ceasingCumScTxCommTree = br.readVarintNum();
    ceasingCumScTxCommTree = br.read(len_ceasingCumScTxCommTree);
    len_redeemScript = br.readVarintNum();
    redeemScript = br.read(len_redeemScript);

    var csw = new Vcsw_ccin(value, valueBN, scid, nullifier, pubKeyHash, proof, actCertDataHash, ceasingCumScTxCommTree, redeemScript);
    sc.vcsw_ccin.push(csw);
  }

  // Read Vsc_ccout
  var n_vsc = br.readVarintNum();
  for (i = 0; i < n_vsc; i++) {
    withdrawal_epoch_length = br.read(3).readUIntLE(0,3)
    sidechainVersion = br.readUInt8();
    let tmp = this._checkAmount(br.readUInt64LEBN());
    satoshis = tmp[0];
    satoshisBN = tmp[1];
    address = br.read(32);
    customData_len = br.readVarintNum();
    customData = br.read(customData_len);
    constantData_option = br.readVarintNum();
    if (constantData_option === 1) {
      constantData_len = br.readVarintNum();
      constantData = br.read(constantData_len);
    }
    certVk_len = br.readVarintNum();
    certVk = br.read(certVk_len);
    wCeasedVk_option = br.readVarintNum();
    if (wCeasedVk_option === 1) {
      wCeasedVk_len = br.readVarintNum();
      wCeasedVk = br.read(wCeasedVk_len);
    }
    vFieldElementCertificateFieldConfig_len = br.readVarintNum();
    for (j = 0; j < vFieldElementCertificateFieldConfig_len; j++) {
      vFieldElementCertificateFieldConfig.push(br.readUInt8());
    }
    vBitVectorCertificateFieldConfig_len = br.readVarintNum();
    for (y = 0; y < vBitVectorCertificateFieldConfig_len; y++) {
      var vBitVectorCertificateFieldConfig_bitVector = br.readUInt32LE();
      var vBitVectorCertificateFieldConfig_maxCompressedSize = br.readUInt32LE();
      vBitVectorCertificateFieldConfig.push([vBitVectorCertificateFieldConfig_bitVector, vBitVectorCertificateFieldConfig_maxCompressedSize]);
    }
    tmp = this._checkAmount(br.readUInt64LEBN());
    forwardTransferScFee = tmp[0];
    forwardTransferScFeeBN = tmp[1];
    tmp = this._checkAmount(br.readUInt64LEBN());
    mainchainBackwardTransferScFee = tmp[0];
    mainchainBackwardTransferScFeeBN = tmp[1];
    mbtrRequestDataLength = br.readUInt8();

    var vsc = new Vsc_ccout(withdrawal_epoch_length, satoshis, satoshisBN, address, customData, constantData, certVk,
        wCeasedVk, vFieldElementCertificateFieldConfig, vBitVectorCertificateFieldConfig, forwardTransferScFee, forwardTransferScFeeBN,
        mainchainBackwardTransferScFee, mainchainBackwardTransferScFeeBN, mbtrRequestDataLength, sidechainVersion);
    sc.vsc_ccout.push(vsc);
  }

  // Read Vft_ccout
  var n_vft = br.readVarintNum();
  for (i = 0; i < n_vft; i++) {
    var tmp = this._checkAmount(br.readUInt64LEBN());
    satoshis = tmp[0];
    satoshisBN = tmp[1];
    address = br.read(32);
    scid = br.read(32);
    mcReturnAddress = br.read(20);
    var vft = new Vft_ccout(satoshis, satoshisBN, address, scid, mcReturnAddress);
    sc.vft_ccout.push(vft);
  }

  var n_vmbtr_out = br.readVarintNum();

  for (i=0; i<n_vmbtr_out; i++) {
    scid = br.read(32);
    var n_vScRequestData = br.readVarintNum();
    var vScRequestData = [];
    for (j = 0; j < n_vScRequestData; j++) {
      var len_vScRequestData = br.readVarintNum();
      vScRequestData.push(br.read(len_vScRequestData));
    }
    pubKeyHash = br.read(20);
    let tmp = this._checkAmount(br.readUInt64LEBN());
    scFee = tmp[0];
    scFeeBN = tmp[1];
    var vmbtr = new Vmbtr_out(scid, vScRequestData, pubKeyHash, scFee, scFeeBN);
    sc.vmbtr_out.push(vmbtr);
  }
  return sc;
};

Sidechain.prototype.toObject = Sidechain.prototype.toJSON = function toObject() {
  var vcsw_ccins = [];
  _.each(this.vcsw_ccin, function(vcsw_ccin) {
    var obj = {};
    obj.value = vcsw_ccin.value;
    obj.scId = BufferUtil.reverse(vcsw_ccin.scid).toString('hex');
    obj.nullifier = vcsw_ccin.nullifier.toString('hex');
    obj.scProof = vcsw_ccin.scProof.toString('hex');
    obj.actCertDataHash = vcsw_ccin.actCertDataHash.toString('hex');
    obj.ceasingCumScTxCommTree = vcsw_ccin.ceasingCumScTxCommTree.toString('hex');
    obj.redeemScript = vcsw_ccin.redeemScript.toString('hex');
    obj.pubKeyHash = BufferUtil.reverse(vcsw_ccin.pubKeyHash).toString('hex');
    vcsw_ccins.push(obj);
  });

  var vsc_ccouts = [];
  _.each(this.vsc_ccout, function(vsc_ccout) {
    var obj = {};
    obj.epoch_length = vsc_ccout.epoch_length;
    obj.satoshis = vsc_ccout.satoshis;
    obj.satoshisBN = vsc_ccout.satoshisBN;
    obj.address = BufferUtil.reverse(vsc_ccout.address).toString('hex');
    obj.certVk = vsc_ccout.certVk.toString('hex');
    obj.customData = vsc_ccout.customData.toString('hex');
    if (vsc_ccout.constantData) {
      obj.constantData = vsc_ccout.constantData.toString('hex');
    }
    if (vsc_ccout.wCeasedVk) {
      obj.wCeasedVk = vsc_ccout.wCeasedVk.toString('hex');
    }
    obj.vFieldElementCertificateFieldConfig =  vsc_ccout.vFieldElementCertificateFieldConfig;
    obj.vBitVectorCertificateFieldConfig = vsc_ccout.vBitVectorCertificateFieldConfig;
    obj.forwardTransferScFee = vsc_ccout.forwardTransferScFee;
    obj.forwardTransferScFeeBN = vsc_ccout.forwardTransferScFeeBN;
    obj.mainchainBackwardTransferScFee = vsc_ccout.mainchainBackwardTransferScFee;
    obj.mainchainBackwardTransferScFeeBN = vsc_ccout.mainchainBackwardTransferScFeeBN;
    obj.mbtrRequestDataLength = vsc_ccout.mbtrRequestDataLength;
    obj.sidechainVersion = vsc_ccout.sidechainVersion;
    vsc_ccouts.push(obj);
  });

  var vft_ccouts = [];
  _.each(this.vft_ccout, function(vft_ccout) {
    var obj = {};
    obj.satoshis = vft_ccout.satoshis;
    obj.address = BufferUtil.reverse(vft_ccout.address).toString('hex');
    obj.scid = BufferUtil.reverse(vft_ccout.scid).toString('hex');
    obj.mcReturnAddress = BufferUtil.reverse(vft_ccout.mcReturnAddress).toString('hex');
    vft_ccouts.push(obj);
  });

  var vmbtr_outs = [];
  _.each(this.vmbtr_out, function(vmbtr_out) {
    var obj = {};
    obj.scid = BufferUtil.reverse(vmbtr_out.scid).toString('hex');
    obj.vScRequestData = vmbtr_out.vScRequestData;
    obj.mcDestinationAddress = BufferUtil.reverse(vmbtr_out.mcDestinationAddress).toString('hex');
    obj.scFee = vmbtr_out.scFee;
    obj.scFeeBN = vmbtr_out.scFeeBN;
    vmbtr_outs.push(obj);
  });

  return {
    vcsw_ccin: vcsw_ccins,
    vsc_ccout: vsc_ccouts,
    vft_ccout: vft_ccouts,
    vmbtr_out: vmbtr_outs
  };
};


Sidechain.prototype.toBufferWriter = function(writer) {
  var i;
  if (!writer) {
    writer = new BufferWriter();
  }
  //Write vcsw size
  writer.writeVarintNum(this.vcsw_ccin.length);
  //Write every vcsw
  for (i = 0; i < this.vcsw_ccin.length; i++) {
    writer.writeUInt64LEBN(this.vcsw_ccin[i].valueBN);
    writer.write(this.vcsw_ccin[i].scid);
    writer.writeVarintNum(this.vcsw_ccin[i].nullifier.length);
    writer.write(this.vcsw_ccin[i].nullifier);
    writer.write(this.vcsw_ccin[i].pubKeyHash);
    writer.writeVarintNum(this.vcsw_ccin[i].scProof.length);
    writer.write(this.vcsw_ccin[i].scProof);
    writer.writeVarintNum(this.vcsw_ccin[i].actCertDataHash.length);
    writer.write(this.vcsw_ccin[i].actCertDataHash);
    writer.writeVarintNum(this.vcsw_ccin[i].ceasingCumScTxCommTree.length);
    writer.write(this.vcsw_ccin[i].ceasingCumScTxCommTree);
    writer.writeVarintNum(this.vcsw_ccin[i].redeemScript.length);
    writer.write(this.vcsw_ccin[i].redeemScript);
  }

  //Write vsc size
  writer.writeVarintNum(this.vsc_ccout.length);
  //Write every vsc
  for (i = 0; i < this.vsc_ccout.length; i++) {
    let epoch_length_buf = Buffer(3)
    epoch_length_buf.writeUIntLE(this.vsc_ccout[i].epoch_length, 0, 3)
    writer.write(epoch_length_buf)
    writer.writeUInt8(this.vsc_ccout[i].sidechainVersion)
    writer.writeUInt64LEBN(this.vsc_ccout[i].satoshisBN);
    writer.write(this.vsc_ccout[i].address);
    writer.writeVarintNum(this.vsc_ccout[i].customData.length);
    writer.write(this.vsc_ccout[i].customData);
    if (this.vsc_ccout[i].constantData) {
      writer.writeVarintNum(1);
      writer.writeVarintNum(this.vsc_ccout[i].constantData.length);
      writer.write(this.vsc_ccout[i].constantData);
    } else {
      writer.writeVarintNum(0);
    }
    writer.writeVarintNum(this.vsc_ccout[i].certVk.length);
    writer.write(this.vsc_ccout[i].certVk);

    if (this.vsc_ccout[i].wCeasedVk) {
      writer.writeVarintNum(1);
      writer.writeVarintNum(this.vsc_ccout[i].wCeasedVk.length);
      writer.write(this.vsc_ccout[i].wCeasedVk);
    } else {
      writer.writeVarintNum(0);
    }

    writer.writeVarintNum(this.vsc_ccout[i].vFieldElementCertificateFieldConfig.length);
    for (var el of this.vsc_ccout[i].vFieldElementCertificateFieldConfig) {
      writer.writeUInt8(el);
    }
    writer.writeVarintNum(this.vsc_ccout[i].vBitVectorCertificateFieldConfig.length);
    for (var el of this.vsc_ccout[i].vBitVectorCertificateFieldConfig) {
      writer.writeInt32LE(el[0]);
      writer.writeInt32LE(el[1]);
    }
    writer.writeUInt64LEBN(this.vsc_ccout[i].forwardTransferScFeeBN);
    writer.writeUInt64LEBN(this.vsc_ccout[i].mainchainBackwardTransferScFeeBN);
    writer.writeUInt8(this.vsc_ccout[i].mbtrRequestDataLength);
  }

  //Write vft size
  writer.writeVarintNum(this.vft_ccout.length);
  //Write every vft
  for (i = 0; i < this.vft_ccout.length; i++) {
    writer.writeUInt64LEBN(this.vft_ccout[i].satoshisBN);
    writer.write(this.vft_ccout[i].address);
    writer.write(this.vft_ccout[i].scid);
    writer.write(this.vft_ccout[i].mcReturnAddress);
  }

  //Write vmbtr_out size
  writer.writeVarintNum(this.vmbtr_out.length);
  //Write every vmbtr_out
  for (i = 0; i < this.vmbtr_out.length; i++) {
    writer.write(this.vmbtr_out[i].scid);
    writer.writeVarintNum(this.vmbtr_out[i].vScRequestData.length);
    for (var el of this.vmbtr_out[i].vScRequestData) {
      writer.writeVarintNum(el.length);
      writer.write(el);
    }
    writer.write(this.vmbtr_out[i].mcDestinationAddress);
    writer.writeUInt64LEBN(this.vmbtr_out[i].scFeeBN);
  }
  return writer;
};

module.exports = Sidechain;

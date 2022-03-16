"use strict";

var Transaction = require ("../../lib/transaction");
var assert = require('chai').assert;
var txes = require('../data_tx/tx.json');

const revert = function(pubkey) {
    var pubkeyhash = ""
    var i = pubkey.length-1
    while(i>0){
        pubkeyhash+=pubkey[i-1]+pubkey[i]
        i=i-2
    }
    return pubkeyhash
}

describe('#Sidechain transactions', function() {

  describe('SC_create/FT/VMBTR', function() {
    var index = 0;
    txes.forEach(function(ele) {

      it('vector #' + index+": "+ele.description, function() {

          var hexa = ele.hex;
          var tx=Transaction(hexa);
          var txJson = ele.json;
          //version
          assert.equal(tx.version,txJson.version);

          //txid
          assert.equal(tx.hash,txJson.txid);

          //locktime
          assert.equal(tx.nLockTime,txJson.locktime);

          //vin
          assert.equal(tx.inputs.length,txJson.vin.length);
          for (var i=0; i<txJson.vin.length;i++) {
            assert.equal(tx.inputs[i].toObject().prevTxId,txJson.vin[i].txid);
            assert.equal(tx.inputs[i].toObject().sequenceNumber,txJson.vin[i].sequence);
            assert.equal(tx.inputs[i].toObject().outputIndex,txJson.vin[i].vout);
          }

          //vout
          assert.equal(tx.outputs.length,txJson.vout.length);
          for (var i=0; i<txJson.vout.length;i++) {
            assert.equal(tx.outputs[i].toObject().satoshis,txJson.vout[i].valueZat);
          }

          //Sidechain
          var scParamsObject = tx.sc_params.toObject();
          var sc = {
            vsc_ccout : scParamsObject.vsc_ccout,
            vft_ccout : scParamsObject.vft_ccout,
            vcsw_ccin : scParamsObject.vcsw_ccin,
            vmbtr_out : scParamsObject.vmbtr_out
          };

          //vcsw
          assert.equal(sc.vcsw_ccin.length,txJson.vcsw_ccin.length);
          for (var i=0; i<txJson.vcsw_ccin.length; i++) {
              assert.equal(sc.vcsw_ccin[i].value / 1e8,txJson.vcsw_ccin[i].value);
              assert.equal(sc.vcsw_ccin[i].scId,txJson.vcsw_ccin[i].scId);
              assert.equal(sc.vcsw_ccin[i].nullifier,txJson.vcsw_ccin[i].nullifier);
              assert.equal(sc.vcsw_ccin[i].scProof,txJson.vcsw_ccin[i].scProof);
              assert.equal(sc.vcsw_ccin[i].actCertDataHash,txJson.vcsw_ccin[i].actCertDataHash);
              assert.equal(sc.vcsw_ccin[i].ceasingCumScTxCommTree,txJson.vcsw_ccin[i].ceasingCumScTxCommTree);
              assert.equal(sc.vcsw_ccin[i].redeemScript,txJson.vcsw_ccin[i].redeemScript.hex);
              assert.equal(sc.vcsw_ccin[i].pubKeyHash,revert(txJson.vcsw_ccin[i].scriptPubKey.asm.split(" ")[2]));
          }

          //vsc_ccout
          assert.equal(sc.vsc_ccout.length,txJson.vsc_ccout.length);
          for (var i=0; i<txJson.vsc_ccout.length;i++) {
            //assert.equal(Transaction.calculateSidechainId(tx.hash, i), txJson.vsc_ccout[i].scid);
            assert.equal(sc.vsc_ccout[i].epoch_length,txJson.vsc_ccout[i]["withdrawal epoch length"]);
            assert.equal(sc.vsc_ccout[i].satoshis / 1e8,txJson.vsc_ccout[i].value);
            assert.equal(sc.vsc_ccout[i].address,txJson.vsc_ccout[i].address);
            assert.equal(sc.vsc_ccout[i].customData,txJson.vsc_ccout[i].customData);
            assert.equal(sc.vsc_ccout[i].certVk,txJson.vsc_ccout[i].wCertVk);
            assert.equal(sc.vsc_ccout[i].constantData,txJson.vsc_ccout[i].constant);
            assert.equal(sc.vsc_ccout[i].wCeasedVk,txJson.vsc_ccout[i].wCeasedVk);
            assert.deepEqual(sc.vsc_ccout[i].vFieldElementCertificateFieldConfig,txJson.vsc_ccout[i].vFieldElementCertificateFieldConfig);
            assert.equal(sc.vsc_ccout[i].vBitVectorCertificateFieldConfig.length,txJson.vsc_ccout[i].vBitVectorCertificateFieldConfig.length);
            for (var j=0; j<txJson.vsc_ccout[i].vBitVectorCertificateFieldConfig.length; j++) {
                assert.deepEqual(sc.vsc_ccout[i].vBitVectorCertificateFieldConfig[j],txJson.vsc_ccout[i].vBitVectorCertificateFieldConfig[j]);
            }
            assert.equal(sc.vsc_ccout[i].forwardTransferScFee / 1e8,txJson.vsc_ccout[i].ftScFee);
            assert.equal(sc.vsc_ccout[i].mainchainBackwardTransferScFee/ 1e8,txJson.vsc_ccout[i].mbtrScFee);
            assert.equal(sc.vsc_ccout[i].mbtrRequestDataLength,txJson.vsc_ccout[i].mbtrRequestDataLength);
            assert.equal(sc.vsc_ccout[i].sidechainVersion,txJson.vsc_ccout[i].sidechainVersion);
          }

          //vft_ccout
          assert.equal(sc.vft_ccout.length,txJson.vft_ccout.length);
          for (var i=0; i<txJson.vft_ccout.length;i++) {
            assert.equal(sc.vft_ccout[i].scid,txJson.vft_ccout[i].scid);
            assert.equal(tx.sc_params.vft_ccout[i].satoshis / 1e8,txJson.vft_ccout[i].value);
            assert.equal(sc.vft_ccout[i].address,txJson.vft_ccout[i].address);
          }

          //vmbtr_out
          assert.equal(sc.vmbtr_out.length,txJson.vmbtr_out.length);
          for (var i=0; i<txJson.vmbtr_out.length;i++) {
              assert.equal(sc.vmbtr_out[i].scid,txJson.vmbtr_out[i].scid);
              assert.equal(tx.sc_params.vmbtr_out[i].scFee / 1e8,txJson.vmbtr_out[i].scFee);
              assert.equal(sc.vmbtr_out[i].mcDestinationAddress,txJson.vmbtr_out[i].mcDestinationAddress.pubkeyhash);
              assert.equal(sc.vmbtr_out[i].vScRequestData.length,txJson.vmbtr_out[i].vScRequestData.length);
          }

          //serialize
          assert.equal(tx.toBuffer().toString('hex'),hexa);

          //create transaction from existing transaction
          var new_Tx =  Transaction(tx.toObject());
          assert.equal(new_Tx.toBuffer().toString('hex'),tx.toBuffer().toString('hex'));

      });
      index++;
    });
  });

});

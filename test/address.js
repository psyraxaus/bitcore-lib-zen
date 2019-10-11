'use strict';

/* jshint maxstatements: 30 */

var chai = require('chai');
var should = chai.should();
var expect = chai.expect;

var bitcore = require('..');
var PublicKey = bitcore.PublicKey;
var Address = bitcore.Address;
var Script = bitcore.Script;
var Networks = bitcore.Networks;

var validbase58 = require('./data/zend/base58_keys_valid.json');
var invalidbase58 = require('./data/zend/base58_keys_invalid.json');

describe('Address', function() {

  var pubkeyhash = new Buffer('1b3d8caa6652e1c62b2159c267633f66989a650e', 'hex');
  var buf = Buffer.concat([new Buffer('2089', 'hex'), pubkeyhash]);
  var str = 'znTZwy8vXTTa3VaeCpLRwirbnG53oeSHDXR';

  it('can\'t build without data', function() {
    (function() {
      return new Address();
    }).should.throw('First argument is required, please include address data.');
  });

  it('should throw an error because of bad network param', function() {
    (function() {
      return new Address(PKHLivenet[0], 'main', 'pubkeyhash');
    }).should.throw('Second argument must be "livenet" or "testnet".');
  });

  it('should throw an error because of bad type param', function() {
    (function() {
      return new Address(PKHLivenet[0], 'livenet', 'pubkey');
    }).should.throw('Third argument must be "pubkeyhash" or "scripthash"');
  });

  describe('zend compliance', function() {
    validbase58.map(function(d) {
      if (!d[2].isPrivkey) {
        it('should describe address ' + d[0] + ' as valid', function() {
          var type;
          if (d[2].addrType === 'script') {
            type = 'scripthash';
          } else if (d[2].addrType === 'pubkey') {
            type = 'pubkeyhash';
          }
          var network = 'livenet';
          if (d[2].isTestnet) {
            network = 'testnet';
          }
          return new Address(d[0], network, type);
        });
      }
    });
    invalidbase58.map(function(d) {
      it('should describe input ' + d[0].slice(0, 10) + '... as invalid', function() {
        expect(function() {
          return new Address(d[0]);
        }).to.throw(Error);
      });
    });
  });

  // livenet valid
  var PKHLivenet = [
    'znVXr3oGic8pL1F4VD1TxC2pMPFEixPNWde',
    'znk6MAAbzc8jqpSeJJ3aEp4UDjYoyjTL8c5',
    'znhPgs675tX4wJCSQgUYfPFrNx5ge5uXZit',
    'znWQWYuhsX7fHoL4u8PJ2BJ3h5cFzBxvZEC',
    '    znXYMxERfXaXAR7v7jwueq9PSdijUB8xm93   \t\n'
  ];

  // livenet p2sh
  var P2SHLivenet = [
    'zsre9tnivehETgRgfuJSvJKTQma4RMT9pK8',
    'zssr1ezniBHYNcHp8jvCRaqHQPwgLQgx5R4',
    'zsqJ3GBmCcghtipcNK6uNDbQRxrbuyrWjRU',
    'zszpcLB6C5B8QvfDbF2dYWXsrpac5DL9WRk',
    '\t \nzsxWnyDbU8pk2Vp98Uvkx5Nh33RFzqnCpWN \r'
  ];

  // testnet p2sh
  var P2SHTestnet = [
    'zrFzxutppvxEdjyu4QNjogBMjtC1py9Hp1S',
    'zrS7QUB2eDbbKvyP43VJys3t7RpojW8GdxH',
    'zrFr5HVm7woVq3oFzkMEdJdbfBchfPAPDsP',
    'zrQtZ3M8zYjUdZ4UPVWWZmWQLYiKex5uKmt'
  ];

  //livenet bad checksums
  var badChecksums = [
    '15vkcKf7gB23wLAnZLmbVuMiiVDc3nq4a2',
    '1A6ut1tWnUq1SEQLMr4ttDh24wcbj4w2TT',
    '1BpbpfLdY7oBS9gK7aDXgvMgr1DpvNH3B2',
    '1Jz2yCRd5ST1p2gUqFB5wsSQfdmEJaffg7'
  ];

  //livenet non-base58
  var nonBase58 = [
    '15vkcKf7g#23wLAnZLmb$uMiiVDc3nq4a2',
    '1A601ttWnUq1SEQLMr4ttDh24wcbj4w2TT',
    '1BpbpfLdY7oBS9gK7aIXgvMgr1DpvNH3B2',
    '1Jz2yCRdOST1p2gUqFB5wsSQfdmEJaffg7'
  ];

  //testnet valid
  var PKHTestnet = [
    'ztZGVZsRyggQ5p3rhKsmsqVzHL25is657pc',
    'ztgCyiDxD2QE6vt7rnM8nTCDYKd2oGmaaEQ',
    'ztTmASJS5XKMHcZNkYbhpEbgspaEwLMRjnp',
    'zteVkGLZba9We19FyJZhpJGz8KiJgJeANfZ'
  ];

  describe('validation', function() {

    it('getValidationError detects network mismatchs', function() {
      var error = Address.getValidationError('znWGBSQgMZgVn8wqYB2qPpktQ49KESWZQLh', 'testnet');
      should.exist(error);
    });

    it('isValid returns true on a valid address', function() {
      var valid = Address.isValid('znWGBSQgMZgVn8wqYB2qPpktQ49KESWZQLh', 'livenet');
      valid.should.equal(true);
    });

    it('isValid returns false on network mismatch', function() {
      var valid = Address.isValid('znWGBSQgMZgVn8wqYB2qPpktQ49KESWZQLh', 'testnet');
      valid.should.equal(false);
    });

    it('validates correctly the P2PKH test vector', function() {
      for (var i = 0; i < PKHLivenet.length; i++) {
        var error = Address.getValidationError(PKHLivenet[i]);
        should.not.exist(error);
      }
    });

    it('validates correctly the P2SH test vector', function() {
      for (var i = 0; i < P2SHLivenet.length; i++) {
        var error = Address.getValidationError(P2SHLivenet[i]);
        should.not.exist(error);
      }
    });

    it('validates correctly the P2SH testnet test vector', function() {
      for (var i = 0; i < P2SHTestnet.length; i++) {
        var error = Address.getValidationError(P2SHTestnet[i], 'testnet');
        should.not.exist(error);
      }
    });

    it('rejects correctly the P2PKH livenet test vector with "testnet" parameter', function() {
      for (var i = 0; i < PKHLivenet.length; i++) {
        var error = Address.getValidationError(PKHLivenet[i], 'testnet');
        should.exist(error);
      }
    });

    it('validates correctly the P2PKH livenet test vector with "livenet" parameter', function() {
      for (var i = 0; i < PKHLivenet.length; i++) {
        var error = Address.getValidationError(PKHLivenet[i], 'livenet');
        should.not.exist(error);
      }
    });

    it('should not validate if checksum is invalid', function() {
      for (var i = 0; i < badChecksums.length; i++) {
        var error = Address.getValidationError(badChecksums[i], 'livenet', 'pubkeyhash');
        should.exist(error);
        error.message.should.equal('Checksum mismatch');
      }
    });

    it('should not validate on a network mismatch', function() {
      var error, i;
      for (i = 0; i < PKHLivenet.length; i++) {
        error = Address.getValidationError(PKHLivenet[i], 'testnet', 'pubkeyhash');
        should.exist(error);
        error.message.should.equal('Address has mismatched network type.');
      }
      for (i = 0; i < PKHTestnet.length; i++) {
        error = Address.getValidationError(PKHTestnet[i], 'livenet', 'pubkeyhash');
        should.exist(error);
        error.message.should.equal('Address has mismatched network type.');
      }
    });

    it('should not validate on a type mismatch', function() {
      for (var i = 0; i < PKHLivenet.length; i++) {
        var error = Address.getValidationError(PKHLivenet[i], 'livenet', 'scripthash');
        should.exist(error);
        error.message.should.equal('Address has mismatched type.');
      }
    });

    it('should not validate on non-base58 characters', function() {
      for (var i = 0; i < nonBase58.length; i++) {
        var error = Address.getValidationError(nonBase58[i], 'livenet', 'pubkeyhash');
        should.exist(error);
        error.message.should.equal('Non-base58 character');
      }
    });

    it('testnet addresses are validated correctly', function() {
      for (var i = 0; i < PKHTestnet.length; i++) {
        var error = Address.getValidationError(PKHTestnet[i], 'testnet');
        should.not.exist(error);
      }
    });

    it('addresses with whitespace are validated correctly', function() {
      var ws = '  \r \t    \n znpEfn3p2GPdQ78YM2nqsiXcQVhgsWnqK1T \t \n            \r';
      var error = Address.getValidationError(ws);
      should.not.exist(error);
      Address.fromString(ws).toString().should.equal('znpEfn3p2GPdQ78YM2nqsiXcQVhgsWnqK1T');
    });
  });

  describe('instantiation', function() {
    it('can be instantiated from another address', function() {
      var address = Address.fromBuffer(buf);
      var address2 = new Address({
        hashBuffer: address.hashBuffer,
        network: address.network,
        type: address.type
      });
      address.toString().should.equal(address2.toString());
    });
  });

  describe('encodings', function() {

    it('should make an address from a buffer', function() {
      Address.fromBuffer(buf).toString().should.equal(str);
      new Address(pubkeyhash).toString().should.equal(str);
    });

    it('should make an address from a string', function() {
      Address.fromString(str).toString().should.equal(str);
      new Address(str).toString().should.equal(str);
    });

    it('should make an address using a non-string network', function() {
      Address.fromString(str, Networks.livenet).toString().should.equal(str);
    });

    it('should error because of unrecognized data format', function() {
      (function() {
        return new Address(new Error());
      }).should.throw(bitcore.errors.InvalidArgument);
    });

    it('should error because of incorrect format for pubkey hash', function() {
      (function() {
        return new Address.fromPublicKeyHash('notahash');
      }).should.throw('Address supplied is not a buffer.');
    });

    it('should error because of incorrect format for script hash', function() {
      (function() {
        return new Address.fromScriptHash('notascript');
      }).should.throw('Address supplied is not a buffer.');
    });

    it('should error because of incorrect type for transform buffer', function() {
      (function() {
        return Address._transformBuffer('notabuffer');
      }).should.throw('Address supplied is not a buffer.');
    });

    it('should error because of incorrect length buffer for transform buffer', function() {
      (function() {
        return Address._transformBuffer(new Buffer(21));
      }).should.throw('Address buffers must be exactly 22 bytes.');
    });

    it('should error because of incorrect type for pubkey transform', function() {
      (function() {
        return Address._transformPublicKey(new Buffer(20));
      }).should.throw('Address must be an instance of PublicKey.');
    });

    it('should error because of incorrect type for script transform', function() {
      (function() {
        return Address._transformScript(new Buffer(20));
      }).should.throw('Invalid Argument: script must be a Script instance');
    });

    it('should error because of incorrect type for string transform', function() {
      (function() {
        return Address._transformString(new Buffer(20));
      }).should.throw('data parameter supplied is not a string.');
    });

    it('should make an address from a pubkey hash buffer', function() {
      var hash = pubkeyhash; //use the same hash
      var a = Address.fromPublicKeyHash(hash, 'livenet');
      a.network.should.equal(Networks.livenet);
      a.toString().should.equal(str);
      var b = Address.fromPublicKeyHash(hash, 'testnet');
      b.network.should.equal(Networks.testnet);
      b.type.should.equal('pubkeyhash');
      new Address(hash, 'livenet').toString().should.equal(str);
    });

    it('should make an address using the default network', function() {
      var hash = pubkeyhash; //use the same hash
      var network = Networks.defaultNetwork;
      Networks.defaultNetwork = Networks.livenet;
      var a = Address.fromPublicKeyHash(hash);
      a.network.should.equal(Networks.livenet);
      // change the default
      Networks.defaultNetwork = Networks.testnet;
      var b = Address.fromPublicKeyHash(hash);
      b.network.should.equal(Networks.testnet);
      // restore the default
      Networks.defaultNetwork = network;
    });

    it('should throw an error for invalid length hashBuffer', function() {
      (function() {
        return Address.fromPublicKeyHash(buf);
      }).should.throw('Address hashbuffers must be exactly 20 bytes.');
    });

    it('should make this address from a compressed pubkey', function() {
      var pubkey = new PublicKey('02657b29d23d1bf13105d28886580d31d8296bd3f8c7e6770bbc2ea8d96ce9f3f4');
      var address = Address.fromPublicKey(pubkey, 'livenet');
      address.toString().should.equal('znpEfn3p2GPdQ78YM2nqsiXcQVhgsWnqK1T');
    });

    it('should use the default network for pubkey', function() {
      var pubkey = new PublicKey('02657b29d23d1bf13105d28886580d31d8296bd3f8c7e6770bbc2ea8d96ce9f3f4');
      var address = Address.fromPublicKey(pubkey);
      address.network.should.equal(Networks.defaultNetwork);
    });

    it('should make this address from an uncompressed pubkey', function() {
      var pubkey = new PublicKey('04D20B7EC75B42784C8C1ACDA77A8C45ECA1103D41FA10D07233302F7972CEC028D' +
        '27BB2DD203E49D27AC9166BE41560CE8BCC810EAA3E4D9CA8C045F07CB83C3C');
      var a = Address.fromPublicKey(pubkey, 'livenet');
      a.toString().should.equal('znj8TmAK26wr7mybEsfmTpgaVTNC6aAFzyz');
      var b = new Address(pubkey, 'livenet', 'pubkeyhash');
      b.toString().should.equal('znj8TmAK26wr7mybEsfmTpgaVTNC6aAFzyz');
    });

    it('should classify from a custom network', function() {
      var custom = {
        name: 'customnetwork', //zcash parama
        pubkeyhash: 0x1cb8,
        privatekey: 0x80,
        scripthash: 0x1cbd,
        xpubkey: 0x0488b21e,
        xprivkey: 0x0488ade4,
        networkMagic: 0x24e92764,
        port: 8233
      };
      var addressString = 't1RpVHbKjBRjWzN2m4y6eBuYsCzSaNbAssP';
      Networks.add(custom);
      var network = Networks.get('customnetwork');
      var address = Address.fromString(addressString);
      address.type.should.equal(Address.PayToPublicKeyHash);
      address.network.should.equal(network);
      Networks.remove(network);
    });

    describe('from a script', function() {
      it('should fail to build address from a non p2sh,p2pkh script', function() {
        var s = new Script('OP_CHECKMULTISIG');
        (function() {
          return new Address(s);
        }).should.throw('needs to be p2pkh in, p2pkh out, p2sh in, or p2sh out');
      });

      it('should make this address from a p2pkh output script', function() {
        var s = Script.fromASM('OP_DUP OP_HASH160 ' +
          '1b3d8caa6652e1c62b2159c267633f66989a650e OP_EQUALVERIFY OP_CHECKSIG');
        var buf = s.toBuffer();
        var a = Address.fromScript(s, 'livenet');
        a.toString().should.equal('znTZwy8vXTTa3VaeCpLRwirbnG53oeSHDXR');
        var b = new Address(s, 'livenet');
        b.toString().should.equal('znTZwy8vXTTa3VaeCpLRwirbnG53oeSHDXR');
      });

      it('should make this address from a p2sh input script', function() {
        var s = Script.fromASM('OP_HASH160 df23c5eaba30b4d95798c5d5d0e2ecc2a3dc4ff2 OP_EQUAL');
        var a = Address.fromScript(s, 'livenet');
        a.toString().should.equal('zszpcLB6C5B8QvfDbF2dYWXsrpac5DL9WRk');
        var b = new Address(s, 'livenet');
        b.toString().should.equal('zszpcLB6C5B8QvfDbF2dYWXsrpac5DL9WRk');
      });

      it('returns the same address if the script is a pay to public key hash out', function() {
        var address = 'znpBQQRxDmL7AJBHJm9ZPStKVenoTF1GNfi';
        var script = Script.buildPublicKeyHashOut(new Address(address));
        Address(script, Networks.livenet).toString().should.equal(address);
      });
      it('returns the same address if the script is a pay to script hash out', function() {
        var address = 'zszpcLB6C5B8QvfDbF2dYWXsrpac5DL9WRk';
        var script = Script.buildScriptHashOut(new Address(address));
        Address(script, Networks.livenet).toString().should.equal(address);
      });
    });

    it('should derive from this known address string livenet', function() {
      var address = new Address(str);
      var buffer = address.toBuffer();
      var slice = buffer.slice(2);
      var sliceString = slice.toString('hex');
      sliceString.should.equal(pubkeyhash.toString('hex'));
    });

    it('should derive from this known address string testnet', function() {
      var a = new Address(PKHTestnet[0], 'testnet');
      var b = new Address(a.toString());
      b.toString().should.equal(PKHTestnet[0]);
      b.network.should.equal(Networks.testnet);
    });

    it('should derive from this known address string livenet scripthash', function() {
      var a = new Address(P2SHLivenet[0], 'livenet', 'scripthash');
      var b = new Address(a.toString());
      b.toString().should.equal(P2SHLivenet[0]);
    });

    it('should derive from this known address string testnet scripthash', function() {
      var address = new Address(P2SHTestnet[0], 'testnet', 'scripthash');
      address = new Address(address.toString());
      address.toString().should.equal(P2SHTestnet[0]);
    });

  });

  describe('#toBuffer', function() {

    it('1b3d8caa6652e1c62b2159c267633f66989a650e corresponds to hash znTZwy8vXTTa3VaeCpLRwirbnG53oeSHDXR', function() {
      var address = new Address(str);
      address.toBuffer().slice(2).toString('hex').should.equal(pubkeyhash.toString('hex'));
    });

  });

  describe('#object', function() {

    it('roundtrip to-from-to', function() {
      var obj = new Address(str).toObject();
      var address = Address.fromObject(obj);
      address.toString().should.equal(str);
    });

    it('will fail with invalid state', function() {
      expect(function() {
        return Address.fromObject('¹');
      }).to.throw(bitcore.errors.InvalidState);
    });
  });

  describe('#toString', function() {

    it('livenet pubkeyhash address', function() {
      var address = new Address(str);
      address.toString().should.equal(str);
    });

    it('scripthash address', function() {
      var address = new Address(P2SHLivenet[0]);
      address.toString().should.equal(P2SHLivenet[0]);
    });

    it('testnet scripthash address', function() {
      var address = new Address(P2SHTestnet[0]);
      address.toString().should.equal(P2SHTestnet[0]);
    });

    it('testnet pubkeyhash address', function() {
      var address = new Address(PKHTestnet[0]);
      address.toString().should.equal(PKHTestnet[0]);
    });

  });

  describe('#inspect', function() {
    it('should output formatted output correctly', function() {
      var address = new Address(str);
      var output = '<Address: znTZwy8vXTTa3VaeCpLRwirbnG53oeSHDXR, type: pubkeyhash, network: livenet>';
      address.inspect().should.equal(output);
    });
  });

  describe('questions about the address', function() {
    it('should detect a P2SH address', function() {
      new Address(P2SHLivenet[0]).isPayToScriptHash().should.equal(true);
      new Address(P2SHLivenet[0]).isPayToPublicKeyHash().should.equal(false);
      new Address(P2SHTestnet[0]).isPayToScriptHash().should.equal(true);
      new Address(P2SHTestnet[0]).isPayToPublicKeyHash().should.equal(false);
    });
    it('should detect a Pay To PubkeyHash address', function() {
      new Address(PKHLivenet[0]).isPayToPublicKeyHash().should.equal(true);
      new Address(PKHLivenet[0]).isPayToScriptHash().should.equal(false);
      new Address(PKHTestnet[0]).isPayToPublicKeyHash().should.equal(true);
      new Address(PKHTestnet[0]).isPayToScriptHash().should.equal(false);
    });
  });

  it('throws an error if it couldn\'t instantiate', function() {
    expect(function() {
      return new Address(1);
    }).to.throw(TypeError);
  });
  it('can roundtrip from/to a object', function() {
    var address = new Address(P2SHLivenet[0]);
    expect(new Address(address.toObject()).toString()).to.equal(P2SHLivenet[0]);
  });

  it('will use the default network for an object', function() {
    var obj = {
      hash: '19a7d869032368fd1f1e26e5e73a4ad0e474960e',
      type: 'scripthash'
    };
    var address = new Address(obj);
    address.network.should.equal(Networks.defaultNetwork);
  });

  describe('creating a P2SH address from public keys', function() {

    var public1 = '026ff02f4d55dc505eda88bd94e20dc7059cab324f49df1d5894954486e6c55d3e';
    var public2 = '03e9b9153afb329489f7f16b37d7c25421768e6bbf81670c9303455bdb715980cf';
    var public3 = '034832b513b2b0cc82a45cd93385b65c65f56ab71864df6f85761a76d9ab941ff4';
    var publics = [public1, public2, public3];

    it('can create an address from a set of public keys', function() {
      var address = Address.createMultisig(publics, 2, Networks.livenet);
      address.toString().should.equal('zskC5sAdPcbGpNUBQZuTqgNgekiwDi37KBw');
      address = new Address(publics, 2, Networks.livenet);
      address.toString().should.equal('zskC5sAdPcbGpNUBQZuTqgNgekiwDi37KBw');
    });

    it('can also be created by Address.createMultisig', function() {
      var address = Address.createMultisig(publics, 2);
      var address2 = Address.createMultisig(publics, 2);
      address.toString().should.equal(address2.toString());
    });

    it('fails if invalid array is provided', function() {
      expect(function() {
        return Address.createMultisig([], 3, 'testnet');
      }).to.throw('Number of required signatures must be less than or equal to the number of public keys');
    });
  });

});

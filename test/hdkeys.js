'use strict';

// Relax some linter options:
//   * quote marks so "m/0'/1/2'/" doesn't need to be scaped
//   * too many tests, maxstatements -> 100
//   * store test vectors at the end, latedef: false
//   * should call is never defined
/* jshint quotmark: false */
/* jshint latedef: false */
/* jshint maxstatements: 100 */
/* jshint unused: false */

var _ = require('lodash');
var should = require('chai').should();
var expect = require('chai').expect;
var sinon = require('sinon');
var bitcore = require('..');
var Networks = bitcore.Networks;
var HDPrivateKey = bitcore.HDPrivateKey;
var HDPublicKey = bitcore.HDPublicKey;

describe('HDKeys building with static methods', function() {
  var classes = [HDPublicKey, HDPrivateKey];
  var clazz, index;

  _.each(classes, function(clazz) {
    var expectStaticMethodFail = function(staticMethod, argument, message) {
      expect(clazz[staticMethod].bind(null, argument)).to.throw(message);
    };
    it(clazz.name + ' fromJSON checks that a valid JSON is provided', function() {
      var errorMessage = 'Invalid Argument: No valid argument was provided';
      var method = 'fromObject';
      expectStaticMethodFail(method, undefined, errorMessage);
      expectStaticMethodFail(method, null, errorMessage);
      expectStaticMethodFail(method, 'invalid JSON', errorMessage);
      expectStaticMethodFail(method, '{\'singlequotes\': true}', errorMessage);
    });
    it(clazz.name + ' fromString checks that a string is provided', function() {
      var errorMessage = 'No valid string was provided';
      var method = 'fromString';
      expectStaticMethodFail(method, undefined, errorMessage);
      expectStaticMethodFail(method, null, errorMessage);
      expectStaticMethodFail(method, {}, errorMessage);
    });
    it(clazz.name + ' fromObject checks that an object is provided', function() {
      var errorMessage = 'No valid argument was provided';
      var method = 'fromObject';
      expectStaticMethodFail(method, undefined, errorMessage);
      expectStaticMethodFail(method, null, errorMessage);
      expectStaticMethodFail(method, '', errorMessage);
    });
  });
});

describe('BIP44 compliance', function() {

  it('should initialize test vector 1 from the extended public key', function() {
    new HDPublicKey(vector1_m_public).xpubkey.should.equal(vector1_m_public);
  });

  it('should initialize test vector 1 from the extended private key', function() {
    new HDPrivateKey(vector1_m_private).xprivkey.should.equal(vector1_m_private);
  });

  it('can initialize a public key from an extended private key', function() {
    new HDPublicKey(vector1_m_private).xpubkey.should.equal(vector1_m_public);
  });

  it('toString should be equal to the `xpubkey` member', function() {
    var privateKey = new HDPrivateKey(vector1_m_private);
    privateKey.toString().should.equal(privateKey.xprivkey);
  });

  it('toString should be equal to the `xpubkey` member', function() {
    var publicKey = new HDPublicKey(vector1_m_public);
    publicKey.toString().should.equal(publicKey.xpubkey);
  });

  it('should get the extended public key from the extended private key for test vector 1', function() {
    HDPrivateKey(vector1_m_private).xpubkey.should.equal(vector1_m_public);
  });

  it("should get m/44h/121h/0h ext. private key from test vector 1", function() {
    var privateKey = new HDPrivateKey(vector1_m_private).derive("m/44'/121'/0'");
    privateKey.xprivkey.should.equal(vector1_m_44h_121h_0h_private);
  });

  it("should get m/44h/121h/0h ext. public key from test vector 1", function() {
    HDPrivateKey(vector1_m_private).derive("m/44'/121'/0'")
      .xpubkey.should.equal(vector1_m_44h_121h_0h_public);
  });

  it("should get m/44h/121h/0h/1 ext. private key from test vector 1", function() {
    HDPrivateKey(vector1_m_private).derive("m/44'/121'/0'/1")
      .xprivkey.should.equal(vector1_m_44h_121h_0h_1_private);
  });

  it("should get m/44h/121h/0h/1 ext. public key from test vector 1", function() {
    HDPrivateKey(vector1_m_private).derive("m/44'/121'/0'/1")
      .xpubkey.should.equal(vector1_m_44h_121h_0h_1_public);
  });

  it("should get m/44h/121h/0h/1 ext. public key from m/44h public key from test vector 1", function() {
    var derivedPublic = HDPrivateKey(vector1_m_private).derive("m/44'/121'/0'").hdPublicKey.derive("m/1");
    derivedPublic.xpubkey.should.equal(vector1_m_44h_121h_0h_1_public);
  });

  it("should get m/44h/121h/1h/0 ext. private key from test vector 1", function() {
    var privateKey = new HDPrivateKey(vector1_m_private);
    var derived = privateKey.derive("m/44'/121'/1'/0");
    derived.xprivkey.should.equal(vector1_m_44_121_1_0_private);
  });

  it("should get m/44h/121h/1h/0 ext. public key from test vector 1", function() {
    HDPrivateKey(vector1_m_private).derive("m/44'/121'/1'/0")
      .xpubkey.should.equal(vector1_m_44_121_1_0_public);
  });

  it("should get m/44'/121'/1'/1 ext. private key from test vector 1", function() {
    HDPrivateKey(vector1_m_private).derive("m/44'/121'/1'/1")
      .xprivkey.should.equal(vector1_m_44_121_1_1_private);
  });

  it("should get m/44h/121h/1h/1 ext. public key from m/44h/121h/1/1h public key from test vector 1", function() {
    var derived = HDPrivateKey(vector1_m_private).derive("m/44'/121'/1'").hdPublicKey;
    derived.derive("m/1").xpubkey.should.equal(vector1_m_44_121_1_1_public);
  });

  it("should get m/44h/121h/1h/1 ext. public key from test vector 1", function() {
    HDPrivateKey(vector1_m_private).derive("m/44'/121'/1'/1")
      .xpubkey.should.equal(vector1_m_44_121_1_1_public);
  });

  it("should get m/44h/121h/1h/100 ext. private key from test vector 1", function() {
    HDPrivateKey(vector1_m_private).derive("m/44'/121'/1'/100")
      .xprivkey.should.equal(vector1_m_44_121_1_100_private);
  });

  it("should get m/44h/121h/1h/100 ext. public key from test vector 1", function() {
    HDPrivateKey(vector1_m_private).derive("m/44'/121'/1'/100")
      .xpubkey.should.equal(vector1_m_44_121_1_100_public);
  });

  it("should get m/44h/121h/1h/1 ext. public key from m/44h/121h/1h public key from test vector 1", function() {
    var derived = HDPrivateKey(vector1_m_private).derive("m/44'/121'/1'").hdPublicKey;
    derived.derive("m/100").xpubkey.should.equal(vector1_m_44_121_1_100_public);
  });

  it('should initialize test vector 2 from the extended public key', function() {
    HDPublicKey(vector2_m_public).xpubkey.should.equal(vector2_m_public);
  });

  it('should initialize test vector 2 from the extended private key', function() {
    HDPrivateKey(vector2_m_private).xprivkey.should.equal(vector2_m_private);
  });

  it('should get the extended public key from the extended private key for test vector 2', function() {
    HDPrivateKey(vector2_m_private).xpubkey.should.equal(vector2_m_public);
  });

  it("should get m/44h/121h/0h ext. private key from test vector 2", function() {
    HDPrivateKey(vector2_m_private).derive(44, true).derive(121, true).derive(0, true).xprivkey.should.equal(vector2_m_44h_121h_0h_private);
  });

  it("should get m/44h/121h/0h ext. public key from test vector 2", function() {
    HDPrivateKey(vector2_m_private).derive(44, true).derive(121, true).derive(0, true).xpubkey.should.equal(vector2_m_44h_121h_0h_public);
  });

  it("should get m/44h/121h/0h ext. public key from m public key from test vector 2", function() {
    HDPrivateKey(vector2_m_private).hdPublicKey.derive(44, true).derive(121, true).derive(0, true).xpubkey.should.equal(vector2_m_44h_121h_0h_public);
  });

  it("should get m/44h/121h/0h/0 ext. private key from test vector 2", function() {
    HDPrivateKey(vector2_m_private).derive("m/44'/121'/0'/0")
      .xprivkey.should.equal(vector2_m_44h_121h_0h_0_private);
  });

  it("should get m/44h/121h/0h/0 ext. public key from test vector 2", function() {
    HDPrivateKey(vector2_m_private).derive("m/44'/121'/0'/0")
      .xpubkey.should.equal(vector2_m_44h_121h_0h_0_public);
  });

  it("should get m/44h/121h/300h/1 ext. private key from test vector 2", function() {
    HDPrivateKey(vector2_m_private).derive("m/44'/121'/300'/1")
      .xprivkey.should.equal(vector2_m_44h_121h_300h_1_private);
  });

  it("should get m/44h/121h/300h/1 ext. public key from test vector 2", function() {
    HDPrivateKey(vector2_m_private).derive("m/44'/121'/300'/1")
      .xpubkey.should.equal(vector2_m_44h_121h_300h_1_public);
  });

  it("should get m/44h/121h/300h/1 ext. public key from m/44h/121h/300h public key from test vector 2", function() {
    var derived = HDPrivateKey(vector2_m_private).derive("m/44'/121'/300'").hdPublicKey;
    derived.derive(1).xpubkey.should.equal(vector2_m_44h_121h_300h_1_public);
  });

  it("should get m/44h/121h/300h/100 ext. private key from test vector 2", function() {
    HDPrivateKey(vector2_m_private).derive("m/44'/121'/300'/100")
      .xprivkey.should.equal(vector2_m_44h_121h_300h_100_private);
  });

  it("should get m/44h/121h/300h/100 ext. public key from test vector 2", function() {
    HDPrivateKey(vector2_m_private).derive("m/44'/121'/300'/100")
      .xpubkey.should.equal(vector2_m_44h_121h_300h_100_public);
  });

  it("should get m/44h/121h/2h/50 ext. private key from test vector 2", function() {
    HDPrivateKey(vector2_m_private).derive("m/44'/121'/2'/50")
      .xprivkey.should.equal(vector2_m_44h_121h_2h_50_private);
  });

  it("should get m/44h/121h/2h/50 ext. public key from test vector 2", function() {
    HDPrivateKey(vector2_m_private).derive("m/44'/121'/2'/50")
      .xpubkey.should.equal(vector2_m_44h_121h_2h_50_public);
  });

  it("should get m/44h/121h/2h/50 ext. public key from m/44h/121h/2h public key from test vector 2", function() {
    var derivedPublic = HDPrivateKey(vector2_m_private)
      .derive("m/44'/121'/2'").hdPublicKey;
    derivedPublic.derive("m/50")
      .xpubkey.should.equal(vector2_m_44h_121h_2h_50_public);
  });

  it('should use full 32 bytes for private key data that is hashed (as per bip32)', function() {
    // https://github.com/bitcoin/bips/blob/master/bip-0032.mediawiki
    var privateKeyBuffer = new Buffer('00000055378cf5fafb56c711c674143f9b0ee82ab0ba2924f19b64f5ae7cdbfd', 'hex');
    var chainCodeBuffer = new Buffer('9c8a5c863e5941f3d99453e6ba66b328bb17cf0b8dec89ed4fc5ace397a1c089', 'hex');
    var key = HDPrivateKey.fromObject({
      network: 'livenet',
      depth: 0,
      parentFingerPrint: 0,
      childIndex: 0,
      privateKey: privateKeyBuffer,
      chainCode: chainCodeBuffer
    });
    var derived = key.deriveChild("m/44'/0'/0'/0/0'");
    derived.privateKey.toString().should.equal('3348069561d2a0fb925e74bf198762acc47dce7db27372257d2d959a9e6f8aeb');
  });

  it('should NOT use full 32 bytes for private key data that is hashed with nonCompliant flag', function() {
    // This is to test that the previously implemented non-compliant to BIP32
    var privateKeyBuffer = new Buffer('00000055378cf5fafb56c711c674143f9b0ee82ab0ba2924f19b64f5ae7cdbfd', 'hex');
    var chainCodeBuffer = new Buffer('9c8a5c863e5941f3d99453e6ba66b328bb17cf0b8dec89ed4fc5ace397a1c089', 'hex');
    var key = HDPrivateKey.fromObject({
      network: 'testnet',
      depth: 0,
      parentFingerPrint: 0,
      childIndex: 0,
      privateKey: privateKeyBuffer,
      chainCode: chainCodeBuffer
    });
    var derived = key.deriveNonCompliantChild("m/44'/0'/0'/0/0'");
    derived.privateKey.toString().should.equal('4811a079bab267bfdca855b3bddff20231ff7044e648514fa099158472df2836');
  });

  it('should NOT use full 32 bytes for private key data that is hashed with the nonCompliant derive method', function() {
    // This is to test that the previously implemented non-compliant to BIP32
    var privateKeyBuffer = new Buffer('00000055378cf5fafb56c711c674143f9b0ee82ab0ba2924f19b64f5ae7cdbfd', 'hex');
    var chainCodeBuffer = new Buffer('9c8a5c863e5941f3d99453e6ba66b328bb17cf0b8dec89ed4fc5ace397a1c089', 'hex');
    var key = HDPrivateKey.fromObject({
      network: 'testnet',
      depth: 0,
      parentFingerPrint: 0,
      childIndex: 0,
      privateKey: privateKeyBuffer,
      chainCode: chainCodeBuffer
    });
    var derived = key.derive("m/44'/0'/0'/0/0'");
    derived.privateKey.toString().should.equal('4811a079bab267bfdca855b3bddff20231ff7044e648514fa099158472df2836');
  });

  describe('edge cases', function() {
    var sandbox = sinon.sandbox.create();
    afterEach(function() {
      sandbox.restore();
    });
    it('will handle edge case that derived private key is invalid', function() {
      var invalid = new Buffer('0000000000000000000000000000000000000000000000000000000000000000', 'hex');
      var privateKeyBuffer = new Buffer('5f72914c48581fc7ddeb944a9616389200a9560177d24f458258e5b04527bcd1', 'hex');
      var chainCodeBuffer = new Buffer('39816057bba9d952fe87fe998b7fd4d690a1bb58c2ff69141469e4d1dffb4b91', 'hex');
      var unstubbed = bitcore.crypto.BN.prototype.toBuffer;
      var count = 0;
      var stub = sandbox.stub(bitcore.crypto.BN.prototype, 'toBuffer', function(args) {
        // On the fourth call to the function give back an invalid private key
        // otherwise use the normal behavior.
        count++;
        if (count === 4) {
          return invalid;
        }
        var ret = unstubbed.apply(this, arguments);
        return ret;
      });
      sandbox.spy(bitcore.PrivateKey, 'isValid');
      var key = HDPrivateKey.fromObject({
        network: 'testnet',
        depth: 0,
        parentFingerPrint: 0,
        childIndex: 0,
        privateKey: privateKeyBuffer,
        chainCode: chainCodeBuffer
      });
      var derived = key.derive("m/44'");
      derived.privateKey.toString().should.equal('b15bce3608d607ee3a49069197732c656bca942ee59f3e29b4d56914c1de6825');
      bitcore.PrivateKey.isValid.callCount.should.equal(2);
    });
    it('will handle edge case that a derive public key is invalid', function() {
      var publicKeyBuffer = new Buffer('029e58b241790284ef56502667b15157b3fc58c567f044ddc35653860f9455d099', 'hex');
      var chainCodeBuffer = new Buffer('39816057bba9d952fe87fe998b7fd4d690a1bb58c2ff69141469e4d1dffb4b91', 'hex');
      var key = new HDPublicKey({
        network: 'testnet',
        depth: 0,
        parentFingerPrint: 0,
        childIndex: 0,
        chainCode: chainCodeBuffer,
        publicKey: publicKeyBuffer
      });
      var unstubbed = bitcore.PublicKey.fromPoint;
      bitcore.PublicKey.fromPoint = function() {
        bitcore.PublicKey.fromPoint = unstubbed;
        throw new Error('Point cannot be equal to Infinity');
      };
      sandbox.spy(key, '_deriveWithNumber');
      var derived = key.derive("m/44");
      key._deriveWithNumber.callCount.should.equal(2);
      key.publicKey.toString().should.equal('029e58b241790284ef56502667b15157b3fc58c567f044ddc35653860f9455d099');
    });
  });

  describe('seed', function() {

    it('should initialize a new BIP44 correctly from test vector 1 seed', function() {
      var seededKey = HDPrivateKey.fromSeed(vector1_master, Networks.livenet);
      seededKey.xprivkey.should.equal(vector1_m_private);
      seededKey.xpubkey.should.equal(vector1_m_public);
    });

    it('should initialize a new BIP32 correctly from test vector 2 seed', function() {
      var seededKey = HDPrivateKey.fromSeed(vector2_master, Networks.livenet);
      seededKey.xprivkey.should.equal(vector2_m_private);
      seededKey.xpubkey.should.equal(vector2_m_public);
    });
  });
});

//test vectors: https://github.com/bitcoin/bips/blob/master/bip-0032.mediawiki
var vector1_master = '19cf4c25c1314cc53ca1af5a9b4e40a61916ace8f9b19fd38deab4c2198aa52a6f475469f34d4eed12d811beaa3d799a28f74459249435f645593ba60cfbe7ed';
var vector1_m_public = 'xpub661MyMwAqRbcFf8yh6qVBJGx9WVxZyiraLC9UjM2vkz8C3yrANiREPreNnB2Unuf6kRCr12bA9y54EPNAkeycyhKZ5voE2fxojM9953WtuH';
var vector1_m_private = 'xprv9s21ZrQH143K3B4Wb5JUpALDbUfUAX11D7GYgLwRNRT9KFehcqQAgbYAXXR7AF6FWNJnk7jBP5yjTzuMrcHjRnfXBDYtaXHPgxzwjLbBYqX';
var vector1_m_44h_121h_0h_public = 'xpub6CnyKHdLi1yRQuxu4uma85D1C3SzqUriPGqNLCZgVkUSF1A3XzpPSSz3YoCLE8136KqhEZ5cjKQYQbayWbRmtYS2aay9AzNeZzXGmt6he3N';
var vector1_m_44h_121h_0h_private = 'xprv9yocun6SseR8CRtRxtEZkwGGe1cWS28s23umXpA4wQwTNCptzTW8tefZhUkfQWonzrb9eDYuaE1fBis66usDHtaCcrUryfDTmTjmrybQTXM';
var vector1_m_44h_121h_0h_1_public = 'xpub6DevgtHTzw94iBxE7rhTjGPfYL3WdMKuSK2QPtwRkCur54porTJR8NTF6HhAkNKJsiwtrTkAjAKvBmRKepoEpXH5KburVNPZWAWNkNWFj8g';
var vector1_m_44h_121h_0h_1_private = 'xprv9zfaHNkaAZamVhsm1qATN8SvzJD2Dtc4566obWXpBsNsCGVfJuzAaa8mF2qt2XqDNVR8JBatd1ia9wGR4Uf3qWNgv87La34aDD3dFQCiGeR';
var vector1_m_44_121_1_0_public = 'xpub6FQ1HisThhVkxyS95C3VfvB8bGQjZoASZA9HQaVNugcer4boiA2xdMubzJ3r7dhBk2M9rkcxFajC5usTAa9r9QSN6fCj7cMxdik6fVmdogG';
var vector1_m_44_121_1_0_private = 'xprvA2QetDLZsKwTkVMfyAWVJnEQ3EaFALSbBwDgcC5mMM5fyGGfAcii5Zb88yV63wvC5YF5VtTNrrMCrWJ4K1912hFYWKf5trThGEumPSGJwST';
var vector1_m_44_121_1_1_public = 'xpub6FQ1HisThhVm2XL2gh9cfBw3WWRiGLXbj9njeR9LEuRnq9Qb7Z6Ndd7bMQynQpEFAXEgRdeUey4uTKtPrrBnzJ8tpG1kuxHHroinc9a6UeG';
var vector1_m_44_121_1_1_private = 'xprvA2QetDLZsKwTp3FZafccJ3zJxUbDrsokMvs8r2jigZtoxM5Sa1n85po7W8PYDQTD3TUzFqMdPXerTqktXDdJwo9s4SKa61P2rBzFUJbmmxn';
var vector1_m_44_121_1_100_public = 'xpub6FQ1HisThhVqNwjdqsg7CbxBGMb37Moz1zyfoywVntBGcc3kAV2JsmjaLYKLyuyvozX98N28FKm7nmLnj6fro8ikhK76joH1G9NcimfPQdQ';
var vector1_m_44_121_1_100_private = 'xprvA2QetDLZsKwYATfAjr96qU1SiKkYhu68en451bXtEYeHjoibcwi4KyR6VHnDYidgRxQt4E5Le8iUnQyP99AxwaL8QsHvEL2pjq6xpgR1dsd';
var vector2_master = '5a6d825488a5d32a95c76a5eedb1c7f1cf82fe8e4d123d7af7d825d970c2554c8c2b18b9e2ff40a4bc0b76cf5d892993b1102ad288f639dce917fd65240dfcfc';
var vector2_m_public = 'xpub661MyMwAqRbcGR5ykzf6CHNs8XdeKmnUAWmzPFNKMkMeZuSKK4PCHPPdJLbksfBTVmbN9vpMZPcWZg6daFwMHuLGiNgD1navAWa2fWP3TEp';
var vector2_m_private = 'xprv9s21ZrQH143K3w1Wey85q9S8aVo9vK4coHrParxhoQpfh77AmX4wjb59T6cYQ5BsLxVMx13FZvUgN8qGMi69nEdnPPC91KjNZAjTqwZM4Sr';
var vector2_m_44h_121h_0h_public = 'xpub6CaJZLda5Z9NQbNR1cfQNLPi4zB6kVavgf9TGY4PUSMS2vqcjX4fdkbtnH2Bx9nK9jmThCD3CrjDjEqu7QRA7n2HcFJkZCip5AFpzvmaBic';
var vector2_m_44h_121h_0h_private = 'xprv9yax9q6gFBb5C7Hwub8Q1CSyWxLcM2s5KSDrU9emv6pTA8WUBykR5xHQw1KMMqBpWaJLZGW7k32FgQJ5fqtm5CjBGSH3UwKUhRNwo5oE6mV';
var vector2_m_44h_121h_0h_0_public = 'xpub6EfQ9gpHBpfB4V2e5mebGJbSsPXKzWZRQGdMS2YRZoMR5DH2wf9bmUeu3nySwSQKtcRThKzA9KDWMGuNyrkZ84rTDzgWrMu3pP6u8ibsMtM';
var vector2_m_44h_121h_0h_0_private = 'xprvA1g3kBHPMT6sqzxAyk7auAeiKMgqb3qa33hkde8p1TpSCQwtQ7qMDgLRCWG46BEnYXJwjZdJ2YtKPC6E7SCxSKmod19urbJETEpmWn4vk2a';
var vector2_m_44h_121h_300h_1_public = 'xpub6DxzrPwxyGNV5vDtpKgV2DDinQ2XE1WzZLkfrUhUuCKWP7g3hnSZhUWEY7bjnNgHSGLvVtTbHmkCaKMTRuA43grKoBF19bByHRcUSA7t4Jo';
var vector2_m_44h_121h_300h_1_private = 'xprv9zyeStR58tpBsS9RiJ9Uf5GzENC2pYo9C7q546HsLrnXWKLuAF8K9gBkgs1rR77EFBX7G4FkiosuvCWFnTH878wzAUMDyTeajS1br29rEWc';
var vector2_m_44h_121h_300h_100_public = 'xpub6DxzrPwxyGNZTXQ7iYAfJoenn9bPSShxDdSmsxXS2V2NcU38Xd8BnHJTu6bY85tBvmb76Lr64xDr2w76ohaDEf2fVpfdqUB1CCWND6gmYpK';
var vector2_m_44h_121h_300h_100_private = 'xprv9zyeStR58tpGF3KecWdewfi4E7ku2yz6rQXB5a7pU9VPjfhyz5owEUyz3o9xJCwjHpW3rFE4QRzdoyEN2Xbm227ZKMi9FudPBoRzwXcoFY6';
var vector2_m_44h_121h_2h_50_public = 'xpub6EbF1cZ8Ly8QqZR1EWCKJwDDCsGkfveL9QQUcn2pzcAjhcunCRYfhhZ9h9ntAvHeyeHsjAg6oQZbA7fMouvA91TVU9T913NDecCQ9zXwita';
var vector2_m_44h_121h_2h_50_private = 'xprvA1btc72EWba7d5LY8UfJwoGUeqSGGTvUnBUspPdDSGdkppadetER9uEfqqXJNyoHdjFi1Jcscuv4dMuoRvJ1TiqnJNzDKZNii2nLVhmsrEL';


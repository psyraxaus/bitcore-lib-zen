'use strict';
var _ = require('lodash');

var BufferUtil = require('./util/buffer');
var JSUtil = require('./util/js');
var networks = [];
var networkMaps = {};

/**
 * A network is merely a map containing values that correspond to version
 * numbers for each bitcoin network. Currently only supporting "livenet"
 * (a.k.a. "mainnet") and "testnet".
 * @constructor
 */
function Network() {}

Network.prototype.toString = function toString() {
    return this.name;
};

/**
 * @function
 * @member Networks#get
 * Retrieves the network associated with a magic number or string.
 * @param {string|number|Network} arg
 * @param {string|Array} keys - if set, only check if the magic number associated with this name matches
 * @return Network
 */
function get(arg, keys) {
    if (~networks.indexOf(arg)) {
        return arg;
    }
    if (keys) {
        if (!_.isArray(keys)) {
            keys = [keys];
        }
        var containsArg = function(key) {
            return networks[index][key] === arg;
        };
        for (var index in networks) {
            if (_.some(keys, containsArg)) {
                return networks[index];
            }
        }
        return undefined;
    }
    return networkMaps[arg];
}

/**
 * @function
 * @member Networks#add
 * Will add a custom Network
 * @param {Object} data
 * @param {string} data.name - The name of the network
 * @param {string} data.alias - The aliased name of the network
 * @param {Number} data.pubkeyhash - The publickey hash prefix
 * @param {Number} data.privatekey - The privatekey prefix
 * @param {Number} data.scripthash - The scripthash prefix
 * @param {Number} data.xpubkey - The extended public key magic
 * @param {Number} data.xprivkey - The extended private key magic
 * @param {Number} data.zaddr - The Zcash payment address prefix
 * @param {Number} data.zkey - The Zcash spending key prefix
 * @param {Number} data.networkMagic - The network magic number
 * @param {Number} data.port - The network port
 * @param {Array}  data.dnsSeeds - An array of dns seeds
 * @return Network
 */
function addNetwork(data) {

    var network = new Network();

    JSUtil.defineImmutable(network, {
        name: data.name,
        alias: data.alias,
        pubkeyhash: data.pubkeyhash,
        privatekey: data.privatekey,
        scripthash: data.scripthash,
        xpubkey: data.xpubkey,
        xprivkey: data.xprivkey,
        zaddr: data.zaddr,
        zkey: data.zkey
    });

    if (data.networkMagic) {
        JSUtil.defineImmutable(network, {
            networkMagic: BufferUtil.integerAsBuffer(data.networkMagic)
        });
    }

    if (data.port) {
        JSUtil.defineImmutable(network, {
            port: data.port
        });
    }

    if (data.dnsSeeds) {
        JSUtil.defineImmutable(network, {
            dnsSeeds: data.dnsSeeds
        });
    }
    _.each(network, function(value) {
        if (!_.isUndefined(value) && !_.isObject(value)) {
            networkMaps[value] = network;
        }
    });

    networks.push(network);

    return network;

}

/**
 * @function
 * @member Networks#remove
 * Will remove a custom network
 * @param {Network} network
 */
function removeNetwork(network) {
    for (var i = 0; i < networks.length; i++) {
        if (networks[i] === network) {
            networks.splice(i, 1);
        }
    }
    for (var key in networkMaps) {
        if (networkMaps[key] === network) {
            delete networkMaps[key];
        }
    }
}

addNetwork({
    name: 'livenet',
    alias: 'mainnet',
    pubkeyhash: 0x2089,
    privatekey: 0x80,
    scripthash: 0x2096,
    xpubkey: 0x0488b21e,
    xprivkey: 0x0488ade4,
    zaddr: 0x169a,
    zkey: 0xab36,
    networkMagic: 0x63617368,
    port: 9033,
    dnsSeeds: [
        'dnseed.zensystem.io',
        'dnsseed.zenseed.network',
        'zpool.blockoperations.com',
        'node1.zenchain.info',
        'mainnet.zensystem.io'
    ]
});

var zen_mainnet = get('livenet');

addNetwork({
    name: 'testnet',
    alias: 'regtest',
    pubkeyhash: 0x2098,
    privatekey: 0xef,
    scripthash: 0x2092,
    bech32prefix: 'bcrt',
    xpubkey: 0x043587cf,
    xprivkey: 0x04358394,
    networkMagic: 0xfa1af9bf,
    port: 18233,
    zaddr: 0x16b6,
    zkey: 0xac08,
    dnsSeeds: [
        'dnsseed.testnet.z.cash'
    ]
});

/**
 * @instance
 * @member Networks#testnet
 */
var zen_testnet = get('testnet');

addNetwork({
    name: 'regtest',
    alias: 'dev',
    pubkeyhash: 0x2098,
    privatekey: 0xef,
    scripthash: 0x2092,
    bech32prefix: 'bcrt',
    xpubkey: 0x043587cf,
    xprivkey: 0x04358394,
    networkMagic: 0x2f54cc9d,
    port: 18444,
    zaddr: 0x16b6,
    zkey: 0xac08,
    dnsSeeds: []
});

/**
 * @instance
 * @member Networks#regtest
 */
var zen_regtest = get('regtest');



/**
 * @function
 * @member Networks#enableRegtest
 * Will enable regtest features for testnet
 */
function enableRegtest() {
    zen_regtest.regtestEnabled = true;
}

/**
 * @function
 * @member Networks#disableRegtest
 * Will disable regtest features for testnet
 */
function disableRegtest() {
    zen_regtest.regtestEnabled = false;
}


module.exports = {
    add: addNetwork,
    remove: removeNetwork,
    defaultNetwork: zen_mainnet,
    livenet: zen_mainnet,
    mainnet: zen_mainnet,
    testnet: zen_testnet,
    regtest: zen_regtest,
    get: get,
    enableRegtest: enableRegtest,
    disableRegtest: disableRegtest
};
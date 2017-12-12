import Web3 from 'web3'
const ProviderEngine = require('web3-provider-engine')
const CacheSubprovider = require('web3-provider-engine/subproviders/cache.js')
const FixtureSubprovider = require('web3-provider-engine/subproviders/fixture.js')
const FilterSubprovider = require('web3-provider-engine/subproviders/filters.js')
// const VmSubprovider = require('web3-provider-engine/subproviders/vm.js')
const HookedWalletSubprovider = require('web3-provider-engine/subproviders/hooked-wallet.js')
const NonceSubprovider = require('web3-provider-engine/subproviders/nonce-tracker.js')
const RpcSubprovider = require('web3-provider-engine/subproviders/rpc.js')

function defineGlobalCallback (funcName, cb) {
  if (typeof window.web3Mobile._bridge_callbacks === 'undefined') {
    window.web3Mobile._bridge_callbacks = {}
  }
  if (typeof window.web3Mobile._bridge_callbacks[funcName] === 'undefined') {
    window.web3Mobile._bridge_callbacks[funcName] = {}
  }
  // generate a nice random key
  let randomKey = Math.random().toString(36).slice(2) + '_' + Date.now().toString()
  window.web3Mobile._bridge_callbacks[funcName][randomKey] = cb
  return randomKey // return key
}

if (typeof window.web3Mobile === 'undefined') {
  window.web3Mobile = {}
}

var engine = new ProviderEngine()
var web3 = new Web3(engine)

window.web3_postMessageParent = window

window.addEventListener('load', function () {
  console.log('web3mobile onload')
  if (window && window.webkit && window.webkit.messageHandlers && window.webkit.messageHandlers.reactNative) {
    window.web3_postMessageParent = window.webkit.messageHandlers.reactNative
  }
})

// static results
engine.addProvider(new FixtureSubprovider({
  web3_clientVersion: 'ProviderEngine/v0.0.0/javascript',
  net_listening: true,
  eth_hashrate: '0x00',
  eth_mining: false,
  eth_syncing: true
}))

// cache layer
engine.addProvider(new CacheSubprovider())

// filters
engine.addProvider(new FilterSubprovider())

// pending nonce
engine.addProvider(new NonceSubprovider())

// vm
// engine.addProvider(new VmSubprovider())

// id mgmt
engine.addProvider(new HookedWalletSubprovider({
  getAccounts: function (cb) {
    console.log('getAccounts called')
    let callbackKey = defineGlobalCallback('getAccounts', cb)
    window.web3_postMessageParent.postMessage(JSON.stringify({
      method: 'getAccounts',
      callbackKey: callbackKey
    }))
    // cb(null, ['0xdbd360F30097fB6d938dcc8B7b62854B36160B45'])
  },
  approveTransaction: function (tx, cb) {
    console.log('approveTransaction called with tx ' + JSON.stringify(tx))
    // ex transaction
    // {"from":"0x481e9dc15456d6e827c19b59a7114900f2a139c2","value":"0x16345785d8a0000","gas":"0x493e0","to":"0xde93ffe56ef019ab1c4dc9c6c575ebc292a40ef6","data":"0xa168562b000000000000000000000000481e9dc15456d6e827c19b59a7114900f2a139c20000000000000000000000000000000000000000000000000000000000000040000000000000000000000000000000000000000000000000000000000000000949206d65776f7765640000000000000000000000000000000000000000000000"}
    let callbackKey = defineGlobalCallback('approveTransaction', cb)
    window.web3_postMessageParent.postMessage(JSON.stringify({
      method: 'approveTransaction',
      callbackKey: callbackKey,
      tx: tx
    }))
  },
  signTransaction: function (tx, cb) {
    console.log('signTransaction called with tx ' + JSON.stringify(tx))
    let callbackKey = defineGlobalCallback('signTransaction', cb)
    window.web3_postMessageParent.postMessage(JSON.stringify({
      method: 'signTransaction',
      callbackKey: callbackKey,
      tx: tx
    }))
  },
  // old eth_sign
  approveMessage: function (msg, cb) {
    console.log('approveMessage called with msg ' + JSON.stringify(msg))
    let callbackKey = defineGlobalCallback('approveMessage', cb)
    window.web3_postMessageParent.postMessage(JSON.stringify({
      method: 'approveMessage',
      callbackKey: callbackKey,
      msg: msg
    }))
  },
  signMessage: function (msg, cb) {
    console.log('signMessage called with msg ' + JSON.stringify(msg))
    let callbackKey = defineGlobalCallback('signMessage', cb)
    window.web3_postMessageParent.postMessage(JSON.stringify({
      method: 'signMessage',
      callbackKey: callbackKey,
      msg: msg
    }))
  },
  // new personal_sign
  approvePersonalMessage: function (msg, cb) {
    console.log('approvePersonalMessage called with msg ' + JSON.stringify(msg))
    let callbackKey = defineGlobalCallback('approvePersonalMessage', cb)
    window.web3_postMessageParent.postMessage(JSON.stringify({
      method: 'approvePersonalMessage',
      callbackKey: callbackKey,
      msg: msg
    }))
  },
  approveTypedMessage: function (msg, cb) {
    console.log('approveTypedMessage called with msg ' + JSON.stringify(msg))
    let callbackKey = defineGlobalCallback('approveTypedMessage', cb)
    window.web3_postMessageParent.postMessage(JSON.stringify({
      method: 'approveTypedMessage',
      callbackKey: callbackKey,
      msg: msg
    }))
  },
  signPersonalMessage: function (msg, cb) {
    console.log('signPersonalMessage called with msg ' + JSON.stringify(msg))
    let callbackKey = defineGlobalCallback('signPersonalMessage', cb)
    window.web3_postMessageParent.postMessage(JSON.stringify({
      method: 'signPersonalMessage',
      callbackKey: callbackKey,
      msg: msg
    }))
  },
  signTypedMessage: function (msg, cb) {
    console.log('signTypedMessage called with msg ' + JSON.stringify(msg))
    let callbackKey = defineGlobalCallback('signTypedMessage', cb)
    window.web3_postMessageParent.postMessage(JSON.stringify({
      method: 'signTypedMessage',
      callbackKey: callbackKey,
      msg: msg
    }))
  }
}))

// data source
engine.addProvider(new RpcSubprovider({
  rpcUrl: 'https://mainnet.infura.io/'
}))

// log new blocks
engine.on('block', function (block) {
  console.log('================================')
  console.log('BLOCK CHANGED:', '#' + block.number.toString('hex'), '0x' + block.hash.toString('hex'))
  console.log('================================')
})

// network connectivity error
engine.on('error', function (err) {
  // report connectivity errors
  console.error(err.stack)
})

engine.start()

// set window.web3Mobile.selectedAddress and window.web3Mobile.networkVersion
web3.currentProvider.sendAsync({method: 'eth_accounts'}, function (err, result) {
  if (err) {
    console.err(err)
    return
  }
  window.web3Mobile.selectedAddress = result.result[0]
})

web3.currentProvider.sendAsync({method: 'net_version'}, function (err, result) {
  if (err) {
    console.err(err)
    return
  }
  window.web3Mobile.networkVersion = result.result
})

// var web3 = new Web3();
// web3.setProvider(new Web3.providers.HttpProvider('https://mainnet.infura.io/'))

// export { BigNumber, Web3, web3, engine }

export default web3

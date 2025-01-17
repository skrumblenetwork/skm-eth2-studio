var RemixLib = require('skm-lib')
var TxExecution = RemixLib.execution.txExecution
var TxRunner = RemixLib.execution.txRunner
var executionContext = RemixLib.execution.executionContext

function runCall (payload, from, to, data, value, gasLimit, txRunner, callbacks, callback) {
  let finalCallback = function (err, result) {
    if (err) {
      return callback(err)
    }

    let toReturn = '0x' + result.result.vm.return.toString('hex')
    if (toReturn === '0x') {
      toReturn = '0x0'
    }
    return callback(null, toReturn)
  }

  TxExecution.callFunction(from, to, data, value, gasLimit, null, txRunner, callbacks, finalCallback, true)
}

function runTx (payload, from, to, data, value, gasLimit, txRunner, callbacks, callback) {
  let finalCallback = function (err, result) {
    if (err) {
      return callback(err)
    }
    callback(null, result.transactionHash)
  }

  TxExecution.callFunction(from, to, data, value, gasLimit, null, txRunner, callbacks, finalCallback, false)
}

function createContract (payload, from, data, value, gasLimit, txRunner, callbacks, callback) {
  let finalCallback = function (err, result) {
    if (err) {
      return callback(err)
    }
    callback(null, result.transactionHash)
  }

  TxExecution.createContract(from, data, value, gasLimit, txRunner, callbacks, finalCallback)
}

function processTx (accounts, payload, isCall, callback) {
  let api = {
    logMessage: (msg) => {
    },
    logHtmlMessage: (msg) => {
    },
    config: {
      getUnpersistedProperty: (key) => {
        return true
      },
      get: () => {
        return true
      }
    },
    detectNetwork: (cb) => {
      cb()
    },
    personalMode: () => {
      return false
    }
  }

  executionContext.init(api.config)

  let txRunner = new TxRunner(accounts, api)
  let { from, to, data, value, gas } = payload.params[0]
  gas = gas || 3000000

  let callbacks = {
    confirmationCb: (network, tx, gasEstimation, continueTxExecution, cancelCb) => {
      continueTxExecution(null)
    },
    gasEstimationForceSend: (error, continueTxExecution, cancelCb) => {
      if (error) {
        continueTxExecution(error)
      }
      continueTxExecution()
    },
    promptCb: (okCb, cancelCb) => {
      okCb()
    }
  }

  if (isCall) {
    runCall(payload, from, to, data, value, gas, txRunner, callbacks, callback)
  } else if (to) {
    runTx(payload, from, to, data, value, gas, txRunner, callbacks, callback)
  } else {
    createContract(payload, from, data, value, gas, txRunner, callbacks, callback)
  }
}

module.exports = processTx

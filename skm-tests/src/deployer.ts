import async from 'async'
var remixLib = require('skm-lib')
import Web3 = require('web3')

export function deployAll(compileResult: object, web3: Web3, callback) {
    let compiledObject = {}
    let contracts = {}
    let accounts: string[] = []

    async.waterfall([
        function getAccountList(next: Function) {
            web3.eth.getAccounts((_err, _accounts) => {
                accounts = _accounts
                next()
            })
        },
        function getContractData(next: Function) {
            for (let contractFile in compileResult) {
                for (let contractName in compileResult[contractFile]) {
                    let contract = compileResult[contractFile][contractName]

                    const className = contractName
                    const filename = contractFile

                    let abi = contract.abi
                    let code = contract.evm.bytecode.object

                    compiledObject[className] = {}
                    compiledObject[className].abi = abi
                    compiledObject[className].code = code
                    compiledObject[className].filename = filename
                    compiledObject[className].className = className
                    compiledObject[className].raw = contract

                    if (contractFile.indexOf('_test.sol') >= 0) {
                        compiledObject[className].isTest = true
                    }
                }
            }
            next()
        },
        function determineContractsToDeploy(next: Function) {
            let contractsToDeploy: string[] = ['Assert']
            let allContracts = Object.keys(compiledObject)

            for (let contractName of allContracts) {
                if (contractName === 'Assert') {
                    continue
                }
                if (compiledObject[contractName].isTest) {
                    contractsToDeploy.push(contractName)
                }
            }
            next(null, contractsToDeploy)
        },
        function deployContracts(contractsToDeploy: string[], next: Function) {
            const deployRunner = (deployObject, contractObject, contractName, filename, callback) => {
                deployObject.estimateGas().then((gasValue) => {
                    deployObject.send({
                        from: accounts[0],
                        gas: Math.ceil(gasValue * 1.2)
                    }).on('receipt', function (receipt) {
                        contractObject.options.address = receipt.contractAddress
                        contractObject.options.from = accounts[0]
                        contractObject.options.gas = 5000 * 1000
                        compiledObject[contractName].deployedAddress = receipt.contractAddress

                        contracts[contractName] = contractObject
                        contracts[contractName].filename = filename

                        callback(null, { result: { createdAddress: receipt.contractAddress } }) // TODO this will only work with JavaScriptV VM
                    }).on('error', function (err) {
                        console.error(err)
                        callback(err)
                    })
                })
            }

            async.eachOfLimit(contractsToDeploy, 1, function (contractName, index, nextEach) {
                let contract = compiledObject[contractName]
                let encodeDataFinalCallback = (error, contractDeployData) => {
                    if (error) return nextEach(error)
                    try {
                        let contractObject = new web3.eth.Contract(contract.abi)
                        let deployObject = contractObject.deploy({arguments: [], data: '0x' + contractDeployData.dataHex})
                        deployRunner(deployObject, contractObject, contractName, contract.filename, (error) => { nextEach(error) })
                    } catch (e) {
                        throw e
                    }
                }

                let encodeDataStepCallback = (msg) => { console.dir(msg) }

                let encodeDataDeployLibraryCallback = (libData, callback) => {
                    let abi = compiledObject[libData.data.contractName].abi
                    let code = compiledObject[libData.data.contractName].code
                    let libraryObject = new web3.eth.Contract(abi)
                    let deployObject = libraryObject.deploy({arguments: [], data: '0x' + code})
                    deployRunner(deployObject, libraryObject, libData.data.contractName, contract.filename, callback)
                }

                let funAbi = null // no need to set the abi for encoding the constructor
                let params = '' // we suppose that the test contract does not have any param in the constructor
                remixLib.execution.txFormat.encodeConstructorCallAndDeployLibraries(contractName, contract.raw, compileResult, params, funAbi, encodeDataFinalCallback, encodeDataStepCallback, encodeDataDeployLibraryCallback)
            }, function () {
                next(null, contracts)
            })
        }
    ], callback)
}

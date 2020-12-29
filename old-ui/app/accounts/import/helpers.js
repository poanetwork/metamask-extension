import log from 'loglevel'
import { importTypes } from './enums'
import Web3 from 'web3'
import ethNetProps from 'eth-net-props'
import abi from 'web3-eth-abi'

const nestedJsonObjToArray = (jsonObj) => {
	return jsonObjToArray(jsonObj)
}

const jsonObjToArray = (jsonObj) => {
	return Object.keys(jsonObj).reduce((arr, key) => {
		if (jsonObj[key].constructor === Object || jsonObj[key].constructor === Array) {
			arr = arr.concat(jsonObjToArray(jsonObj[key]))
		} else if (jsonObj[key].constructor === String) {
			arr.push(jsonObj[key])
		}
		return arr
	}, [])
}

const getBlockscoutApiNetworkPrefix = (network) => {
	switch (Number(network)) {
		case 1:
		case 42:
		case 3:
		case 4:
		return 'eth'
		case 99:
		case 77:
		case 100:
		return 'poa'
		case NaN:
		return 'etc'
		default:
		return ''
	}
}

const getBlockscoutApiNetworkSuffix = (network) => {
	switch (Number(network)) {
		case 1:
		return 'mainnet'
		case 99:
		return 'core'
		case 77:
		return 'sokol'
		case 100:
		return 'dai'
		case 42:
		return 'kovan'
		case 3:
		return 'ropsten'
		case 4:
		return 'rinkeby'
		case NaN:
		return 'mainnet'
		default:
		return ''
	}
}

const _isBlockscoutInstanceForThisChain = (network) => {
	switch (Number(network)) {
		case 1:
		case 99:
		case 77:
		case 100:
		return true
		case 42:
		case 3:
		case 4:
		return false
		default:
		return false
	}
}

const fetchABI = (addr, network) => {
	return new Promise((resolve, reject) => {
		const blockscoutInstanceExists = _isBlockscoutInstanceForThisChain(network)
		if (blockscoutInstanceExists) {
			const networkParent = getBlockscoutApiNetworkPrefix(network)
			const networkName = getBlockscoutApiNetworkSuffix(network)
			const bloscoutApiLink = `https://blockscout.com/${networkParent}/${networkName}/api`
			const bloscoutApiContractPath = '?module=contract'
			const blockscoutApiGetAbiPath = `&action=getabi&address=${addr}`
			const apiLink = `${bloscoutApiLink}${bloscoutApiContractPath}${blockscoutApiGetAbiPath}`
			fetch(apiLink)
			.then(response => {
				return response.json()
			})
			.then(responseJson => {
				resolve(responseJson && responseJson.result)
			})
			.catch(e => {
				log.debug(e)
				reject(e)
			})
		} else {
			resolve()
		}
	})
}

const getFullABI = (eth, contractAddr, network, type, RPC_URL, provider) => {
	return new Promise((resolve, reject) => {
		fetchABI(contractAddr, network)
		.then((targetABI) => {
			targetABI = targetABI && JSON.parse(targetABI)
			if (type === importTypes.CONTRACT.PROXY) {
				if (!eth.contract(targetABI).at(contractAddr).implementation && !isMasterCopyPattern(targetABI)) {
					const e = {
						message: 'This is not a valid Delegate Proxy contract',
					}
					reject(e)
				}
				try {
					if (isMasterCopyPattern(targetABI)) {
						let rpcUrl = RPC_URL || provider.rpcTarget
						if (rpcUrl === '') {
							rpcUrl = ethNetProps.RPCEndpoints(network)[0]
						}
						getImplAddrFromMasterCopyPattern(contractAddr, rpcUrl)
						.then(implAddr => {
							fetchImplementationAndCombine(implAddr, targetABI, network, resolve, reject)
						})
						.catch(err => {
							reject(err)
						})
					} else if (isEIP1967(targetABI)) {
						let rpcUrl = RPC_URL || provider.rpcTarget
						if (rpcUrl === '') {
							rpcUrl = ethNetProps.RPCEndpoints(network)[0]
						}
						getImplAddrEIP1967(contractAddr, rpcUrl)
						.then(implAddr => {
							fetchImplementationAndCombine(implAddr, targetABI, network, resolve, reject)
						})
						.catch(err => {
							reject(err)
						})
					} else {
						eth.contract(targetABI).at(contractAddr).implementation.call((err, implAddr) => {
							if (err) {
								reject(err)
							} else {
								fetchImplementationAndCombine(implAddr, targetABI, network, resolve, reject)
							}
						})
					}
				} catch (e) {
					reject(e)
				}
			} else {
				resolve(targetABI)
			}
		})
		.catch(e => { reject(e) })
	})
}

const isMasterCopyPattern = (abi) => {
	return abi.some(method => {
		return isMasterCopyInput(method.inputs)
	})
}

const isMasterCopyInput = (inputs) => {
	return inputs && inputs.find(input => {
		return input.name === '_masterCopy'
	})
}

const isEIP1967 = (abi) => {
	return abi.some(method => {
		return method.name === 'implementation' && method.stateMutability === 'nonpayable'
	})
}

const getImplAddrFromMasterCopyPattern = (address, rpcUrl) => {
	return new Promise((resolve, reject) => {
		const web3 = new Web3(new Web3.providers.HttpProvider(rpcUrl))
		web3.eth.getStorageAt(address, 0, 'latest', (err, result) => {
			if (err) {
				reject(err)
			}
			if (result) {
				const implAddr = abi.decodeParameter('address', result)
				resolve(implAddr)
			}
		})
	})
}

const getImplAddrEIP1967 = (address, rpcUrl) => {
	// https://eips.ethereum.org/EIPS/eip-1967
	return new Promise((resolve, reject) => {
		const web3 = new Web3(new Web3.providers.HttpProvider(rpcUrl))
		const implementationStoragePointer = '0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc'
		web3.eth.getStorageAt(address, implementationStoragePointer, 'latest', (err, result) => {
			if (err) {
				reject(err)
			}
			if (result) {
				const implAddr = abi.decodeParameter('address', result)
				resolve(implAddr)
			}
		})
	})
}

const fetchImplementationAndCombine = (implAddr, proxyABI, network, resolve, reject) => {
	return fetchABI(implAddr, network)
	.then((implABI) => {
		implABI = implABI && JSON.parse(implABI)
		const finalABI = implABI ? proxyABI.concat(implABI) : proxyABI
		resolve(finalABI)
	})
	.catch(e => reject(e))
}

module.exports = {
	nestedJsonObjToArray,
	getFullABI,
}

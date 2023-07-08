import {Controller} from '../support/controller'
import {ErrorResponse, SuccessResponse} from '../support/response'
import {Web3} from 'web3'
import contractAbi from '../data/contract-abi.json'

export class ClaimController extends Controller
{
    async claim(request) {
        const state = request.body
        if (!('chainId' in state)) {
            return new ErrorResponse({
                error: 'Chain ID is missing.',
            }, 400)
        }
        if (!('address' in state)) {
            return new ErrorResponse({
                error: 'Address is missing.',
            }, 400)
        }
        const chainRpcEnvName = `CHAIN_RPC_${state.chainId}`
        if (!(chainRpcEnvName in process.env)) {
            return new ErrorResponse({
                error: `Chain ${state.chainId} is not supported.`,
            }, 400)
        }
        const chainRpc = process.env[chainRpcEnvName]
        const contractAddressEnvName = `FAUCET_CONTRACT_ADDRESS_${state.chainId}`
        if (!(contractAddressEnvName in process.env)) {
            return new ErrorResponse({
                error: 'Server is misconfigured.',
            })
        }
        const contractAddress = Web3.utils.toHex(process.env[contractAddressEnvName])
        if (contractAddress === '0x') {
            return new ErrorResponse({
                error: 'Server is misconfigured.',
            })
        }
        const contractOwnerPrivateKeyEnvName = `FAUCET_CONTRACT_OWNER_PRIVATE_KEY_${state.chainId}`
        if (!(contractOwnerPrivateKeyEnvName in process.env)) {
            return new ErrorResponse({
                error: 'Server is misconfigured.',
            })
        }
        const contractOwnerPrivateKey = Web3.utils.toHex(process.env[contractOwnerPrivateKeyEnvName])
        if (contractOwnerPrivateKey === '0x') {
            return new ErrorResponse({
                error: 'Server is misconfigured.',
            })
        }

        try {
            const web3 = new Web3(chainRpc)
            const owner = web3.eth.accounts.wallet.add(contractOwnerPrivateKey).get(0)
            const contract = new web3.eth.Contract(contractAbi, contractAddress, {
                from: owner.address,
            })
            const sendTransaction = contract.methods.send(state.address)
            const signedSendTransaction = await web3.eth.accounts.signTransaction({
                to: contractAddress,
                data: sendTransaction.encodeABI(),
                gas: await sendTransaction.estimateGas(),
                gasPrice: Web3.utils.toHex(await web3.eth.getGasPrice()),
                nonce: Web3.utils.toHex(await web3.eth.getTransactionCount(owner.address, 'latest')),
            }, owner.privateKey)
            const sendTransactionReceipt = await web3.eth.sendSignedTransaction(signedSendTransaction.rawTransaction)
            return new SuccessResponse({
                transactionHash: sendTransactionReceipt.transactionHash,
            })
        }
        catch (err) {
            return new ErrorResponse({
                error: err?.innerError?.message || 'Something went wrong.',
            })
        }
    }
}
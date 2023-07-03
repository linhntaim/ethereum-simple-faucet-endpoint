import {Controller} from '../support/controller'
import {ErrorResponse, SuccessResponse} from '../support/response'
import {Web3} from 'web3'
import contractAbi from '../data/contract-abi.json'
import supportedChains from '../data/supported-chains.json'

export class ClaimController extends Controller
{
    async claim(request) {
        const state = request.body
        if (!('chainId' in state)) {
            return new ErrorResponse({
                error: 'Chain ID is missing',
            }, 403)
        }
        if (!('address' in state)) {
            return new ErrorResponse({
                error: 'Address is missing',
            }, 403)
        }
        if (!(state.chainId in supportedChains)) {
            return new ErrorResponse({
                error: `Chain ${state.chainId} is not supported`,
            }, 403)
        }
        const contractAddressEnvName = 'FAUCET_CONTRACT_ADDRESS_' + state.chainId
        if (!(contractAddressEnvName in process.env)) {
            return new ErrorResponse({
                error: 'Server is misconfigured',
            })
        }
        const contractAddress = Web3.utils.toHex(process.env[contractAddressEnvName])
        if (contractAddress === '0x') {
            return new ErrorResponse({
                error: 'Server is misconfigured',
            })
        }
        const contractOwnerPrivateKeyEnvName = 'FAUCET_CONTRACT_OWNER_PRIVATE_KEY_' + state.chainId
        if (!(contractOwnerPrivateKeyEnvName in process.env)) {
            return new ErrorResponse({
                error: 'Server is misconfigured',
            })
        }
        const contractOwnerPrivateKey = Web3.utils.toHex(process.env[contractOwnerPrivateKeyEnvName])
        if (contractOwnerPrivateKey === '0x') {
            return new ErrorResponse({
                error: 'Server is misconfigured',
            })
        }

        try {
            const web3 = new Web3(supportedChains[state.chainId].rpc)
            const wallet = web3.eth.accounts.wallet.add(contractOwnerPrivateKey)
            const owner = wallet.get(0)
            console.log('Wallet:', wallet, owner)
            const contract = new web3.eth.Contract(contractAbi, contractAddress)
            const balance = await contract.methods.getBalance().call()
            console.log('Balance:', balance)
            const sendTransaction = contract.methods.send(state.address)
            const signedSendTransaction = await web3.eth.accounts.signTransaction({
                from: owner.address,
                to: contractAddress,
                data: sendTransaction.encodeABI(),
                gas: await sendTransaction.estimateGas(),
                gasPrice: Web3.utils.toHex(await web3.eth.getGasPrice()),
                nonce: Web3.utils.toHex(await web3.eth.getTransactionCount(owner.address)),
            }, owner.privateKey)
            console.log('Signed:', signedSendTransaction)
            const executedSendTransaction = await web3.eth.sendSignedTransaction(signedSendTransaction.rawTransaction)
            console.log(`Tx successful with hash: ${executedSendTransaction.transactionHash}`)
        }
        catch (err) {
            console.log('Error:', err)
            return new ErrorResponse({
                error: 'Something went wrong',
            })
        }

        return new SuccessResponse()
    }
}
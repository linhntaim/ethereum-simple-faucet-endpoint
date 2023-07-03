import {Controller} from '../support/controller'
import {ErrorResponse, SuccessResponse} from '../support/response'
import {Web3} from 'web3'
import supportedChains from '../data/supported-chains.js'

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
        const contractOwnerPrivateKeyEnvName = 'FAUCET_CONTRACT_OWNER_PRIVATE_KEY_' + state.chainId
        if (!(contractOwnerPrivateKeyEnvName in process.env)) {
            return new ErrorResponse({
                error: 'Server is misconfigured',
            })
        }
        const contractOwnerPrivateKey = (privateKey => privateKey.substring(0, 2) === '0x' ? privateKey : '0x' + privateKey)(process.env[contractOwnerPrivateKeyEnvName])
        if (contractOwnerPrivateKey === '0x') {
            return new ErrorResponse({
                error: 'Server is misconfigured',
            })
        }

        const httpProvider = new Web3.providers.HttpProvider(supportedChains[state.chainId].rpc)
        const web3 = new Web3(httpProvider)

        try {
            const contractOwner = web3.eth.accounts.wallet.add(process.env[contractOwnerPrivateKeyEnvName])[0]
            console.log('Contract owner:', contractOwner.address)

            // TODO: Call contract
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
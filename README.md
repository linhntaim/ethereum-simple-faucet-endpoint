# ethereum-simple-faucet-endpoint

The endpoint provides an API for client to request to get fund from [the faucet contract](https://github.com/linhntaim/ethereum-simple-faucet-contract).

## Commands

### Build

```
npm run build
```

### Serve

```
npm run serve
```

### Build & Serve (for Development)

```
npm run dev
```

## Configurations

_Note: The faucet contract is supported to be deployed to multiple chains._

### The contract address

The contract address is an environment variable created in the following format:

```
FAUCET_CONTRACT_ADDRESS_{chain_id}={address}
```

- `chain_id`: The ID of the chain in decimal (eg. Ethereum ID = 1, ..). See https://chainlist.org/.
- `address`: The address of the contract on the chain.

It could be defined in the `.env` file.

### The contract owner's address

The contract owner's address is an environment variable created in the following format:

```
FAUCET_CONTRACT_OWNER_PRIVATE_KEY_{chain_id}={address}
```

- `chain_id`: The ID of the chain in decimal (eg. Ethereum ID = 1, ..). See https://chainlist.org/.
- `address`: The address of the owner of the contract on the chain.

It could be defined in the `.env` file.

### The contract ABI

The contract ABI file is stored in `src/app/data/contract-abi.json`.

### Chain RPCs

The list of supported chain RPCs is stored in `src/app/data/supported-chains.json`.

## API

There is only an API provided:

### Claim API

```
POST /claim
```

Body params:
- `chainId`: The ID of the chain in decimal (eg. Ethereum ID = 1, ..). See https://chainlist.org/.
- `address`: The address where the faucet should send the fund to.

## How it works

```
                                 <Contract>   <Owner>
                                        \      /
                                      +----------+
    Client ---(request Claim API)---> | Endpoint |---(make a transaction from owner to contract)--+ 
    /    \                            +----------+                                                |
<Chain> <Address>                                                                                 |
    \    /                                                                                        |
     \  /                                                                                         |
     User <---(send fund, fee paid by owner)--- Smartcontract <---(call function)--- Chain RPC <--+

```
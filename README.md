# cosmcli

A chain-agnostic CLI tool for interacting with Cosmos SDK blockchains.

## Installation

You can install the CLI tool globally using npm, yarn, or pnpm:

```bash
# Using npm
npm install -g cosmcli

# Using yarn
yarn global add cosmcli

# Using pnpm
pnpm add -g cosmcli
```

Alternatively, you can use it directly without installation using npx:

```bash
npx cosmcli <command>
```

## Features

- IBC transfers between Cosmos chains
- Chain-agnostic design (works with any Cosmos SDK chain)
- Simple and intuitive command-line interface

## Commands

### IBC Transfer

Transfer tokens from one chain to another using IBC.

```bash
cosmcli ibc-transfer [options]
```

#### Required Options

- `--rpc <rpc>`: RPC URL of the source chain
- `--seed <seed>`: Seed phrase/mnemonic for the sender's wallet
- `--prefix <prefix>`: Bech32 address prefix of the source chain (e.g., `"cosmos"`, `"stride"`, `"osmo"`)
- `--gas-price <gasPrice>`: Gas price per unit (e.g., `"0.025uatom"`)
- `--receiver <receiver>`: Destination address to receive tokens
- `--amount <amount>`: Amount to transfer (e.g., `"10uatom"`)
- `--src-channel <srcChannel>`: Source channel ID for the IBC transfer

#### Optional Options

- `--gas-adjustment <gasAdjustment>`: Gas multiplier for transaction simulation (default: `"1.4"`)
- `-v, --verbose`: Enable verbose logging (default: `false`)
- `--src-port <srcPort>`: Source port for IBC (default: `"transfer"`)
- `--timeout <timeout>`: Timeout in seconds (default: `"180"`)
- `--memo <memo>`: Transaction memo (default: `""`)

#### Example

```bash
cosmcli ibc-transfer \
  --rpc https://rpc.cosmos.network \
  --seed "your mnemonic words here" \
  --prefix cosmos \
  --gas-price 0.025uatom \
  --receiver osmo1yourosmoaddress \
  --amount 10uatom \
  --src-channel channel-141
```

## Response Format

On successful IBC transfer, the tool outputs a JSON object containing:

- `tx`: Transaction hash on the source chain
- `ibcAck`: IBC acknowledgement transaction hash

Example output:

```json
{ "tx": "ABC123DEF456GHI789JKL", "ibcAck": "MNO123PQR456STU789VWX" }
```

## Error Handling

If an error occurs, the program will:

1. Print an error message to stderr
2. Exit with a non-zero status code (1)

With the `--verbose` flag, additional error details and stack traces are provided.

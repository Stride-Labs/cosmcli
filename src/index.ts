#!/usr/bin/env node

import { DirectSecp256k1HdWallet } from "@cosmjs/proto-signing";
import { GasPrice, SigningStargateClient } from "@cosmjs/stargate";
import { Command } from "commander";
import { coinFromString, getTxIbcResponses, getValueFromEvents, ibc } from "stridejs";

const program = new Command();

program.name("cosmcli").description("A chain-agnostic cosmos-sdk cli tool").version("0.0.1");

// const txCommand = program
//   .command("tx")
//   .description("Transaction commands")
//   .requiredOption("--rpc <rpc>", "RPC URL")
//   .requiredOption("--seed <seed>", "Seed phrase aka mnemonics")
//   .requiredOption("--prefix <prefix>", "Chain prefix")
//   .option("--gas-adjustment <gasAdjustment>", "gas multiplier after simulating the tx", "1.4")
//   .option("-v, --verbose", "Enable verbose logging", "false");

program
  .command("ibc-transfer")
  .description("Perform an IBC transfer between chains")
  .requiredOption("--rpc <rpc>", "RPC URL")
  .requiredOption("--seed <seed>", "Seed phrase aka mnemonics")
  .requiredOption("--prefix <prefix>", "Chain prefix")
  .requiredOption("--gas-price <gasPrice>", "gas price per one gas unit")
  .option("--gas-adjustment <gasAdjustment>", "gas multiplier after simulating the tx", "1.4")
  .option("-v, --verbose", "Enable verbose logging", false)
  .requiredOption("--receiver <receiver>", "Receiver address")
  .requiredOption("--amount <amount>", "Amount to transfer")
  .requiredOption("--src-channel <srcChannel>", "Source channel")
  .option("--src-port <srcPort>", "Source port", "transfer")
  .option("--timeout <timeout>", "Timeout in seconds", "180")
  .option("--memo <memo>", "Memo", "")
  .action(
    async ({
      rpc,
      seed,
      prefix,
      gasPrice,
      gasAdjustment,
      receiver,
      amount,
      srcPort,
      srcChannel,
      timeout,
      memo,
      verbose,
    }: {
      rpc: string;
      seed: string;
      prefix: string;
      gasPrice: string;
      gasAdjustment: string;
      receiver: string;
      amount: string;
      srcPort: string;
      srcChannel: string;
      timeout: string;
      memo: string;
      verbose: boolean;
    }) => {
      try {
        const signer = await DirectSecp256k1HdWallet.fromMnemonic(seed, {
          prefix,
        });
        const [{ address }] = await signer.getAccounts();

        if (verbose) {
          console.error(`Using sender address: ${address}`);
          console.error(`Initiating IBC transfer from ${address} to ${receiver}`);
          console.error(`Amount: ${amount}, Channel: ${srcChannel}, Port: ${srcPort}`);
        }
        const client = await SigningStargateClient.connectWithSigner(rpc, signer, {
          gasPrice: GasPrice.fromString(gasPrice),
        });

        const msg = ibc.applications.transfer.v1.MessageComposer.withTypeUrl.transfer({
          sourcePort: srcPort,
          sourceChannel: srcChannel,
          token: coinFromString(amount),
          sender: address,
          receiver: receiver,
          timeoutHeight: {
            revisionNumber: BigInt(0),
            revisionHeight: BigInt(0),
          },
          timeoutTimestamp: transferTimeoutSec(Number(timeout)),
          memo: memo,
        });

        if (verbose) {
          console.error("Signing and broadcasting transaction...");
        }
        const tx = await client.signAndBroadcast(address, [msg], Number(gasAdjustment));
        if (tx.code === 0) {
          if (verbose) {
            console.error(`Transaction successful! Hash: ${tx.transactionHash}`);
          }
        } else {
          console.error(`Transaction failed with code ${tx.code}: ${tx.rawLog}`);
          process.exit(1);
        }

        if (verbose) {
          console.error("Waiting for IBC acknowledgement...");
        }

        const ibcAck = await getTxIbcResponses(client, tx)[0];

        if (
          ibcAck.type === "ack" &&
          ibcAck.tx.code === 0 &&
          getValueFromEvents(ibcAck.tx.events, "fungible_token_packet.success") === "\u0001"
        ) {
          console.log(JSON.stringify({ tx: tx.transactionHash, ibcAck: ibcAck.tx.hash }));
          process.exit(0);
        } else {
          console.error("IBC transfer failed during relay");
          if (verbose) {
            console.error(`IBC acknowledgement details: ${stringify(ibcAck)}`);
          }
          process.exit(1);
        }
      } catch (error) {
        console.error(`Error: ${error instanceof Error ? error.message : String(error)}`);
        if (verbose && error instanceof Error && error.stack) {
          console.error(error.stack);
        }
        process.exit(1);
      }
    },
  );

program.parse();

function transferTimeoutSec(sec: number) {
  return BigInt(`${Math.floor(Date.now() / 1000) + sec}000000000`);
}

function stringify(obj: any) {
  return JSON.stringify(obj, (key, value) => (typeof value === "bigint" ? value.toString() : value), 2);
}

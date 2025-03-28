import { verifyMessageSignatureRsv, encodeMessage } from "@stacks/encryption";
import {
  signMessageHashRsv,
  privateKeyToPublic,
  privateKeyToAddress,
  transactionToHex,
  makeContractCall,
  broadcastTransaction,
} from "@stacks/transactions";
import { generateWallet } from "@stacks/wallet-sdk";
import { c32ToB58 } from "c32check";
import { generateP2TR } from "../accounts";
import { hashUint8Array } from "../helpers";

// handles method stx_signMessage
async function handleSignMessage(message: string, mnemonic: string, accountIndex: number) {
  let wallet = await generateWallet({
    secretKey: mnemonic,
    password: "",
  });

  const LEGACY_PREFIX = "\x18Stacks Message Signing:\n";
  let encodedMessage = encodeMessage(message, LEGACY_PREFIX);
  let messageHash = await hashUint8Array(encodedMessage);

  let signature = signMessageHashRsv({
    messageHash,
    privateKey: wallet.accounts[0].stxPrivateKey,
  });

  let result = verifyMessageSignatureRsv({
    signature,
    message,
    publicKey: String(privateKeyToPublic(wallet.accounts[0].stxPrivateKey)),
  });

  return {
    source: "LaserProvider",
    type: "CONFIRMATION",
    method: "stx_signMessage",
    status: "CONFIRMED",
    data: {
      signature,
      signatureVerified: result,
    },
  };
}

// handles method getAddresses
async function handleGetAddresses(mnemonic: string, accountIndex: number) {
  let wallet = await generateWallet({
    secretKey: mnemonic,
    password: "",
  });

  let pubKey = privateKeyToPublic(wallet.accounts[accountIndex].stxPrivateKey).toString();
  let stxAddress = privateKeyToAddress(wallet.accounts[accountIndex].stxPrivateKey, "mainnet");
  let btcP2PKHAddress = c32ToB58(stxAddress);
  let btcP2TRAddress = await generateP2TR(pubKey);

  return {
    source: "LaserProvider",
    type: "CONFIRMATION",
    method: "getAddresses",
    status: "CONFIRMED",
    data: {
      addresses: [
        {
          symbol: "BTC",
          type: "p2pkh",
          address: btcP2PKHAddress,
          publicKey: pubKey,
          derivationPath: "m/84'/0'/0'/0/0",
        },
        {
          symbol: "BTC",
          type: "p2tr",
          address: btcP2TRAddress,
          publicKey: pubKey,
          tweakedPublicKey: "",
          derivationPath: "m/86'/0'/0'/0/0",
        },
        {
          symbol: "STX",
          address: stxAddress,
          publicKey: pubKey,
        },
      ],
    },
  };
}

// handles method stx_callContract
async function handleCallContract(params: object, mnemonic: string, accountIndex: number) {
  let wallet = await generateWallet({
    secretKey: mnemonic,
    password: "",
  });

  let pubKey = privateKeyToPublic(wallet.accounts[accountIndex].stxPrivateKey).toString();
  let stxAddress = privateKeyToAddress(wallet.accounts[accountIndex].stxPrivateKey, "mainnet");

  let transaction = await makeContractCall({
    // @ts-ignore
    contractAddress: params.contract.split(".")[0],
    // @ts-ignore
    contractName: params.contract.split(".")[1],
    // @ts-ignore
    functionName: params.functionName,
    // @ts-ignore
    functionArgs: params.functionArgs,
    senderKey: wallet.accounts[accountIndex].stxPrivateKey,
    // @ts-ignore
    network: params.network,
  });

  const response = await broadcastTransaction({ transaction, network: "mainnet" });

  return {
    source: "LaserProvider",
    type: "CONFIRMATION",
    method: "stx_callContract",
    status: "CONFIRMED",
    data: {
      txid: response.txid,
      transaction: transactionToHex(transaction),
    },
  };
}

export { handleSignMessage, handleGetAddresses, handleCallContract };

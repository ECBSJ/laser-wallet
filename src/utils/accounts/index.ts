import { generateNewAccount, generateWallet, randomSeedPhrase } from "@stacks/wallet-sdk";
import { privateKeyToAddress, privateKeyToPublic } from "@stacks/transactions";
import { c32ToB58 } from "c32check";
import { Buffer } from "buffer";
import ecc from "@bitcoinerlab/secp256k1";
import { type Account } from "../types";
import type { Ref } from "vue";

async function generateInitialAccounts(mnemonic: string) {
  let wallet = await generateWallet({
    secretKey: mnemonic!,
    password: "",
  });

  let wallets = [wallet];

  for (let index = 0; index < 19; index++) {
    let newWallet = generateNewAccount(wallets[index]);
    wallets.push(newWallet);
  }

  let accounts: Account[] = [];

  for (let index = 0; index < 20; index++) {
    let path = `m/44'/5757'/0'/0/${index}`;

    let stxAddress = privateKeyToAddress(wallets[19].accounts[index].stxPrivateKey, "mainnet");

    let btcP2PKHAddress = c32ToB58(stxAddress);

    let pubkey = privateKeyToPublic(wallets[19].accounts[index].stxPrivateKey).toString();

    let privkey = wallets[19].accounts[index].stxPrivateKey;

    let btcP2TRAddress = await generateP2TR(pubkey);

    accounts.push({
      path,
      stxAddress,
      btcP2PKHAddress,
      btcP2TRAddress,
      pubkey,
      privkey,
    });
  }

  console.log("[LaserProvider]: First 20 accounts generated:");
  console.log(accounts);

  return accounts;
}

async function generateP2TR(pubkey: String) {
  // @ts-ignore
  bitcoin.initEccLib(ecc);

  // @ts-ignore
  const taproot = bitcoin.payments.p2tr({
    internalPubkey: Buffer.from(pubkey.slice(2), "hex"),
    // @ts-ignore
    network: bitcoin.networks.bitcoin,
  });

  return taproot.address;
}

let totalAdd = 0;
const c32_regex = /^[0123456789ABCDEFGHJKMNPQRSTVWXYZ]+$/;
let workerThread: any[] = [];

async function generateVanity(
  userinput: string,
  vanityResult: Ref<object>,
  isVanityGenerating: Ref<boolean>,
  mnemonic: Ref<string>
) {
  isVanityGenerating.value = true;

  totalAdd = 0;

  let userVanity = userinput.toUpperCase();

  if (c32_regex.test(userVanity)) {
    for (let index = 0; index < navigator.hardwareConcurrency; index++) {
      const worker = new Worker(new URL("/public/worker.js", import.meta.url), {
        type: "module",
      });

      worker.onmessage = function (e) {
        if (e.data.status === "success") {
          for (let p = 0; p < workerThread.length; p++) {
            console.log("Terminating worker thread: " + p);
            workerThread[p].terminate();
          }

          console.log(`Worker thread ${e.data.worker} found the vanity address`);
          console.log(e.data);
          isVanityGenerating.value = false;
          vanityResult.value = e.data.treasure;
          mnemonic.value = e.data.treasure.vanityPrivKey;
        }

        if (e.data.status === "searching") {
          totalAdd = totalAdd + 100;
        }
      };

      worker.postMessage({ index: index, vanity: userVanity });
      workerThread.push(worker);
    }
  } else {
    console.log("Invalid characters. Try again.");
  }
}

export { generateInitialAccounts, generateVanity, generateP2TR };

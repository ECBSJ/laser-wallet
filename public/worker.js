import { privateKeyToAddress } from "@stacks/transactions";
import { generateWallet, randomSeedPhrase } from "@stacks/wallet-sdk";

self.onmessage = async function (message) {
  console.log(`Web Worker ${message.data.index} is working...`);
  let nonce = 0;

  while (true) {
    let vanityPrivKey = randomSeedPhrase();
    let wallet = await generateWallet({
      secretKey: vanityPrivKey,
      password: "",
    });
    let vanityAddress = privateKeyToAddress(wallet.accounts[0].stxPrivateKey, "mainnet");

    nonce++;

    if (vanityAddress.endsWith(message.data.vanity)) {
      console.log(`Worker thread ${message.data.index} searched through ${nonce} addresses`);

      self.postMessage({
        status: "success",
        worker: message.data.index,
        treasure: {
          vanityPrivKey,
          vanityAddress,
        },
      });

      break;
    }

    if (nonce % 100 === 0) {
      let datax = {
        status: "searching",
        worker: message.data.index,
        nonce: "new 100",
      };
      self.postMessage(datax);
    }
  }
};

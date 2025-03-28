<script setup lang="ts">
import { onBeforeMount, ref } from "vue";
import { handleSignMessage, handleGetAddresses, handleCallContract } from "../utils/stxmethods";

let mnemonic = ref("");
let accountIndex = ref(0);

onBeforeMount(() => {
  let storageMnemonic = localStorage.getItem("mnemonic");

  if (!storageMnemonic) {
    return;
  }

  // todo: determine which account index user wallet is using and update accountIndex ref value

  mnemonic.value = storageMnemonic!;
});

// props being passed from App.vue
// payload consists of the method and params to be executed
// tabId is the id of the window tab that opened the popup
let props = defineProps<{
  payload: Object;
  tabId: string;
}>();

console.log(props.payload);
console.log(props.tabId);

// handleConfirm function to execute the method and params from the payload
async function handleConfirm() {
  if (!props.tabId) return;

  let result: Record<string, any> = {};

  // @ts-ignore
  switch (props.payload.method) {
    case "getAddresses":
      result = await handleGetAddresses(mnemonic.value, accountIndex.value);
      break;
    case "stx_signMessage":
      result = await handleSignMessage(
        // @ts-ignore
        props.payload.params.message,
        mnemonic.value,
        accountIndex.value
      );
      break;
    case "stx_callContract":
      // @ts-ignore
      result = await handleCallContract(props.payload.params, mnemonic.value, accountIndex.value);
      break;
    case "stx_transferStx":
      // todo: handle transferStx
      break;
    case "stx_transferSip10Ft":
      // todo: handle transferSip10Ft
      break;
    case "stx_signTransaction":
      // todo: handle signTransaction
      break;
    case "stx_signStructuredMessage":
      // todo: handle signStructuredMessage
      break;
    case "stx_deployContract":
      // todo: handle deployContract
      break;
    case "signPsbt":
      // handle signPsbt
      break;
    case "sendTransfer":
      // handle sendTransfer
      break;
    default:
      console.log("Error");
      break;
  }

  if (result.status === "CONFIRMED") {
    chrome.tabs.sendMessage(parseInt(props.tabId), {
      jsonrpc: "2.0",
      result: result.data,
      // @ts-ignore
      id: props.payload.id,
    });
  } else {
    chrome.tabs.sendMessage(parseInt(props.tabId), {
      jsonrpc: "2.0",
      error: {
        code: -32601,
        message: "Method not found",
        data: "something went wrong",
      },
      // @ts-ignore
      id: props.payload.id,
    });
  }

  window.close();
}
</script>

<template>
  <section class="user-page">
    <div class="user-page-header">
      <h2>Confirm Action</h2>
      <img src="/laser-eyes-lil-guy-dark.png" width="30px" alt="laser-logo" />
    </div>

    <div class="confirmation-details">{{ JSON.stringify(props.payload) }}</div>

    <button @click="handleConfirm">Confirm</button>
  </section>
</template>

<style scoped>
.confirmation-details {
  font-family: monospace;
  word-wrap: break-word;
}
</style>

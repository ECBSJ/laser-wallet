<script setup lang="ts">
import { onBeforeMount, ref, type Ref } from "vue";
import { randomSeedPhrase } from "@stacks/wallet-sdk";
import { useRouter } from "vue-router";
import { generateVanity } from "../utils/accounts";
import { CircleHelp } from "lucide-vue-next";

const router = useRouter();

let mnemonic = ref("");
let isVanityOpen = ref(false);
let userinput = ref("");
let isVanityGenerating = ref(false);
let vanityResult: Ref = ref<object>();

// generate random mnemonic seed phrase
const handleGenerateSecret = async () => {
  if (isVanityOpen.value) {
    isVanityOpen.value = false;
  }

  const seedPhrase = randomSeedPhrase();
  console.log(seedPhrase);

  mnemonic.value = seedPhrase;
};

const handleAcceptSecret = () => {
  // todo: encrypt secret before saving

  // save secret to local storage
  localStorage.setItem("mnemonic", mnemonic.value);

  // navigate to user home page
  router.push({ path: "/user" });
};

onBeforeMount(() => {
  // check if user already has a mnemonic stored
  const mnemonic = localStorage.getItem("mnemonic");

  if (mnemonic) {
    router.push({ path: "/user" });
  }
});

function handleOpenVanity() {
  isVanityOpen.value = !isVanityOpen.value;
}

async function handleGenerateVanity() {
  await generateVanity(userinput.value, vanityResult, isVanityGenerating, mnemonic);
}
</script>

<template>
  <section class="start-page">
    <div class="start-page-top">
      <img src="/laser-eyes-lil-guy-dark.png" width="100px" alt="laser-logo" />
      <h1>laser wallet</h1>
      <div>Your Bitcoin experience, secured.</div>
    </div>

    <div class="start-page-bottom">
      <div class="start-page-bottom" v-if="isVanityOpen">
        <div class="result-view" v-if="vanityResult">
          <span>{{ vanityResult.vanityPrivKey }}</span> <br />
          <span class="vanity-address">{{ vanityResult.vanityAddress }}</span>
          <button @click="handleAcceptSecret">Create Wallet</button>
        </div>
        <span class="label"
          >Vanity characters requirements <CircleHelp class="icon" :size="15"
        /></span>
        <input type="text" v-model="userinput" placeholder="Input vanity characters" />
        <button :disabled="isVanityGenerating" @click="handleGenerateVanity">
          {{ isVanityGenerating ? "Generating..." : "Generate Vanity" }}
        </button>
        <button @click="handleGenerateSecret">Random Mnemonic</button>
      </div>
      <div class="start-page-bottom" v-else>
        <span class="mnemonic">{{ mnemonic }}</span>
        <button @click="handleGenerateSecret">Random Mnemonic</button>
        <button @click="handleOpenVanity">Vanity Address</button>
        <button v-if="mnemonic" @click="handleAcceptSecret">Create Wallet</button>
      </div>
    </div>
  </section>
</template>

<style scoped>
.vanity-address {
  font-family: "Aeonik";
}

.result-view {
  font-family: "AeonikMono";
  width: 100%;
  font-size: 0.75rem;
}

.mnemonic {
  font-size: 1.1rem;
  font-family: monospace;
  word-wrap: break-word;
  text-align: justify;
}

.start-page {
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.start-page-top {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.start-page-bottom {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
  row-gap: 13px;
}
</style>

<script setup lang="ts">
import { useRouter } from "vue-router";
import { onBeforeMount, ref } from "vue";
import { generateInitialAccounts } from "../utils/accounts";
import { type Account } from "..//utils/types";

const router = useRouter();
let userAccounts = ref([] as Account[]);
let accountIndexToDisplay = ref(0);

onBeforeMount(async () => {
  const mnemonic = localStorage.getItem("mnemonic");

  if (!mnemonic) {
    router.push({ path: "/" });
  }

  let accounts = await generateInitialAccounts(mnemonic!);
  userAccounts.value = accounts;
});

const handleOpenUserMenu = () => {
  router.push({ path: "/usermenu" });
};
</script>

<template>
  <section class="user-page">
    <div class="user-page-header">
      <select v-model="accountIndexToDisplay">
        <option v-for="(account, index) in userAccounts" :key="index" :value="index">
          Account {{ index + 1 }}
        </option>
      </select>
      <img
        class="laser-logo"
        @click="handleOpenUserMenu"
        src="/laser-eyes-lil-guy-dark.png"
        width="30px"
        alt="laser-logo"
      />
    </div>

    <div class="user-page-top">
      <h1>Account {{ accountIndexToDisplay + 1 }}</h1>
      <small>Total Value</small>
      <div class="value-display">$1,000,000</div>
    </div>

    <div class="user-page-bottom">
      <small>Assets</small>
      <div class="assets-display">
        <div class="assets-display-row">
          <span>STX</span>
          <span>{{
            userAccounts[accountIndexToDisplay]?.stxAddress.slice(0, 7) +
            "..." +
            userAccounts[accountIndexToDisplay]?.stxAddress.slice(-7)
          }}</span>
          <span>0</span>
        </div>
        <div class="assets-display-row">
          <span>BTC</span>
          <span>{{
            userAccounts[accountIndexToDisplay]?.btcP2PKHAddress.slice(0, 7) +
            "..." +
            userAccounts[accountIndexToDisplay]?.btcP2PKHAddress.slice(-7)
          }}</span>
          <span>0</span>
        </div>
        <div class="assets-display-row">
          <span>Runes</span>
          <span>{{
            userAccounts[accountIndexToDisplay]?.btcP2TRAddress.slice(0, 7) +
            "..." +
            userAccounts[accountIndexToDisplay]?.btcP2TRAddress.slice(-7)
          }}</span>
          <span>0</span>
        </div>
        <div class="assets-display-row">
          <span>Ordinals</span>
          <span>{{
            userAccounts[accountIndexToDisplay]?.btcP2TRAddress.slice(0, 7) +
            "..." +
            userAccounts[accountIndexToDisplay]?.btcP2TRAddress.slice(-7)
          }}</span>
          <span>0</span>
        </div>
      </div>
    </div>
  </section>
</template>

<style>
select {
  cursor: pointer;
  border: none;
  background: transparent;
  font-family: "AeonikFono";
}

small {
  color: #8c877d;
}

.laser-logo {
  cursor: pointer;
}

.assets-display-row {
  display: flex;
  justify-content: space-between;
  width: 100%;
  font-family: monospace;
}

.assets-display {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  row-gap: 10px;
}

.value-display {
  font-size: 3rem;
  font-weight: bolder;
  font-family: monospace;
}

.user-page-header {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.user-page-top {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  justify-content: flex-start;
}

.user-page-bottom {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  row-gap: 20px;
}

.user-page {
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  row-gap: 30px;
}
</style>

// type structure of the Account object for each user account
type Account = {
  path: String;
  stxAddress: String;
  btcP2PKHAddress: String;
  btcP2TRAddress: String;
  pubkey: String;
  privkey: String;
};

export type { Account };

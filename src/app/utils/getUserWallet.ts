import { Wallet } from 'ethers';


export const getUserWallet = (phrase: string) => {
  /**
   * If the phrase does not contain spaces, it is likely a private key
   */
  const wallet = phrase.includes(' ')
    ? Wallet.fromPhrase(phrase)
    : new Wallet(phrase);

  return { wallet };

};


export const createNewUserWallet = () => {
  /**
   * If the phrase does not contain spaces, it is likely a private key
   */
  const wallet = Wallet.createRandom()

  return { wallet };

};

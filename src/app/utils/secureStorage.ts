import SecureLS from "secure-ls";
import { getUserWallet } from "./getUserWallet";
import { decrypt } from "./encryption";

export const ls = new SecureLS({ encodingType: "aes" });

type Observer = { key: string; callback: (ss: SecureLocalStorage) => void };

export enum SCHEMA {
  PASSWORD = "password",
  ENCRYPTED_PRIVATE_KEY = "encryptedPrivateKey",
}

class SecureLocalStorage {
  public get userWallet() {
    const pass = this.getData(SCHEMA.PASSWORD);
    if (!pass) return;

    const key = this.getData(SCHEMA.ENCRYPTED_PRIVATE_KEY);
    if (!key) return;

    const { wallet } = getUserWallet(decrypt(key, pass));

    return wallet;
  }

  public get address() {
    const wallet = this.userWallet;
    if (!wallet) return;

    return wallet.address;
  }

  public signMessage = async (message: string | Uint8Array) => {
    const wallet = this.userWallet;
    if (!wallet) return;

    return await wallet.signMessage(message);
  };

  public lock = () => {
    ls.clear();
    this.updateSubscriptions();
  };
  public storeData = (key: string, value: string) => {
    ls.set(key, value);
    this.updateSubscriptions();
  };

  public getData = (key: string): string | null => {
    return ls.get(key);
  };

  public subscribe = ({ key, callback }: Observer) => {
    this.observers.set(key, { key, callback });
  };

  public clearSubscribtion = ({ key }: { key: string }) => {
    this.observers.delete(key);
  };
  public clearAllSubscribtions = () => {
    this.observers.clear();
  };

  private updateSubscriptions = () => {
    this.observers.forEach(({ callback }) => callback(this));
  };
  private observers: Map<string, Observer> = new Map();
}

export const secureLocalStorage = new SecureLocalStorage();

import SecureLS from "secure-ls";
import { getUserWallet } from "./getUserWallet";
import { decrypt } from "./encryption";


type Observer = { key: string; callback: (ss: SecureLocalStorage) => void };

export enum SCHEMA {
  PASSWORD = "password",
  ENCRYPTED_PRIVATE_KEY = "encryptedPrivateKey",
}

export class SecureLocalStorage {

  private ls: SecureLS
  constructor() {
    this.ls = new SecureLS({ encodingType: 'aes'})
  }
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


  public signMessage = async (message: string) => {
    const wallet = this.userWallet;
    if (!wallet) return;

    return await wallet.signMessage(message);
  };

  public lock = () => {
    this.ls.clear();
    this.updateSubscriptions();
  };
  public storeData = (key: string, value: string) => {
    this.ls.set(key, value);
    this.updateSubscriptions();
  };

  public getData = (key: string): string | null => {
    return this.ls.get(key);
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


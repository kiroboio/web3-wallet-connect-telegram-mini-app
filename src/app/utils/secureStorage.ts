import SecureLS from "secure-ls";
import { getUserWallet } from "./getUserWallet";
import { decrypt } from "./encryption";
import { TriggerSubscriptionParams } from "../triggers/triggers";

type Observer = { key: string; callback: (ss: SecureLocalStorage) => void };

export enum SCHEMA {
  PASSWORD = "password",
  ENCRYPTED_PRIVATE_KEY = "encryptedPrivateKey",
  ADDRESS = "address",
  VAULT = "vault",
  TRIGGER = "trigger",
}

export class SecureLocalStorage {
  private ls: SecureLS;
  constructor() {
    this.ls = new SecureLS({ encodingType: "aes" });
  }
  public get userWallet() {
    const pass = this.getData(SCHEMA.PASSWORD);
    if (!pass) return;

    const key = this.getData(SCHEMA.ENCRYPTED_PRIVATE_KEY);
    if (!key) return;

    const { wallet } = getUserWallet(decrypt(key, pass));

    this.storeData(SCHEMA.ADDRESS, wallet.address);
    return wallet;
  }

  public get address() {
    const address = this.getData(SCHEMA.ADDRESS);

    if (address) return address;

    const wallet = this.userWallet;
    if (!wallet) return;

    return wallet.address;
  }

  public get privateKey() {
    const password = this.getData(SCHEMA.PASSWORD);
    const privateKey = this.getData(SCHEMA.ENCRYPTED_PRIVATE_KEY);

    if (privateKey && password) return decrypt(privateKey, password);

    const wallet = this.userWallet;
    if (!wallet) return;

    return wallet.privateKey;
  }

  public get vault() {
    const vault = this.getData(SCHEMA.VAULT);

    return vault;
  }

  public signMessage = async (message: string | Uint8Array) => {
    const wallet = this.userWallet;
    if (!wallet) return;

    return await wallet.signMessage(message);
  };

  public lock = () => {
    this.ls.clear();
    this.updateSubscriptions();
  };
  public storeData = (key: SCHEMA, value: string) => {
    if (key === SCHEMA.TRIGGER) return;

    this.ls.set(key, value);
    this.updateSubscriptions();
  };

  public storeTriggerData = (
    key: SCHEMA.TRIGGER,
    { value }: { value: TriggerSubscriptionParams }
  ) => {
    if (key !== SCHEMA.TRIGGER) return;

    const { intentId, triggerId } = value;
    const triggerKey = `${intentId}${triggerId}`;
    const triggers = this.ls.get(key) as
      | { [key: string]: TriggerSubscriptionParams }
      | undefined;
    if (triggers) {
      triggers[triggerKey] = value;
      this.ls.set(key, triggers);
    } else {
      this.ls.set(key, { [triggerKey]: value });
    }

    this.updateSubscriptions();
  };

  public addTriggerExecution = (
    key: SCHEMA.TRIGGER,
    {
      intentId,
      triggerId,
      execution,
    }: {
      intentId: string;
      triggerId: string;
      execution: TriggerSubscriptionParams["executions"][number];
    }
  ) => {
    if (key !== SCHEMA.TRIGGER) return;

    const triggerKey = `${intentId}${triggerId}`;
    const triggers = this.ls.get(key) as
      | { [key: string]: TriggerSubscriptionParams }
      | undefined;
    if (!triggers) return;

    triggers[triggerKey].executions.push(execution);
    this.ls.set(key, triggers);

    this.updateSubscriptions();
  };

  public clearTriggerData = (
    key: SCHEMA.TRIGGER,
    { intentId, triggerId }: { intentId: string; triggerId: string }
  ) => {
    if (key !== SCHEMA.TRIGGER) return;

    const triggerKey = `${intentId}${triggerId}`;
    const triggers = this.ls.get(key) as
      | { [key: string]: TriggerSubscriptionParams }
      | undefined;

    console.log({ triggers, triggerKey });
    if (!triggers) return;

    delete triggers[triggerKey]
    this.ls.set(key, triggers);
    console.log({ triggersafterremove: triggers, triggerKey });
    this.updateSubscriptions();
  };

  public clearAllTriggers = (key: SCHEMA.TRIGGER) => {
    if (key !== SCHEMA.TRIGGER) return;

    this.ls.remove(key);

    this.updateSubscriptions();
  };

  public getTriggersData = (
    key: SCHEMA.TRIGGER
  ): { [key: string]: TriggerSubscriptionParams } | undefined => {
    return this.ls.get(key);
  };

  public getData = (key: SCHEMA): string | null => {
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

  public updateSubscriptions = () => {
    this.observers.forEach(({ callback }) => callback(this));
  };
  private observers: Map<string, Observer> = new Map();
}

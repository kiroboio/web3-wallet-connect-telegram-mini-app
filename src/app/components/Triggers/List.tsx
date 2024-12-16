import { useSecureStorage } from "@/app/context/SecureStorageProvider";
import { SCHEMA } from "@/app/utils/secureStorage";
import { TriggerCard } from "./Card";
import { useEffect, useRef, useState } from "react";
import { TriggerSubscriptionParams } from "@/app/events/getEvents";
import { TokenList } from "./TokensList";
import { getTokensFromTriggers } from "@/app/utils/getTokensFromTriggers";
import { ChainId } from "@/app/utils/alchemy";


export const TriggersList = ({ chainId }: {chainId: ChainId}) => {
  const secureStorage = useSecureStorage();
  const storedTriggers = useRef(secureStorage?.getTriggersData(SCHEMA.TRIGGER));
  const [selectedTokenAddress, setSelectedTokenAddress] = useState<string | undefined>()
  const [triggers, setTriggers] = useState<
    | {
        [key: string]: TriggerSubscriptionParams;
      }
    | undefined
  >(storedTriggers.current);

  useEffect(() => {
    setTriggers(storedTriggers.current);
    secureStorage?.subscribe({
      key: "triggers_list",
      callback: (secureStorage) => {
        setTriggers(secureStorage.getTriggersData(SCHEMA.TRIGGER));
      },
      type: SCHEMA.TRIGGER
    });

    return () => {
      secureStorage?.clearSubscribtion({ key: "triggers_list" });
    };
  }, [secureStorage]);

  if (!triggers) return null;

  console.log({ storedTriggers, triggers });
  const tokens = getTokensFromTriggers(triggers)
  return (
    <div className="w-full">
      <TokenList triggers={triggers} chainId={chainId} tokens={tokens} userAddress={secureStorage?.vault} selectedTokenAddress={selectedTokenAddress?.toLowerCase()}/>
      {Object.keys(triggers)?.map((triggerKey) => {
        const trigger = triggers[triggerKey];
        return (
          <TriggerCard
            key={`${trigger.intentId}_${trigger.triggerId}`}
            trigger={trigger}
            setSelectedTokenAddress={setSelectedTokenAddress}
          />
        );
      })}
    </div>
  );
};

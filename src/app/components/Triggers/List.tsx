import { useSecureStorage } from "@/app/context/SecureStorageProvider";
import { SCHEMA } from "@/app/utils/secureStorage";
import { TriggerCard } from "./Card";
import { useEffect, useState } from "react";
import { TriggerSubscriptionParams } from "@/app/triggers/triggers";

export const TriggersList = () => {
  const secureStorage = useSecureStorage();
  const storedTriggers = secureStorage?.getTriggersData(SCHEMA.TRIGGER);

  const [triggers, setTriggers] = useState<
    | {
        [key: string]: TriggerSubscriptionParams;
      }
    | undefined
  >(storedTriggers);

  useEffect(() => {
    setTriggers(storedTriggers);
    secureStorage?.subscribe({
      key: "triggers_list",
      callback: (secureStorage) => {
        setTriggers(secureStorage.getTriggersData(SCHEMA.TRIGGER));
      },
    });

    return () => {
      secureStorage?.clearSubscribtion({ key: "triggers_list" });
    };
  }, [secureStorage]);

  if (!triggers) return null;

  console.log({ storedTriggers, triggers });
  return Object.keys(triggers)?.map((triggerKey) => {
    const trigger = triggers[triggerKey];

    return (
      <TriggerCard
        key={`${trigger.intentId}_${trigger.triggerId}`}
        trigger={trigger}
      />
    );
  });
};

import { TriggerSubscriptionParams } from "../events/getEvents";

export const getTokensFromTriggers = (triggers: {
  [key: string]: TriggerSubscriptionParams;
}): string[] => {
  const tokenAddresses = new Set<string>();

  for (const key in triggers) {
    const trigger = triggers[key];
    if (!trigger.executions || trigger.executions.length === 0) continue;

    for (const execution of trigger.executions) {
      if (!execution.values) continue;
      for (const val of execution.values) {
        if (val.type !== "token") continue;
        if (val.value === "FROM_TRIGGER") continue;

        if (typeof val.value === "string") tokenAddresses.add(val.value);
      }
    }
  }

  return Array.from(tokenAddresses);
};

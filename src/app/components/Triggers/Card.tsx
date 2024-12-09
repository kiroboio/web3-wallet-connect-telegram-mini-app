import { TriggerSubscriptionParams } from "@/app/events/getEvents";
import { useMemo } from "react";
import { Toggle } from "../Toggle";
import { VariableItem } from "./VariableItem";
import { ShortenAddress } from "../ShortenAddress";
import { convertToSentenceCase } from "@/app/utils/text";

export const TriggerCard = ({
  trigger,
}: {
  trigger: TriggerSubscriptionParams;
}) => {

  const sortedVariables = useMemo(() => {
    if (!trigger.externalVariables) return [];

    const sortedVars = trigger.externalVariables.sort((a, b) => {
      if (a.index === undefined || b.index === undefined) return 0;
      return a.index - b.index;
    });

    return sortedVars;
  }, [trigger.externalVariables]);

  return (
    <div className="card w-full bg-base-100 shadow-md p-4 mb-4">
      <div className="card-body space-y-4">
        <h2 className="card-title">{convertToSentenceCase(trigger.triggerId)}</h2>
        <div className="text-sm text-gray-500">ID: <ShortenAddress address={trigger.intentId} title="Intent Id"/></div>
        <p className="text-sm text-gray-500">Type: {trigger.type}</p>

        {sortedVariables.length > 0 && (
          <div>

            <Toggle label="values">
              <div className="mt-4 space-y-2">
                {sortedVariables.map((variable) => {
                  let displayValue = variable.value;
                  if (
                    variable.decimals !== undefined &&
                    variable.value &&
                    !isNaN(Number(variable.value))
                  ) {
                    displayValue = variable.value; //weiToEth(variable.value, variable.decimals);
                  }

                  return (
                   <VariableItem key={variable.handle} variable={variable} />
                  );
                })}
              </div>
            </Toggle>
            {trigger.executions && trigger.executions.length > 0 && (
              <Toggle label="executions">
                <div className="mt-4">
                  <div className="mt-4 space-y-4">
                    {trigger.executions.map(
                      (
                        execution: TriggerSubscriptionParams["executions"][number],
                      ) => {
                        const readableTime = new Date(
                          execution.time
                        ).toLocaleString();
                        return (
                          <div
                            key={execution.time.toString()}
                            className="border border-base-300 rounded-lg p-3"
                          >
                            <div className="font-semibold">
                              {readableTime}
                            </div>
                            <div className="mt-2 space-y-2">
                              {execution.values?.map((val) => {
                                return <VariableItem key={val.handle} variable={val} />
                              })}
                            </div>
                          </div>
                        );
                      }
                    )}
                  </div>
                </div>
              </Toggle>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

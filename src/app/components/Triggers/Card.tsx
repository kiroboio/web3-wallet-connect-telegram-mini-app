import { TriggerSubscriptionParams } from "@/app/events/getEvents";
import { Dispatch, SetStateAction, useMemo } from "react";
import { Toggle } from "../Toggle";
import { VariableItem } from "./VariableItem";
import { ShortenAddress } from "../ShortenAddress";
import { convertToSentenceCase } from "@/app/utils/text";
import { ExecutionItem } from "./ExecutionItem";

export const TriggerCard = ({
  trigger,
  setSelectedTokenAddress,
}: {
  trigger: TriggerSubscriptionParams;
  setSelectedTokenAddress?: Dispatch<SetStateAction<string | undefined>>;
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
    <div className="p-4">
      <div
        className="card w-full bg-gray-100 border-gray-300 rounded-md p-4 mb-4"
        style={{ borderWidth: "1px" }}
      >
        <div className="card-body">
          <h2 className="card-title">
            {convertToSentenceCase(trigger.triggerId)}
          </h2>
          <div className="text-sm text-gray-700">
            ID: <ShortenAddress address={trigger.intentId} title="Intent Id" />
          </div>
          {sortedVariables.length > 0 && (
            <div>
              <Toggle label="inputs">
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
                      <VariableItem
                        key={variable.handle}
                        variable={variable}
                        setSelectedTokenAddress={setSelectedTokenAddress}
                      />
                    );
                  })}
                </div>
              </Toggle>
              <div className="py-2">
                {trigger.executions && trigger.executions.length > 0 && (
                  <Toggle label="executions" initValue={true}>
                    <div className="mt-4">
                      <div className="mt-4 space-y-4">
                        {trigger.executions.map(
                          (
                            execution: TriggerSubscriptionParams["executions"][number]
                          ) => {
                            const readableTime = new Date(
                              execution.time
                            ).toLocaleString();
                            return (
                              <div
                                key={execution.time.toString()}
                                //className="border border-base-300 rounded-lg p-3"
                              >
                                <div className="mt-2 space-y-2">
                                  <ExecutionItem
                                    key={execution.time.toString()}
                                    execution={execution}
                                    setSelectedTokenAddress={
                                      setSelectedTokenAddress
                                    }
                                  />
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
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

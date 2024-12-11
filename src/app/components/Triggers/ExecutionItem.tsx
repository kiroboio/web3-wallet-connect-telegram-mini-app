import React, { Dispatch, SetStateAction } from "react";
import { VariableItem } from "./VariableItem";
import {
  ExternalVariable,
  TriggerSubscriptionParams,
} from "@/app/events/getEvents";
import parse from "html-react-parser";
import "./ExecutionItem.css";
import { Toggle } from "../Toggle";
interface ExecutionComponentProps {
  execution: TriggerSubscriptionParams["executions"][number];
  setSelectedTokenAddress?: Dispatch<SetStateAction<string | undefined>>;
  success?: boolean;
  error?: string; // HTML string (e.g., contains <b> etc.), but we will show it as raw text
}

export const ExecutionItem: React.FC<ExecutionComponentProps> = ({
  execution,
  setSelectedTokenAddress,
}) => {
  const error = execution.error;
  const success = execution.status === "succeed";
  const readableTime = new Date(execution.time).toLocaleString();

  let containerClass = "rounded-lg p-2 transition-colors duration-200";

  if (error) {
    containerClass += " bg-red-100 border-2 border-red-300";
  } else if (success) {
    containerClass += " border-2 border-emerald-300 bg-emerald-200";
  }

  return (
    <div className={containerClass}>
      <Toggle label={readableTime}>
        <>
          <div className="mt-2 space-y-2">
            {execution.values?.map((val: ExternalVariable) => (
              <VariableItem
                key={val.handle}
                variable={val}
                setSelectedTokenAddress={setSelectedTokenAddress}
              />
            ))}
          </div>
          {error ? (
            <div className="mt-2 flex flex-col flex-wrap whitespace-normal break-all whitespace-pre-wrap text-sm text-gray-700 bg-red-100 border-red-300 rounded-lg p-3">
              {parse(error)}
            </div>
          ) : null}
        </>
      </Toggle>
    </div>
  );
};

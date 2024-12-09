import React, { Dispatch, SetStateAction, useState } from "react";
import { VariableItem } from "./VariableItem";

import { FaPlus, FaMinus } from "react-icons/fa";
import {
  ExternalVariable,
  TriggerSubscriptionParams,
} from "@/app/events/getEvents";
import parse from "html-react-parser";
import "./ExecutionItem.css";
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
  const [showVariables, setShowVariables] = useState(false);
  const readableTime = new Date(execution.time).toLocaleString();

  let containerClass = "rounded-lg p-3 transition-colors duration-200";
  let content: React.ReactNode;

  if (error) {
    // Error state overrides success or normal rendering
    containerClass += " bg-red-100 border-2 border-red-300";
    content = (
      <>
        <pre className="mt-2 whitespace-pre-wrap text-sm text-gray-700">
          {error}
        </pre>
      </>
    );
  } else if (success) {
    containerClass += " border-2 border-emerald-300 bg-emerald-200";
  }

  return (
    <div className={containerClass}>
      <div className="font-semibold flex items-center">
        <button
          className="mr-2 p-1 rounded hover:bg-gray-100 transition-colors"
          onClick={() => setShowVariables(!showVariables)}
          title={showVariables ? "Hide Variables" : "Show Variables"}
        >
          {showVariables ? (
            <FaMinus className="h-4 w-4" />
          ) : (
            <FaPlus className="h-4 w-4" />
          )}
        </button>
        {readableTime}
      </div>

      {showVariables && (
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
      )}
    </div>
  );
};

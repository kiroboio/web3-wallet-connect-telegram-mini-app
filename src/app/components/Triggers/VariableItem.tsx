import { ExternalVariable } from "@/app/events/getEvents";
import React, { Dispatch, SetStateAction } from "react";
import { ShortenAddress } from "../ShortenAddress";

export const VariableItem = ({
  variable,
  setSelectedTokenAddress
}: {
  variable: ExternalVariable;
  setSelectedTokenAddress?: Dispatch<SetStateAction<string | undefined>>;
}) => {
  if (!variable) return null;

  return (
    <div
      key={variable.handle}
      className="border border-gray-200 rounded p-2 transition-colors duration-200 hover:bg-gray-200 hover:shadow-sm"
      onMouseEnter={() => {
        if(variable.type !== 'token') {
          setSelectedTokenAddress?.(undefined)
          return
        }
        if(variable.value === 'FROM_TRIGGER') {
          setSelectedTokenAddress?.(undefined)
          return
        }
        if(variable.value && typeof variable.value !== 'string') {
          setSelectedTokenAddress?.(undefined)
          return
        }

        setSelectedTokenAddress?.(variable.value)
      }}
      onMouseLeave={
        () => setSelectedTokenAddress?.(undefined)
      }
    >
      <div className="text-sm font-semibold">{variable.label}</div>
      {variable.type && (
        <div className="text-xs text-gray-600">Type: {variable.type}</div>
      )}
      <div className="text-sm text-gray-700">
        Value:{" "}
        {variable.value &&
        variable.value !== "FROM_TRIGGER" &&
        variable.fctType === "address" ? (
          <ShortenAddress
            address={variable.value}
            title={`${variable.label} address`}
          />
        ) : (
          variable.value
        )}
      </div>
    </div>
  );
};

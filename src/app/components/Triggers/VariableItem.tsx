import { ExternalVariable } from "@/app/events/getEvents";
import React from "react";

export const VariableItem = ({ variable}: { variable: ExternalVariable }) => {
  if (!variable) return null;

  
  return (
    <div
      key={variable.handle}
      className="border border-gray-200 rounded p-2 transition-colors duration-200 hover:bg-gray-200 hover:shadow-sm"
    >
      <div className="text-sm font-semibold">{variable.label}</div>
      {variable.type && (
        <div className="text-xs text-gray-600">Type: {variable.type}</div>
      )}
      <div className="text-sm text-gray-700">Value: {variable.value}</div>
    </div>
  );
};

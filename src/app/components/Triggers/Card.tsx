import { TriggerSubscriptionParams } from "@/app/events/getEvents";
import { useMemo, useState } from "react";

export const TriggerCard = ({ trigger }: { trigger: TriggerSubscriptionParams}) => {
    const [showVariables, setShowVariables] = useState(false);
  
    const sortedVariables = useMemo(() => {
      if (!trigger.externalVariables) return [];
  
  
      const sortedVars = trigger.externalVariables.sort((a, b) => {
        if (a.index === undefined || b.index === undefined) return 0;
        return a.index - b.index;
      });
  
      // Combine them, indexed ones first
      return sortedVars
    }, [trigger.externalVariables]);
  
    return (
      <div className="card bg-base-100 shadow-md p-4 mb-4">
        <div className="card-body space-y-4">
          <h2 className="card-title">{trigger.triggerId}</h2>
          <p className="text-sm text-gray-500">Intent ID: {trigger.intentId}</p>
          <p className="text-sm text-gray-500">Type: {trigger.type}</p>
  
          {sortedVariables.length > 0 && (
            <div>
              <button 
                className="btn btn-sm btn-outline" 
                onClick={() => setShowVariables(!showVariables)}
              >
                {showVariables ? 'Hide Values' : 'Show Values'}
              </button>
  
              {showVariables && (
                <div className="mt-4 space-y-2">
                  {sortedVariables.map((variable, idx: number) => {
                    let displayValue = variable.value;
                    if (variable.decimals !== undefined && variable.value && !isNaN(Number(variable.value))) {
                      displayValue = variable.value //weiToEth(variable.value, variable.decimals);
                    }
  
                    return (
                      <div key={idx} className="border border-base-300 rounded-lg p-3">
                        <div className="text-sm font-semibold">{variable.label}</div>
                        {variable.label && (
                          <div className="text-sm text-gray-600">Name: {variable.label}</div>
                        )}
                        {variable.type && (
                          <div className="text-sm text-gray-600">Type: {variable.type}</div>
                        )}
                        {/* fctType, index, decimals are not displayed */}
                        {displayValue && (
                          <div className="text-sm text-gray-600">Value: {displayValue}</div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };
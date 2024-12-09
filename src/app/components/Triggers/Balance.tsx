import { getProvider } from "@/app/events/provider/provider";
import { subscribeToBalanceChanges } from "@/app/utils/tokens";
import { useEffect, useState } from "react";

export const Balance = ({ tokenAddress, userAddress, symbol, initBalance}: {tokenAddress: string, userAddress: string, symbol: string, initBalance?: string}) => {
    const [ balance, setBalance ] = useState(initBalance)
    const provider = getProvider("11155111");

    useEffect(() => {
        subscribeToBalanceChanges({ tokenAddress, userAddress, onBalanceChange: setBalance, provider })
    }, [tokenAddress])
    return (
    <div className="text-sm">
      {balance ? `${balance} ${symbol}` : "..."}
    </div>
  );
};

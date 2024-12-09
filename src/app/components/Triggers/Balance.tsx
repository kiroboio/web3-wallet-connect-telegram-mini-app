import { getProvider } from "@/app/events/provider/provider";
import { getDisplayPriceWithShortedZeroes, getNumberFormater } from "@/app/utils/number";
import { subscribeToBalanceChanges } from "@/app/utils/tokens";
import { useEffect, useState } from "react";

export const Balance = ({ tokenAddress, userAddress, symbol, decimals, initBalance}: {tokenAddress: string, userAddress: string, symbol: string, decimals: number, initBalance?: string}) => {
    const [ balance, setBalance ] = useState(initBalance)
    const provider = getProvider("11155111");

    const formatter = getNumberFormater(decimals)
    useEffect(() => {
        subscribeToBalanceChanges({ tokenAddress, userAddress, onBalanceChange: setBalance, provider })
    }, [tokenAddress])
    return (
    <div className="text-sm">
      {balance ? `${getDisplayPriceWithShortedZeroes(formatter.format(Number(balance)))}` : "..."}
    </div>
  );
};

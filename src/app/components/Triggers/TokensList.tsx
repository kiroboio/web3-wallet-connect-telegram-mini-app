import { getProvider } from "@/app/events/provider/provider";
import { fetchInitialTokenData } from "@/app/utils/tokens";
import React, { useEffect, useState } from "react";
import { Balance } from "./Balance";
import { ShortenAddress } from "../ShortenAddress";

interface TokenListProps {
  tokens: string[];
  userAddress?: string | null;
}

export const TokenList: React.FC<TokenListProps> = ({
  tokens,
  userAddress,
}) => {
  const [tokenData, setTokenData] = useState<{
    [address: string]: { symbol: string; balance: string };
  }>({});

  const provider = getProvider("11155111");

  useEffect(() => {
    (async () => {
      const updatedData: {
        [address: string]: { symbol: string; balance: string };
      } = {};
      const tokensData = await fetchInitialTokenData(
        tokens,
        userAddress || "",
        provider
      );
      for (const token of tokens) {
        const data = tokensData[token];
        const symbol = data.symbol;
        const balance = data.balance;
        updatedData[token] = { symbol, balance };
      }
      setTokenData(updatedData);
    })();
  }, [tokens]);

  if (!userAddress) return null;
  return (
    <div className="max-w-md mx-auto bg-white rounded shadow p-4">
      <ul className="divide-y divide-gray-200">
        {tokens.map((token) => {
          const data = tokenData?.[token];
          if (!data) return null;
          return (
            <li key={token} className="py-2 flex justify-between items-center">
              <div>
                <div className="font-semibold">
                  <ShortenAddress address={token} label={data.symbol} />
                </div>
                {/* <div className="text-xs text-gray-500 break-all"><ShortenAddress address={token} /></div> */}
              </div>
              <div className="text-sm">
                <Balance
                  tokenAddress={token}
                  symbol={data.symbol}
                  userAddress={userAddress}
                />
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

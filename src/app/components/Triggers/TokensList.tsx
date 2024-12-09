import { getProvider } from "@/app/events/provider/provider";
import { fetchInitialTokenData } from "@/app/utils/tokens";
import React, { useEffect, useState } from "react";
import { Balance } from "./Balance";

// Mock function to get token symbol from its address
// Replace with a real call (e.g., contract method call)
async function getTokenSymbol(tokenAddress: string): Promise<string> {
  // Mock symbols based on token address hash (just for demonstration)
  return "TKN";
}

// Mock function to subscribe to balance changes.
// In reality, this might listen to blockchain events or polling.
function subscribeToBalanceChanges(
  tokenAddress: string,
  onBalanceUpdate: (balance: string) => void
): () => void {
  // Mock subscription: simulate a balance update every 5 seconds
  let intervalId = setInterval(() => {
    const mockBalance = (Math.random() * 100).toFixed(2);
    onBalanceUpdate(mockBalance);
  }, 5000);

  // Return unsubscribe function
  return () => clearInterval(intervalId);
}

// Mock function to get initial balance (replace with real call)
async function getInitialBalance(tokenAddress: string): Promise<string> {
  return (Math.random() * 100).toFixed(2);
}

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

        const data = tokensData[token]
        const symbol = data.symbol
        const balance = data.balance
        updatedData[token] = { symbol, balance };
      }
      setTokenData(updatedData);
    })();
  }, [tokens]);

  // Subscribe to balance changes
  useEffect(() => {
    const unsubscribers: (() => void)[] = [];

    for (const token of tokens) {
      const unsubscribe = subscribeToBalanceChanges(token, (newBalance) => {
        setTokenData((prev) => ({
          ...prev,
          [token]: { ...prev[token], balance: newBalance },
        }));
      });
      unsubscribers.push(unsubscribe);
    }

    return () => {
      unsubscribers.forEach((unsub) => unsub());
    };
  }, [tokens]);

  if(!userAddress) return null
  return (
    <div className="max-w-md mx-auto bg-white rounded shadow p-4">
      <h2 className="text-lg font-bold mb-2">Token Balances</h2>
      <ul className="divide-y divide-gray-200">
        {tokens.map((token) => {
          const data = tokenData?.[token];
          if(!data) return null
          return (
            <li key={token} className="py-2 flex justify-between items-center">
              <div>
                <div className="font-semibold">
                  {data ? data.symbol : "Loading..."}
                </div>
                <div className="text-xs text-gray-500 break-all">{token}</div>
              </div>
              <div className="text-sm">
                <Balance tokenAddress={token} symbol={data.symbol} userAddress={userAddress} />
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

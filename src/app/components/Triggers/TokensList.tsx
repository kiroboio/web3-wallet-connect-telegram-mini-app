import { getProvider } from "@/app/events/provider/provider";
import { fetchInitialTokenData } from "@/app/utils/tokens";
import React, { useEffect, useRef, useState } from "react";
import { Balance } from "./Balance";
import { ShortenAddress } from "../ShortenAddress";

interface TokenListProps {
  tokens: string[];
  userAddress?: string | null;
  selectedTokenAddress?: string;
}

export const TokenList: React.FC<TokenListProps> = ({
  tokens,
  userAddress,
  selectedTokenAddress,
}) => {
  const [tokenData, setTokenData] = useState<{
    [address: string]: { symbol: string; balance: string; decimals: number };
  }>({});

  const provider = getProvider("11155111");
  const tokenRefs = useRef<{ [key: string]: HTMLLIElement | null }>({});

  useEffect(() => {
    (async () => {
      if (!userAddress) return;
      try {
        const tokensData = await fetchInitialTokenData(
          tokens,
          userAddress,
          provider
        );
        const updatedData: {
          [address: string]: {
            symbol: string;
            balance: string;
            decimals: number;
          };
        } = {};
        for (const token of tokens) {
          const data = tokensData[token];
          if (!data) continue;
          updatedData[token] = {
            symbol: data.symbol,
            balance: data.balance,
            decimals: data.decimals,
          };
        }
        setTokenData(updatedData);
      } catch (e) {
        console.error(e);
      }
    })();
  }, [tokens, userAddress, provider]);

  // Scroll to the selected token when it changes
  useEffect(() => {
    if (selectedTokenAddress && tokenRefs.current[selectedTokenAddress]) {
      tokenRefs.current[selectedTokenAddress]?.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "center",
      });
    }
  }, [selectedTokenAddress]);

  if (!userAddress) return null;

  return (
    <div
      className="sticky top-0 max-w-full bg-white border-gray-300 shadow"
      style={{ borderTopWidth: "1px", borderBottomWidth: "1px" }}
    >
      <ul className="flex flex-row space-x-4 overflow-x-auto scrollbar-hide">
        {tokens.map((token) => {
          const data = tokenData?.[token];
          if (!data) return null;
          const isSelected = token === selectedTokenAddress;
          return (
            <li
              key={token}
              ref={(el) => {
                tokenRefs.current[token] = el;
              }}
              className={`flex flex-col items-center p-2 min-w-[100px] transition-colors duration-200 hover:bg-gray-200 hover:shadow-sm ${
                isSelected ? "bg-gray-200" : ""
              }`}
              style={{ scrollSnapAlign: "center" }}
            >
              <ShortenAddress address={token} label={data.symbol} />
              <Balance
                tokenAddress={token}
                symbol={data.symbol}
                decimals={data.decimals}
                userAddress={userAddress}
              />
            </li>
          );
        })}
      </ul>
    </div>
  );
};

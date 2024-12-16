import React, { useEffect, useRef, useState } from "react";
import { Balance } from "./Balance";
import { ShortenAddress } from "../ShortenAddress";
import { ChainId, fetchUserTokens, getUserTokens } from "@/app/utils/alchemy";
import { TriggerSubscriptionParams } from "@/app/events/getEvents";

interface TokenListProps {
  tokens: string[];
  chainId: ChainId;
  triggers: {
    [key: string]: TriggerSubscriptionParams;
  };
  userAddress?: string | null;
  selectedTokenAddress?: string;
}

type TokensData = Awaited<ReturnType<typeof getUserTokens>>;
export const TokenList: React.FC<TokenListProps> = ({
  userAddress,
  selectedTokenAddress,
  triggers,
  chainId,
}) => {
  const [tokenData, setTokenData] = useState<TokensData>([]);

  //const provider = getProvider(chainId);
  const tokenRefs = useRef<{ [key: string]: HTMLLIElement | null }>({});

  useEffect(() => {
    if (!userAddress) return;
    const getTokens = async () => {
      const allUserTokens = (await fetchUserTokens(
        userAddress,
        chainId
      )) as TokensData;

      console.log({ allUserTokens, userAddress });

      setTokenData(allUserTokens);
    };

    getTokens();
  }, [userAddress, triggers, chainId]);

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
      style={{ borderTopWidth: "1px", borderBottomWidth: "1px", zIndex: 100 }}
      
    >
      <ul className="flex flex-row space-x-4 overflow-x-auto scrollbar-hide">
        {tokenData.map((token) => {
          const data = token;
          if (!data) return null;
          const isSelected = token.address === selectedTokenAddress;
          return (
            <li
              key={token.address}
              ref={(el) => {
                tokenRefs.current[token.address?.toLowerCase()] = el;
              }}
              className={`flex flex-col items-center p-2 min-w-[100px] transition-colors duration-200 hover:bg-gray-200 hover:shadow-sm ${
                isSelected ? "bg-gray-200" : ""
              }`}
              style={{ scrollSnapAlign: "center" }}
            >
              <ShortenAddress address={token.address} label={data.symbol} />
              <Balance balance={token.balance} decimals={data.decimals || 18} usdBalance={data.usdBalance} />
            </li>
          );
        })}
      </ul>
    </div>
  );
};

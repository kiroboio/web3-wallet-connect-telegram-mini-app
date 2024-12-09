import { Contract, providers } from "ethers";
import { formatUnits } from "ethers/lib/utils";
import { JsonRpcProvider } from "@ethersproject/providers";
interface TokenData {
  symbol: string;
  decimals: number;
  balance: string; // formatted balance string
}

interface BlockchainLogicOptions {
  tokens: string[];
  userAddress: string;
  provider: JsonRpcProvider;
  onBalanceChange: (updatedTokenData: { [address: string]: TokenData }) => void;
}

// Minimal ERC20 ABI
const ERC20_ABI = [
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
  "function balanceOf(address) view returns (uint256)",
];

export async function fetchInitialTokenData(
  tokens: string[],
  userAddress: string,
  provider: JsonRpcProvider
): Promise<{ [address: string]: TokenData }> {
  const tokenDataMap: { [address: string]: TokenData } = {};

  for (const tokenAddress of tokens) {
    try {
      const tokenContract = new Contract(tokenAddress, ERC20_ABI, provider);
      const [symbol, decimals, rawBalance] = await Promise.all([
        tokenContract.symbol(),
        tokenContract.decimals(),
        tokenContract.balanceOf(userAddress),
      ]);

      const formattedBalance = formatUnits(rawBalance, decimals);

      tokenDataMap[tokenAddress] = {
        symbol,
        decimals,
        balance: formattedBalance,
      };
    } catch (e) {
      console.error(e);
      continue;
    }
  }

  return tokenDataMap;
}

export function subscribeToBalanceChanges({
  tokenAddress,
  userAddress,
  provider,
  onBalanceChange,
}: {
  tokenAddress: string;
  userAddress: string;
  provider: JsonRpcProvider;
  onBalanceChange: (updatedTokenData: string) => void;
}): () => void {
  const handleNewBlock = async () => {
    // Fetch current token data
    const tokenContract = new Contract(tokenAddress, ERC20_ABI, provider);
    // We assume we have previously fetched symbol and decimals
    // For a real implementation, symbol/decimals should be cached or re-fetched if needed
    // Here, we re-fetch them each time, but you can optimize by storing these somewhere
    const [_symbol, decimals, rawBalance] = await Promise.all([
      tokenContract.symbol(),
      tokenContract.decimals(),
      tokenContract.balanceOf(userAddress),
    ]);

    const formattedBalance = formatUnits(rawBalance, decimals);

    onBalanceChange(formattedBalance);
  };

  provider.on("block", handleNewBlock);

  // Return unsubscribe function
  return () => {
    provider.off("block", handleNewBlock);
  };
}

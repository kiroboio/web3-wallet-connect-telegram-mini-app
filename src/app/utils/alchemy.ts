import { Alchemy, Network } from "alchemy-sdk";
import { ethers } from "ethers";
import axios from "axios";

// Interface for token information
export interface TokenInfo {
  address: string;
  symbol: string;
  decimals: number;
  balance: string; // Formatted balance
  usdBalance: number;
}


// Minimal ERC20 ABI
const ERC20_ABI = [
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
  "function balanceOf(address) view returns (uint256)",
];
type Prices = {
    "data": [
      {
        "network": Network,
        "address": string,
        "prices": [
          {
            currency: "usd",
            value: string,
            lastUpdatedAt: string,
          }
        ],
        "error": null
      }
    ]
  }

/**
 * Fetches the user's tokens along with their USD balances.
 * @param userAddress The user's wallet address.
 * @returns A promise that resolves to an array of TokenInfo objects.
 */
export async function getUserTokens(userAddress: string) {

    
const ALCHEMY_ID = "9j9SdF5HiwChoVUJLk-DaKNxU4Xm6ok1";
const settings = {
  apiKey: ALCHEMY_ID || "", // Ensure to set this in your environment variables
  network: Network.ETH_SEPOLIA,
  connectionInfoOverrides: {
    skipFetchSetup: true,
  },
};



const alchemy = new Alchemy(settings);
  try {
    // Fetch token balances
    const balances = await alchemy.core.getTokenBalances(userAddress);

    // Filter out tokens with zero balance
    const nonZeroBalances = balances.tokenBalances.filter(
      (balance) =>
        balance.tokenBalance !== "0" && balance.tokenBalance !== undefined
    );

    // Fetch metadata for each token
    const tokenAddresses = nonZeroBalances.map((balance) =>
      balance.contractAddress.toLowerCase()
    );
    const metadataPromises = tokenAddresses.map(async (address) => {
      const meta = await alchemy.core.getTokenMetadata(address);

      return { ...meta, address };
    });
    const tokensMetadata = await Promise.all(metadataPromises);

    // Map to store contract address to CoinGecko ID
  

    //if (validAddresses.length === 0) return [];

    let priceResponse: Prices | undefined = undefined;

    try {
        const options = {
            method: 'POST',
            headers: {accept: 'application/json', 'content-type': 'application/json'},
            body: JSON.stringify({
              addresses: tokensMetadata.map(({ address}) => ({network: Network.ETH_SEPOLIA, address}))
            })
          };
          
        const res = await fetch(`https://api.g.alchemy.com/prices/v1/${ALCHEMY_ID}/tokens/by-address`, options)
        
        console.log({ res })
        priceResponse = (await res.json()).data as Prices

    } catch (e) {
        console.warn(e);
    }
    
    console.log({ priceResponse: JSON.stringify(priceResponse) })
    // const prices: Record<string, { usd: number }> | undefined = priceResponse?.data;

    // Combine data to form TokenInfo
    const tokensInfo = nonZeroBalances.map((balance, index) => {
      const tokenAddress = balance.contractAddress.toLowerCase();
      const metadata = tokensMetadata[index];
      
      const price = priceResponse?.data?.find(({ address }) => address?.toLowerCase() === tokenAddress)?.prices[0].value

      const formattedBalance = ethers.utils.formatUnits(
        balance.tokenBalance || "0",
        String(metadata.decimals)
      );

      const usdBalance = price

      return {
        address: tokenAddress,
        symbol: metadata.symbol || "UNKNOWN",
        decimals: metadata.decimals,
        balance: formattedBalance,
        usdBalance: usdBalance,
      };
    });

    return tokensInfo;
  } catch (error) {
    console.error("Error fetching user tokens:", error);
    return [];
  }
}

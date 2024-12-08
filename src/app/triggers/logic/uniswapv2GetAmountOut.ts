import { ethers, BigNumber } from "ethers";
import { ChainId, getProvider } from "../provider/provider";
import { UniswapHelper } from "@kiroboio/fct-plugins";
import { getCreate2Address } from "ethers/lib/utils";
import { keccak256, pack } from "@ethersproject/solidity";
import { INIT_CODE_HASH } from "@uniswap/v2-sdk";

export const ROUTER_V2_ADDRESS: Record<ChainId, string> = {
  "1": "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D",
  "10": "0x4A7b5Da61326A6379179b40d00F57E5bbDC962c2",
  "42161": "0x4752ba5dbc23f44d87826276bf6fd6b1c372ad24",
  "8453": "0x4752ba5dbc23f44d87826276bf6fd6b1c372ad24",
  "11155111": "0xeE567Fe1712Faf6149d80dA1E6934E354124CfE3",
};
export const FACTORY_V2_ADDRESSES: Record<ChainId, string> = {
  "1": "0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f",
  "10": "0x0c3c1c532F1e39EdF36BE9Fe0bE1410313E074Bf",
  "42161": "0xf1D7CC64Fb4452F05c498126312eBE29f30Fbcf9",
  "8453": "0x8909Dc15e40173Ff4699343b6eB8132c65e18eC6",
  "11155111": "0xF62c03E08ada871A0bEb309762E260a7a6a880E6",
};



export const getSwapQuote = async ({
  chainId,
  fromToken,
  toToken,
  recipient,
  amount,
}: {
  chainId: ChainId;
  fromDecimals: number;
  toDecimals: number;
  recipient?: string;
  amount: string;
  fromToken?: string;
  toToken?: string;
}) => {
  if (!fromToken) return
  if (!toToken) return
  
  const provider = getProvider(chainId);
  const uniswapHelper = new UniswapHelper({
    chainId,
    account: recipient,
    provider,
  });

  const getReserves = async ({
    token0,
    token1,
    pairAddress,
  }: {
    token0: string;
    token1: string;
    pairAddress: string;
  }): Promise<[BigNumber, BigNumber, string, string] | undefined> => {
    const contract = new ethers.Contract(
      pairAddress,
      [
        "function getReserves() view returns (uint112 reserve0, uint112 reserve1, uint32 blockTimestampLast)",
      ],
      provider
    );

    const reserves = (await contract.getReserves()) as BigNumber[];
    if (!reserves || !reserves.length) return undefined;
    return token0 < token1
      ? [reserves[0], reserves[1], token0, token1]
      : [reserves[1], reserves[0], token0, token1];
  };

  const pairAddress = getCreate2Address(
    FACTORY_V2_ADDRESSES[chainId],
    keccak256(
      ["bytes"],
      [
        pack(
          ["address", "address"],
          fromToken < toToken ? [fromToken, toToken] : [toToken, fromToken]
        ),
      ]
    ),
    INIT_CODE_HASH
  );

  console.log({ pairAddress });
  const getAmountOut = (
    amountIn: string,
    reserveIn: BigNumber,
    reserveOut: BigNumber
  ) => {
    const amountInWithFee = BigNumber.from(amountIn).mul(997);
    const numerator = amountInWithFee.mul(reserveOut);
    const denominator = reserveIn.mul(1000).add(amountInWithFee);
    const amountOut = numerator.div(denominator);
    return amountOut;
  };

  const isPairExist = await uniswapHelper.isPairExist({
    token0: fromToken.toLowerCase(),
    token1: toToken.toLowerCase(),
  });

  console.log({ fromToken, pairAddress, isPairExist2: isPairExist });
  try {
    const reserves = await getReserves({
      token0: fromToken.toLowerCase(),
      token1: toToken.toLowerCase(),
      pairAddress,
    });

    console.log({ reserves });

    if (!reserves) {
      throw new Error(`pair not exist`);
    }

    const [reserveIn, reserveOut] = reserves;
    const amountOut = getAmountOut(amount, reserveIn, reserveOut);

    console.log({ amountOut });

    if (!amountOut) {
      throw new Error(`trade error`);
    }
    const tokenBContract = new ethers.Contract(
      toToken,
      ["function decimals() view returns (uint8)"],
      provider
    );
    const decimalsB = await tokenBContract.decimals();
    const amountOutFormatted = ethers.utils.formatUnits(amountOut, decimalsB);

    console.log(`Amount Out: ${amountOutFormatted} tokens of Token B`);

    const reducedAmount = amountOut.mul(97).div(100);

    console.log({ reducedAmount: reducedAmount.toString(), amountOut: amountOut.toString() });

    return reducedAmount.toString();
  } catch (e) {
    const error = e as { message?: string };
    console.error(
      `from token ${fromToken} to token ${toToken}: ${error.message}`
    );
  }
};

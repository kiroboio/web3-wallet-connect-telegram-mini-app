import { Token, CurrencyAmount, TradeType, Percent } from "@uniswap/sdk-core";
import {
  AlphaRouter,
  SwapRoute,
  SwapOptions,
  SwapType
} from "@uniswap/smart-order-router";
import { ChainId, getProvider } from "../provider/provider";

export const getSwapQuote = async ({
  chainId,
  fromToken,
  fromDecimals,
  toToken,
  toDecimals,
  recipient,
  amount,
}: {
  chainId: ChainId;
  fromToken: string;
  fromDecimals: number;
  toToken: string;
  toDecimals: number;
  amount: string;
  recipient?: string;
}): Promise<void> => {
  const chainIdNum = Number(chainId);
  const TOKEN_IN = new Token(
    chainIdNum, 
    fromToken,
    fromDecimals,
    "TOKEN_IN",
    "Input Token"
  );

  const TOKEN_OUT = new Token(
    chainIdNum, 
    toToken,
    toDecimals,
    "TOKEN_OUT",
    "Output Token"
  );

  const amountIn: CurrencyAmount<Token> = CurrencyAmount.fromRawAmount(
    TOKEN_IN,
    amount
  );

  // Create the router
  const router = new AlphaRouter({
    chainId: chainIdNum,
    provider: getProvider(chainId),
  });
  try {
    // Define swap options
    const swapOptions: SwapOptions = {
      recipient: recipient || '',
      slippageTolerance: new Percent(50, 10_000), // 0.5% slippage tolerance
      deadline: Math.floor(Date.now() / 1000) + 1800, // 30 minutes from now
      type: SwapType.SWAP_ROUTER_02,
    };

    // Get the optimal route
    const route: SwapRoute | null = await router.route(
      amountIn,
      TOKEN_OUT,
      TradeType.EXACT_INPUT,
      swapOptions
    );

    if (!route)
      throw new Error(
        `route for token pair ${fromToken} / ${toToken} not found`
      );

    // Output the results
    console.log(
      `Input Amount: ${amountIn.toSignificant(6)} ${TOKEN_IN.symbol}`
    );
    console.log(
      `Output Amount: ${route.quote.toSignificant(6)} ${TOKEN_OUT.symbol}`
    );
    console.log(`Estimated Gas Used: ${route.estimatedGasUsed.toString()}`);
    console.log(`Route Path: ${route.trade.routes}`);


  } catch (error) {
    console.error(`Error: ${(error as Error).message}`);
  }
};

export type GetSwapQuoteType = typeof getSwapQuote
export default getSwapQuote
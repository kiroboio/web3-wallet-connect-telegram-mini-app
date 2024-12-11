import {
  getDisplayPriceWithShortedZeroes,
  getNumberFormater,
} from "@/app/utils/number";

export const Balance = ({
  balance,
  decimals,
  usdBalance,
}: {
  decimals: number;
  balance: string;
  usdBalance?: string;
}) => {
  const formatter = getNumberFormater(decimals);
  const usdFormatter = getNumberFormater(2);

  const ethBalance = getDisplayPriceWithShortedZeroes(
    formatter.format(Number(balance))
  );
  return (
    <div className="flex flex-col text-sm align-center justify-center text-center tooltip" data-tip={ethBalance}>
      <p>
        {usdBalance
          ? `${getDisplayPriceWithShortedZeroes(
              usdFormatter.format(Number(usdBalance))
            )}$`
          : ethBalance}
      </p>
    </div>
  );
};

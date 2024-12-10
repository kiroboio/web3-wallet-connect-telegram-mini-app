import {
  getDisplayPriceWithShortedZeroes,
  getNumberFormater,
} from "@/app/utils/number";

export const Balance = ({
  balance,
  decimals,
}: {
  decimals: number;
  balance: string;
}) => {
  const formatter = getNumberFormater(decimals);

  return (
    <div className="text-sm">
      {balance
        ? `${getDisplayPriceWithShortedZeroes(
            formatter.format(Number(balance))
          )}`
        : "..."}
    </div>
  );
};

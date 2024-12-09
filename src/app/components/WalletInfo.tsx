// components/WalletAddress.tsx
import classNames from "classnames";
import { ShortenAddress } from "./ShortenAddress";

interface WalletAddressProps {
  address: string;
  vault: string;
  privateKey?: string;
}

export const WalletInfo: React.FC<WalletAddressProps> = ({
  address,
  vault,
  privateKey,
}) => {


  return (
    <div
      className={classNames(
        "flex flex-col items-center p-2 rounded-md cursor-pointer bg-white  transition-colors relative group"
      )}
    >
      <ShortenAddress address={address} title='wallet address'/>
      <ShortenAddress address={vault} title='runner address'/>
      {privateKey ? (
        <ShortenAddress address={privateKey} title='private key'/>
      ) : null}
    </div>
  );
};


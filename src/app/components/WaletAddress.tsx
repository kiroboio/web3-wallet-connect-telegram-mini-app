// components/WalletAddress.tsx

import { useState } from "react";
import { FaClipboard, FaCheck } from "react-icons/fa";
import classNames from "classnames";

interface WalletAddressProps {
  address: string;
}

const shortenAddress = (addr: string) => {
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
};

export const WalletAddress: React.FC<WalletAddressProps> = ({ address }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(address).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div
      className={classNames(
        "flex items-center p-2 rounded-md cursor-pointer bg-white hover:bg-gray-100 transition-colors relative group"
      )}
      onClick={handleCopy}
    >
      <div className="flex flex-row py-2" title="copy address to clipboard">
        <span className="text-sm font-mono">{shortenAddress(address)}</span>
        <div className="ml-2 text-gray-500 hover:text-gray-700">
          {copied ? <FaCheck /> : <FaClipboard />}
        </div>
      </div>
    </div>
  );
};

export default WalletAddress;

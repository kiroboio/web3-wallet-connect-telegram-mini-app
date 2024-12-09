// components/WalletAddress.tsx

import { useState } from "react";
import { FaClipboard, FaCheck } from "react-icons/fa";

interface WalletAddressProps {
  address: string;
  title?: string;
}

const shortenAddress = (addr: string) => {
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
};

export const ShortenAddress: React.FC<WalletAddressProps> = ({
  address,
  title
}) => {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(address).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div
      onClick={handleCopy}
      className="flex flex-row p-2 hover:bg-gray-100"
      title={`copy ${title || 'address'} to clipboard`}
    >
      <span className="text-sm font-mono">{shortenAddress(address)}</span>
      <div className="ml-2 text-gray-500">
        {copied ? <FaCheck /> : <FaClipboard />}
      </div>
    </div>
  );
};

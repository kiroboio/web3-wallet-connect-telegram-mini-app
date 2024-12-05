// components/WalletAddress.tsx

import { useState } from "react";
import { FaClipboard, FaCheck } from "react-icons/fa";
import classNames from "classnames";

interface WalletAddressProps {
  address: string;
  privateKey?: string;
}

const shortenAddress = (addr: string) => {
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
};

export const WalletAddress: React.FC<WalletAddressProps> = ({
  address,
  privateKey,
}) => {
  const [copied, setCopied] = useState(false);
  const [privateKeyCopied, setPrivateKeyCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(address).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handlePrivateKeyCopy = () => {
    if (!privateKey) return;
    navigator.clipboard.writeText(privateKey).then(() => {
      setPrivateKeyCopied(true);
      setTimeout(() => setPrivateKeyCopied(false), 2000);
    });
  };

  return (
    <div
      className={classNames(
        "flex flex-col items-center p-2 rounded-md cursor-pointer bg-white  transition-colors relative group"
      )}
    >
      <div
        onClick={handleCopy}
        className="flex flex-row p-2 hover:bg-gray-100"
        title="copy address to clipboard"
      >
        <span className="text-sm font-mono">{shortenAddress(address)}</span>
        <div className="ml-2 text-gray-500">
          {copied ? <FaCheck /> : <FaClipboard />}
        </div>
      </div>
      {privateKey ? (
        <div
          onClick={handlePrivateKeyCopy}
          className="flex flex-row p-2 hover:bg-gray-100"
          title="copy private key to clipboard"
        >
          <span className="text-sm font-mono">
            {shortenAddress(privateKey)}
          </span>
          <div className="ml-2 text-gray-500">
            {privateKeyCopied ? <FaCheck /> : <FaClipboard />}
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default WalletAddress;

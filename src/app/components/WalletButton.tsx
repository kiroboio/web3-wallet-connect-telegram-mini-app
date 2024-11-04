import React from 'react';
import classNames from 'classnames';
import { FaWallet } from 'react-icons/fa'; // Example icon

interface WalletButtonProps {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  className?: string;
  icon?: React.ReactNode;
}

export const WalletButton: React.FC<WalletButtonProps> = ({
  label,
  onClick,
  disabled = false,
  className,
  icon,
}) => {
  const buttonClasses = classNames(
    'flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors duration-200 min-w-32 capitalize ',
    {
      'bg-blue-500 text-white hover:bg-blue-600 focus:ring-blue-500': !disabled,
      'bg-gray-300 text-gray-700 cursor-not-allowed': disabled,
    },
    className
  );

  return (
    <button
      type="button"
      className={buttonClasses}
      onClick={onClick}
      disabled={disabled}
    >
      {icon || <span className="mr-4"><FaWallet size={12}/></span>}
      {label}
    </button>
  );
};

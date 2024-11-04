import React from "react";
import { FaInfoCircle } from "react-icons/fa";


const MESSAGE =
  "Your private key will be encrypted with your password and stored in your local storage. We will not store your password or private key. If you lose your private key, it will be lost forever.";
export const InfoTooltip: React.FC = () => {
  return (
    <div className="relative group">
      <FaInfoCircle className="text-blue-500 cursor-pointer" />
      <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300 w-64">
        {MESSAGE}
      </div>
    </div>
  );
};

import { useState } from "react";
import { FaPlus, FaMinus } from "react-icons/fa";

export const Toggle = ({
  label,
  children,
  initValue,
}: {
  label: string;
  children: React.ReactNode;
  initValue?: boolean;
}) => {
  const [show, setShow] = useState(Boolean(initValue));

  return (
    <>
      <button
        className="btn btn-sm btn-outline flex items-center gap-2"
        onClick={() => setShow(!show)}
      >
        {show ? (
          <FaMinus className="h-4 w-4" />
        ) : (
          <FaPlus className="h-4 w-4" />
        )}
        <span>{label}</span>
      </button>
      {show ? children : null}
    </>
  );
};

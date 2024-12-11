import { useState } from "react";
import { FaPlus, FaMinus } from "react-icons/fa";
import clsx from "clsx";

interface ToggleProps {
  label: string;
  children: React.ReactNode;
  initValue?: boolean;
}

export const Toggle: React.FC<ToggleProps> = ({ label, children, initValue }) => {
  const [show, setShow] = useState(Boolean(initValue));

  return (
    <div className="bg-inherit">
      <button
        className="bg-inherit btn btn-sm p-2 border-0 shadow-none flex items-center focus:outline-none"
        onClick={() => setShow(!show)}
        aria-expanded={show}
        aria-controls={`toggle-content-${label}`}
      >
        <span
          className={clsx(
            "transition-transform duration-300",
            show ? "rotate-90" : "rotate-0"
          )}
        >
          {show ? <FaPlus className="" /> : <FaMinus className="" />}
        </span>
        <span className="bg-inherit">{label}</span>
      </button>
      {show ? children : null}
    </div>
  );
};
import { useState } from "react";
import { FaChevronRight } from "react-icons/fa";
import Collapsible from "react-collapsible";
import clsx from "clsx";

interface ToggleProps {
  label: string;
  children: React.ReactNode;
  initValue?: boolean;
}

export const Toggle: React.FC<ToggleProps> = ({
  label,
  children,
  initValue,
}) => {
  const [show, setShow] = useState(Boolean(initValue));

  return (
    <div className="bg-inherit">
      <button
        className="bg-inherit btn btn-sm p-2 border-0 shadow-none flex items-center focus:outline-none hover:bg-inherit"
        onClick={() => setShow(!show)}
        aria-expanded={show}
        aria-controls={`toggle-content-${label}`}
      >
        <span
          className={clsx(
            "transition-transform duration-200",
            show ? "rotate-90" : "rotate-0"
          )}
        >
          {show ? (
            <FaChevronRight className="" />
          ) : (
            <FaChevronRight className="" />
          )}
        </span>
        <span className="bg-inherit">{label}</span>
      </button>
      <Collapsible open={show} trigger="" transitionTime={200}>{children}</Collapsible>
    </div>
  );
};

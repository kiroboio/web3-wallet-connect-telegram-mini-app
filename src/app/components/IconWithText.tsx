import classNames from 'classnames';

interface IconTextProps {
  icon: React.ReactNode;
  text:  React.ReactNode;
  hasData?: boolean;
}

export const IconWithText = ({ icon, text, hasData }: IconTextProps) => {
  return (
    <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-4">
      <div className="icon">
        {icon}
      </div>
      <div className={classNames('text-base', {
        'text-gray-500': !hasData,
        'text-black': hasData,
      })}>
        {text}
      </div>
    </div>
  );
};

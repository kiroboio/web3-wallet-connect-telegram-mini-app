import classNames from 'classnames';

export const Spinner = ({ color, size }: { size: number, color?: string, }) => {
    const borderColorClass = `border-${color || 'gray-500'}`;
    return (
        <div className="flex items-center justify-center" style={{ width: size, height: size }}>
            <div
                className={classNames(
                    'w-full h-full border-2 border-solid border-t-transparent rounded-full animate-spin',
                    borderColorClass
                )}
            ></div>
        </div>
    );
};
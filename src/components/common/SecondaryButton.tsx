import React from 'react';
import { twMerge } from 'tailwind-merge';

type SecondaryButtonProps = React.ComponentPropsWithoutRef<'button'>;

function SecondaryButton({ children, ...props }: SecondaryButtonProps) {
  return (
    <button
      {...props}
      className={twMerge(
        'inline-block rounded-b-lg rounded-tl-lg border-2 border-violet px-6 py-1 font-bold text-violet hover:enabled:border-violet-600 hover:enabled:text-violet-600 hover:enabled:shadow-md',
        props.className
      )}
    >
      {children}
    </button>
  );
}

export default SecondaryButton;

import React from 'react';
import { twMerge } from 'tailwind-merge';

type PrimaryButtonProps = React.ComponentPropsWithoutRef<'button'>;

function PrimaryButton({ children, ...props }: PrimaryButtonProps) {
  return (
    <button
      {...props}
      className={twMerge(
        'inline-block rounded-b-lg rounded-tl-lg bg-violet px-6 py-1.5 font-bold text-white hover:enabled:bg-violet-600 disabled:cursor-not-allowed disabled:opacity-50',
        props.className
      )}
    >
      {children}
    </button>
  );
}

export default PrimaryButton;

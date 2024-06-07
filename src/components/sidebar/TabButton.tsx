import React from 'react';
import { twMerge } from 'tailwind-merge';

type TabButtonProps = React.ComponentPropsWithoutRef<'button'>;

function TabButton({ children, ...props }: TabButtonProps) {
  const classes = twMerge(
    'flex items-center rounded-md px-4 py-2 text-violet hover:enabled:bg-violet hover:enabled:text-white border border-slate-200 bg-grey-200/30 text-violet w-full disabled:opacity-60',
    props.className
  );

  return (
    <button {...props} className={classes}>
      {children}
    </button>
  );
}

export default TabButton;

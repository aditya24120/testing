import React from 'react';
import { twMerge } from 'tailwind-merge';

type TabAnchorProps = { isActive?: boolean } & React.ComponentPropsWithoutRef<'a'>;

function TabAnchor({ children, isActive, ...props }: TabAnchorProps) {
  const classes = twMerge(
    'flex items-center rounded-md px-4 py-2 text-violet hover:bg-violet hover:text-white cursor-pointer',
    isActive ? activeClasses : '',
    props.className
  );

  return (
    <a {...props} className={classes}>
      {children}
    </a>
  );
}

export default TabAnchor;

const activeClasses = 'border border-slate-200 bg-grey-200/30 text-violet';

import { useState } from 'react';
import { Dispatch, SetStateAction } from 'react';

type Props = {
  label: string;
  value: boolean;
  onChange: () => void;
};

const Checkbox = ({ label, value, onChange }: Props) => {
  return (
    <div className="mt-6 flex">
      <label className="align-center flex items-center">
        <input type="checkbox" className="form-checkbox" checked={value} onChange={onChange} />
        <span className="ml-2 text-sm text-gray-400">{label}</span>
      </label>
    </div>
  );
};
export default Checkbox;

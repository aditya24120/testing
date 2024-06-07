import React from 'react';

type Props = {
  id: string;
  label: string;
  value?: number;
  min?: number;
  max?: number;
  onUpdate: (fieldName: string, value: number) => void;
};

const NumberInput = ({ id, label, value, min, max, onUpdate }: Props) => {
  const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    onUpdate(id, Number(e.target.value));
  };

  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-sm font-medium text-violet md:text-lg">
        {label}
      </label>
      <input
        defaultValue={value}
        type="number"
        id={id}
        min={min}
        max={max}
        onChange={onChange}
        className="block w-full appearance-none rounded-lg border border-grey-200 p-2.5 text-sm font-medium text-violet outline-none focus:border-violet"
        required
      />
    </div>
  );
};

export default NumberInput;

import React from 'react';
const options = [
  { value: 'chocolate', label: 'Chocolate' },
  { value: 'strawberry', label: 'Strawberry' },
  { value: 'vanilla', label: 'Vanilla' }
];

type Props = {
  id: string;
  label: string;
  defaultValue?: string;
  options: { value: string; label: string }[];
  onUpdate: (fieldName: string, value: string) => void;
};

const Select = ({ id, label, options, defaultValue, onUpdate }: Props) => {
  const onChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onUpdate(id, e.target.value);
  };

  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-sm font-medium text-violet md:text-lg">
        {label}
      </label>

      <select
        id={id}
        defaultValue={defaultValue || 'default'}
        className="block w-full rounded-lg border border-grey-200 p-2.5 text-sm font-medium text-violet outline-none focus-within:border-violet"
        onChange={onChange}
      >
        <option value={'default'} disabled>
          Choose one
        </option>

        {options.map(({ value, label }) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default Select;

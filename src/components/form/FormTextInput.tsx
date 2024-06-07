import React from 'react';

type Props = {
  id: string;
  label: string;
  placeholder: string;
  initialValue?: string;
  onUpdate: (fieldName: string, value: string) => void;
};

const FormTextInput = ({ id, label, placeholder, initialValue, onUpdate }: Props) => {
  const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    onUpdate(id, e.target.value);
  };

  return (
    <div>
      <label
        htmlFor={id}
        className="mb-2 block w-full pr-4 text-sm font-medium text-violet md:w-4/5 md:text-lg"
      >
        {label}
      </label>
      <input
        type="text"
        id={id}
        value={initialValue || ''}
        onChange={onChange}
        className="w-full appearance-none rounded border border-grey-200 px-2 py-2 leading-tight text-violet placeholder-gray-300 focus-within:border-violet focus:outline-none"
        placeholder={placeholder}
        required
      />
    </div>
  );
};

export default FormTextInput;

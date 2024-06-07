import React from 'react';

type Props = {
  id: string;
  label: string;
  value?: string;
  rows?: number;
  placeholder: string;
  onUpdate: (fieldName: string, value: string) => void;
  tagCount?: number;
  maxLimit?: number;
};
const TextArea = ({
  id,
  label,
  value,
  onUpdate,
  rows,
  placeholder,
  maxLimit,
  tagCount = 0
}: Props) => {
  const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    onUpdate(id, e.target.value);
  };

  return (
    <div>
      <label
        htmlFor={id}
        className="mb-2 flex items-center justify-between text-sm font-medium text-violet md:text-lg"
      >
        <span>{label}</span>
        {maxLimit && (
          <span className="-mb-6 text-xs text-gray-400">
            {(value?.length || 0) + tagCount}/{maxLimit}
          </span>
        )}
      </label>
      <textarea
        id={id}
        rows={rows || 4}
        value={value}
        onChange={onChange}
        className="focus:border-border block w-full rounded-lg border bg-white p-2.5 text-sm text-violet outline-none"
        placeholder={placeholder}
        maxLength={maxLimit ? maxLimit - tagCount : undefined}
      />
    </div>
  );
};

export default TextArea;

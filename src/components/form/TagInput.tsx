import React, { useState } from 'react';

type Props = {
  id: string;
  label: string;
  placeholder: string;
  list: string[];
  onUpdate: (fieldName: string, value: string) => void;
  onDelete: (fieldname: string, value: string) => void;
};

const TagInput = ({ id, label, placeholder, onUpdate, onDelete, list }: Props) => {
  const [tag, setTag] = useState<string>('');

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      if (tag) {
        // @ts-expect-error expecting id attr on target element
        onUpdate(event.target.id, tag);
        setTag('');
      }
    }
  };

  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-sm font-medium text-violet md:text-lg">
        {label}
      </label>
      <input
        type="text"
        id={id}
        value={tag}
        onChange={(e) => setTag(e.target.value)}
        onKeyDown={handleKeyDown}
        className="bg-sidebar focus:border-border block w-full rounded-lg border p-2.5 text-sm text-violet outline-none  "
        placeholder={placeholder}
      />
      <span className="text-sm text-gray-400">
        Press the enter key to add tags. (Comma separated. No spaces)
      </span>

      {list.length > 0 && (
        <div className="mb-3 mt-2 flex flex-wrap rounded-lg bg-grey-100 px-2 pb-2  pt-2">
          {list.map((name, i) => (
            <Pill key={i} name={name} onDelete={(name) => onDelete(id, name)} />
          ))}
        </div>
      )}
    </div>
  );
};

export default TagInput;

const Pill = ({ name, onDelete }: { name: string; onDelete: (name: string) => void }) => {
  return (
    <span className="m-1 flex flex-wrap items-center justify-between rounded-xl bg-violet py-2 pl-4 pr-2 text-sm font-medium text-white ">
      {name}

      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="ml-3 h-5 w-5 cursor-pointer hover:text-rose-300"
        viewBox="0 0 20 20"
        fill="currentColor"
        onClick={() => onDelete(name)}
      >
        <path
          fillRule="evenodd"
          d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
          clipRule="evenodd"
        />
      </svg>
    </span>
  );
};

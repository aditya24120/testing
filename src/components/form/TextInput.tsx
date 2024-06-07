//create type with label and placeholder, accept that as props

const correctLabel = (label: string) => {
  const array = label.split(' ');
  if (array.length === 1) return array.join('').toLowerCase();
  const map = array.map((str, i) => {
    if (i === 0) {
      return str.toLowerCase();
    }
    return str[0].toUpperCase() + str.slice(1);
  });

  return map.join('');
};

function TextInput({
  label,
  placeholder,
  onUpdate,
  initialValue,
  isTextArea,
  platform
}: {
  platform?: string;
  label: string;
  placeholder: string;
  initialValue?: string;
  onUpdate: (fieldName: string, value: string) => void;
  isTextArea?: boolean;
}) {
  const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    onUpdate(correctLabel(label), e.target.value);
  };

  return (
    <div className="mb-3 flex w-full flex-col items-center md:mb-6">
      <label className="mb-2 block w-full pr-4 text-xl font-bold text-violet md:w-4/5">
        {platform ? platform + ' ' + label : label}
      </label>

      <div className="w-full md:w-4/5">
        {isTextArea ? (
          <textarea
            id={correctLabel(label)}
            value={initialValue || ''}
            onChange={onChange}
            rows={4}
            className="min-h-[100px] w-full appearance-none rounded border border-grey-200 px-2 py-2 leading-tight text-violet placeholder-gray-300 focus-within:border-violet focus:outline-none"
            placeholder={placeholder}
          />
        ) : (
          <input
            id={correctLabel(label)}
            value={initialValue || ''}
            onChange={onChange}
            className="w-full appearance-none rounded border border-grey-200 px-2 py-2 leading-tight text-violet placeholder-gray-300 focus-within:border-violet focus:outline-none"
            type="text"
            placeholder={placeholder}
          />
        )}
      </div>
    </div>
  );
}

export default TextInput;

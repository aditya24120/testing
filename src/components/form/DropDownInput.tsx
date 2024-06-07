//import usestate
import { MouseEventHandler, useEffect, useState } from 'react';

type DropDownProps = {
  label: string;
  defaultOption: string;
  options: string[];
  platform?: string;
  doLowercase?: boolean;
  onUpdate: (fieldName: string, value: string) => void;
};

function DropDownInput({
  label,
  defaultOption,
  options,
  doLowercase = true,
  onUpdate,
  platform
}: DropDownProps) {
  const [selectedOption, setSelectedOption] = useState(
    doLowercase ? defaultOption.toLowerCase() : defaultOption
  );

  const onChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedOption(e?.target?.value);
    onUpdate(label.toLowerCase(), e?.target?.value);
  };

  useEffect(() => {
    onUpdate(label.toLowerCase(), defaultOption);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultOption]);

  return (
    <>
      <div className="flex flex-col items-center justify-center">
        <div className="mb-3 flex w-full flex-col md:w-4/5">
          <label className="mb-2 block pr-4 text-xl font-bold text-violet md:text-left">
            {platform ? platform + ' ' + label : label}
          </label>

          <select
            id={label.toLowerCase()}
            className="form-select m-0
                    block
                    w-full
                    appearance-none
                    rounded
                    border border-grey-200
                    bg-clip-padding bg-no-repeat
                    px-3
                    py-1.5
                    text-base
                    font-medium text-violet outline-none
                    transition
                    ease-in-out
                    focus-within:border-violet
                    "
            onChange={onChange}
            value={selectedOption}
            aria-label={label}
          >
            {options.map((option) => {
              return (
                <option key={option} value={doLowercase ? option.toLowerCase() : option}>
                  {option}
                </option>
              );
            })}
          </select>
        </div>
      </div>
    </>
  );
}

export default DropDownInput;

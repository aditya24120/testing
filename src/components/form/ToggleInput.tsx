import ReactTooltip from 'react-tooltip';

type Props = {
  id: string;
  label: string;
  checked: boolean;
  disabled?: boolean;
  tooltipText?: string;
  margin?: boolean;
  onUpdate: (fieldName: string, value: boolean) => void;
};

const ToggleInput = ({
  id,
  label,
  checked,
  onUpdate,
  disabled,
  tooltipText,
  margin = true
}: Props) => {
  const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    onUpdate(id, !checked);
  };

  return (
    <>
      <ReactTooltip place="right" />
      <div className="flex w-full items-center justify-between ">
        <span
          data-tip={tooltipText}
          data-effect="solid"
          data-multiline="true"
          data-class="tooltip"
          className="mr-3 text-sm font-medium text-violet lg:text-lg"
        >
          {label}
        </span>

        <label
          htmlFor={id}
          className={`relative inline-flex items-center ${
            disabled ? 'cursor-not-allowed' : 'cursor-pointer'
          } ${margin ? 'mr-5' : ''}`}
        >
          <input
            type="checkbox"
            id={id}
            disabled={disabled || false}
            className="peer sr-only"
            onChange={onChange}
            checked={checked && !disabled}
          />

          <div className="peer h-7 w-14 rounded-full bg-violet-200 shadow-md after:absolute after:left-[4px] after:top-1 after:h-5 after:w-5 after:rounded-full after:border after:border-grey-300 after:bg-white after:transition-all after:content-[''] disabled:cursor-not-allowed peer-checked:bg-violet peer-checked:after:translate-x-[142%] " />
        </label>
      </div>
    </>
  );
};

export default ToggleInput;

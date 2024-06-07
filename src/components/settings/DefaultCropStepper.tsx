import { Dispatch, SetStateAction } from 'react';
import { BiCheck } from 'react-icons/bi';
import { Step } from './Templates';

type Props = {
  steps: Step[];
  setCurrentState: Dispatch<SetStateAction<string>>;
  setPrevState: Dispatch<SetStateAction<string | undefined>>;
};

const DefaultCropStepper = ({ steps, setCurrentState, setPrevState }: Props) => {
  const handleNameClicked = (clickedStep: Step) => {
    setCurrentState(clickedStep.stateName);
    setPrevState(clickedStep.stateName);
  };

  return (
    <>
      <nav aria-label="Progress" className="mb-8">
        <ol
          role="list"
          className="flex divide-y divide-violet/40 rounded-md border border-violet/40 md:divide-y-0"
        >
          {steps.map((step, stepIdx) => (
            <li key={step.name} className="relative flex flex-1 border-none">
              {step.status === 'complete' && (
                <CompletedStep step={step} handleNameClicked={handleNameClicked} />
              )}
              {step.status === 'current' && <CurrentStep step={step} />}
              {step.status === 'upcoming' && <UpcomingStep step={step} />}

              {/* Arrow separator for lg screens and up */}
              <Arrow stepIndex={stepIdx} stepsLength={steps.length - 1} />
            </li>
          ))}
        </ol>
      </nav>
    </>
  );
};

export default DefaultCropStepper;

const CompletedStep = ({
  step,
  handleNameClicked
}: {
  step: Step;
  handleNameClicked: (clickedStep: Step) => void;
}) => {
  return (
    <div onClick={() => handleNameClicked(step)} className="group flex w-full items-center">
      <span className="flex items-center px-2 py-2 text-sm font-medium md:px-4">
        <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-violet/40 group-hover:bg-violet ">
          <BiCheck className="text-border h-6 w-6 group-hover:text-white" aria-hidden="true" />
        </span>
        <span className="pl-1 text-center text-xs font-extrabold text-violet md:ml-4 md:block md:text-sm">
          {step.name}
        </span>
      </span>
    </div>
  );
};

const CurrentStep = ({ step }: { step: Step }) => {
  return (
    <div className="flex items-center px-2 py-2 text-sm font-medium md:px-4" aria-current="step">
      <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border-2 border-violet">
        <span className="text-violet">{step.id}</span>
      </span>
      <span className="pl-1 text-center text-xs font-bold text-violet md:ml-4 md:block md:text-sm">
        {step.name}
      </span>
    </div>
  );
};

const UpcomingStep = ({ step }: { step: Step }) => {
  return (
    <div className="group flex items-center">
      <span className="flex items-center px-2 py-2 text-sm font-medium md:px-4">
        <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border-2 border-violet/40 group-hover:border-violet">
          <span className="text-violet/40 group-hover:text-violet">{step.id}</span>
        </span>
        <span className="pl-1 text-center text-xs font-bold text-violet/40 group-hover:text-violet md:ml-4 md:block md:text-sm">
          {step.name}
        </span>
      </span>
    </div>
  );
};

const Arrow = ({ stepIndex, stepsLength }: { stepIndex: number; stepsLength: number }) => {
  if (stepIndex !== stepsLength) {
    return (
      <div className="absolute right-0 top-0 h-full md:block md:w-5" aria-hidden="true">
        <svg
          className="h-full w-full text-violet/40"
          viewBox="0 0 22 80"
          fill="none"
          preserveAspectRatio="none"
        >
          <path
            d="M0 -2L20 40L0 82"
            vectorEffect="non-scaling-stroke"
            stroke="currentcolor"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    );
  }
  return null;
};

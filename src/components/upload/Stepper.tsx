import { useEffect, useState } from 'react';
import { BiCheck } from 'react-icons/bi';

import { useUploadContext } from '../../context/UploadContext';
import { states, statesInOrder } from '../../utils/states';

type Step = {
  id: string;
  name: string;
  href: string;
  status: string;
  stateName: string;
};

export default function Stepper({ defaultSteps }: { defaultSteps: Step[] }) {
  const { currentState, prevState, setCurrentState, setPrevState } = useUploadContext();
  const [steps, setSteps] = useState(defaultSteps);

  const stateNameClicked = (clickedStep: Step) => {
    setCurrentState(clickedStep.stateName);
    setPrevState(clickedStep.stateName);
  };

  useEffect(() => {
    if (localStorage.getItem('scheduleClip') === 'true') {
      const updatedSteps = defaultSteps.map((obj) => {
        if (obj.stateName === states.FINISH) {
          return { ...obj, name: 'ScheduleClip' };
        }
        return obj;
      });
      setSteps(updatedSteps);
    }
  }, []);

  useEffect(() => {
    let newSteps = steps.map((step) => step);
    // update steps
    if (currentState) {
      let currentStateIndex = statesInOrder.indexOf(currentState);
      let prevStateIndex = prevState ? statesInOrder.indexOf(prevState) : 0;
      if (currentStateIndex >= prevStateIndex) {
        for (let i = 0; i < statesInOrder.length; i++) {
          newSteps[i].status = 'upcoming';
        }
        for (let i = 0; i <= prevStateIndex; i++) {
          newSteps[i].status = 'complete';
        }
        newSteps[currentStateIndex].status = 'current';
      } else {
        for (let i = 0; i < currentStateIndex; i++) {
          newSteps[i].status = 'complete';
        }
        newSteps[currentStateIndex].status = 'current';
        newSteps[prevStateIndex].status = 'upcoming';
      }
      setSteps(newSteps);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentState, prevState]);

  return (
    <>
      {currentState != undefined && (
        <nav aria-label="Progress" className="mb-12">
          <ol
            role="list"
            className="flex divide-y divide-violet/40 rounded-md md:divide-y-0 md:border md:border-violet/40"
          >
            {steps.map((step, stepIdx) => (
              <li key={step.name} className="relative border-none md:flex md:flex-1">
                {step.status === 'complete' ? (
                  <a
                    href={step.href}
                    onClick={() => stateNameClicked(step)}
                    className="group flex w-full items-center"
                  >
                    <span className="flex items-center px-2 py-2 text-sm font-medium md:px-4">
                      <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-violet ">
                        <BiCheck className="h-6 w-6 text-white" aria-hidden="true" />
                      </span>
                      <span className="ml-4 hidden text-sm font-extrabold text-violet md:block">
                        {step.name}
                      </span>
                    </span>
                  </a>
                ) : step.status === 'current' ? (
                  <a
                    href={step.href}
                    className="flex items-center px-2 py-2 text-sm font-medium md:px-4"
                    aria-current="step"
                  >
                    <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border-2 border-violet">
                      <span className="text-violet">{step.id}</span>
                    </span>
                    <span className="ml-4 hidden text-sm font-bold text-violet md:block">
                      {step.name}
                    </span>
                  </a>
                ) : (
                  <a href={step.href} className="group flex items-center">
                    <span className="flex items-center px-2 py-2 text-sm font-medium md:px-4">
                      <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border-2 border-violet/40 group-hover:border-violet">
                        <span className="text-violet/40 group-hover:text-violet">{step.id}</span>
                      </span>
                      <span className="ml-4 hidden text-sm font-bold text-violet/40  group-hover:text-violet md:block">
                        {step.name}
                      </span>
                    </span>
                  </a>
                )}

                {stepIdx !== steps.length - 1 ? (
                  <>
                    {/* Arrow separator for lg screens and up */}
                    <div
                      className="absolute right-0 top-0 hidden h-full md:block md:w-5"
                      aria-hidden="true"
                    >
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
                  </>
                ) : null}
              </li>
            ))}
          </ol>
        </nav>
      )}
    </>
  );
}

import { Dispatch, SetStateAction } from 'react';
import DefaultCropStepper from './DefaultCropStepper';
import { Step } from './Templates';
import TemplateStateButtons from './TemplateStateButtons';

type Props = {
  children: React.ReactNode;
  steps: Step[];
  stepsInOrder: string[];
  currentState: string;
  setCurrentState: Dispatch<SetStateAction<string>>;
  setPrevState: Dispatch<SetStateAction<string | undefined>>;
  handleNextState: () => void;
  handlePrevState: () => void;
  handleSaveCropTemplate?: () => void;
  isCreatingTemplate?: boolean;
};

const CropWrapper = ({
  children,
  steps,
  stepsInOrder,
  currentState,
  setCurrentState,
  setPrevState,
  handleNextState,
  handlePrevState,
  handleSaveCropTemplate,
  isCreatingTemplate
}: Props) => {
  return (
    <>
      <DefaultCropStepper
        steps={steps}
        setCurrentState={setCurrentState}
        setPrevState={setPrevState}
      />

      {children}

      <TemplateStateButtons
        steps={steps}
        stateOrder={stepsInOrder}
        currentState={currentState}
        setPrevState={handlePrevState}
        setNextState={handleNextState}
        handleFinalStep={handleSaveCropTemplate}
        finalStepLoading={isCreatingTemplate}
      />
    </>
  );
};
export default CropWrapper;

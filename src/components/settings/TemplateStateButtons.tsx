import PrimaryButton from '../common/PrimaryButton';
import SecondaryButton from '../common/SecondaryButton';
import { Step } from './Templates';
type Props = {
  steps: Step[];
  currentState: string;
  stateOrder: string[];
  setPrevState: () => void;
  setNextState: () => void;
  handleFinalStep?: () => void;
  finalStepLoading?: boolean;
};
const TemplateStateButtons = ({
  steps,
  currentState,
  stateOrder,
  setPrevState,
  setNextState,
  handleFinalStep,
  finalStepLoading = false
}: Props) => {
  const finalStep = stateOrder.indexOf(currentState) >= stateOrder.length - 1;
  const prevDisabled = stateOrder.indexOf(currentState) > 0;
  const showButtons = steps[stateOrder.indexOf(currentState)].showButtons;

  return (
    <div className="flex w-full justify-end gap-4 ">
      {showButtons && prevDisabled && (
        <SecondaryButton onClick={setPrevState}>Back</SecondaryButton>
      )}

      {showButtons && !finalStep && (
        <PrimaryButton onClick={setNextState} disabled={finalStep}>
          Next
        </PrimaryButton>
      )}

      {showButtons && finalStep && (
        <PrimaryButton onClick={handleFinalStep} disabled={finalStepLoading}>
          {finalStepLoading ? 'Saving...' : 'Save'}
        </PrimaryButton>
      )}
    </div>
  );
};
export default TemplateStateButtons;

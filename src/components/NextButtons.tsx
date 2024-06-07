import PrimaryButton from './common/PrimaryButton';
import SecondaryButton from './common/SecondaryButton';

type ButtonPressFunc = () => void;
export type NextButtonsProps = {
  backButtonPressed: ButtonPressFunc;
  nextButtonPressed: ButtonPressFunc;
  nextText?: string;
  showBackButton?: boolean;
};
export default function NextButtons({
  backButtonPressed,
  nextButtonPressed,
  nextText,
  showBackButton = true
}: NextButtonsProps) {
  return (
    <div className="mb-3 mt-20 flex justify-center gap-5">
      <SecondaryButton onClick={backButtonPressed} className={showBackButton ? '' : 'hidden'}>
        Go Back
      </SecondaryButton>
      <PrimaryButton onClick={nextButtonPressed}>{nextText || 'Next'}</PrimaryButton>
    </div>
  );
}

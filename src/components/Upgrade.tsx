import Link from 'next/link';
import { BsArrowRight } from 'react-icons/bs';
import { WiStars } from 'react-icons/wi';
import { premiumFeatures } from '../utils/features';
import FeatureItem from './FeatureItem';

const Upgrade = () => {
  return (
    <Link href={'/upgrade'}>
      <div
        className={`group flex cursor-pointer flex-col items-start justify-start rounded-md bg-gradient-to-tr from-violet to-slushi py-2 shadow-md`}
      >
        <div className="px-4">
          <h3 className="flex items-center gap-2 text-2xl font-semibold text-white">
            <WiStars className={`h-8 w-8`} />
            Go Premium
          </h3>
          <p className="mb-2 text-sm text-grey-200">Upgrade to premium to unlock more features!</p>
        </div>

        <div className="flex flex-col gap-2 bg-white/90 px-2 py-2 shadow-inner">
          {premiumFeatures.map((feature) => (
            <FeatureItem feature={feature} small={true} />
          ))}
        </div>

        <div className="px-4">
          <span className="group-hover:text-border mb-1 mt-4 flex transform items-center gap-1 text-xl text-white duration-150 ease-in group-hover:gap-2">
            Upgrade now <BsArrowRight />
          </span>
        </div>
      </div>
    </Link>
  );
};
export default Upgrade;

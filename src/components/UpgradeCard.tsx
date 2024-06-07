import Link from 'next/link';
import { BsArrowRight } from 'react-icons/bs';
import { WiStars } from 'react-icons/wi';

const UpgradeCard = () => {
  return (
    <Link href={'/upgrade'}>
      <div
        className={`group flex cursor-pointer flex-col items-start justify-start rounded-md bg-violet px-4 py-2`}
      >
        <h3 className={`flex items-center gap-1 text-white`}>
          <WiStars className={`h-8 w-8`} />
          Go Premium
        </h3>
        <p className="text-sm text-grey-200">Upgrade to premium to unlock more features</p>

        <span className="group-hover:text-border mt-2 flex transform items-center gap-1 text-white duration-150 ease-in group-hover:gap-2">
          Upgrade now <BsArrowRight />
        </span>
      </div>
    </Link>
  );
};
export default UpgradeCard;

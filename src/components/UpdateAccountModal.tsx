import Modal from 'react-modal';
import { Dispatch, SetStateAction } from 'react';
import { useRouter } from 'next/router';

import Image from 'next/image';

import { AiOutlineCheck } from 'react-icons/ai';

import { premiumFeatures } from '../utils/features';

import logoImage from '../../public/assets/images/text-logo.png';
import boxLogoImage from '../../public/assets/images/box-logo.png';

const customStyles = {
  overlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.75)'
  }
};

type Props = {
  modalOpen: boolean;
  setModalOpen: Dispatch<SetStateAction<boolean>>;
};
const UpdateAccountModal = ({ modalOpen, setModalOpen }: Props) => {
  const router = useRouter();

  return (
    <Modal
      isOpen={modalOpen}
      ariaHideApp={false}
      style={customStyles}
      className="absolute bottom-auto left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 transform rounded-md bg-white p-4 shadow-inner md:w-1/2"
      onRequestClose={() => setModalOpen(false)}
    >
      <div className="flex flex-col md:h-full md:w-full">
        <div className="flex flex-col md:flex-row">
          <div className="flex w-72 flex-col items-center md:h-full md:gap-y-20 md:p-6">
            <div>
              <Image src={logoImage} alt="Clipbot.Tv" id="logo" />
            </div>

            {/* <div className="hidden md:block">
              <Image src={boxLogoImage} alt="Clipbot.Tv" id="logo" />
            </div> */}
          </div>

          <div className="flex flex-col md:py-2 ">
            <h1 className="mb-2 block w-full pr-4 font-sans text-2xl font-semibold capitalize text-violet-400 md:text-4xl">
              <span className="text-violet">Gain</span> Full Access To Our Premium Features
            </h1>

            <p className="mb-6 w-full text-gray-400">
              A premium membership is required to access this feature.
            </p>

            <ul role="list" className="mb-4 space-y-2 md:space-y-4">
              {premiumFeatures.map((feature) => (
                <li key={feature.label} className="flex items-center">
                  <div className="flex-shrink-0">
                    <AiOutlineCheck className="h-7 w-7 text-violet" aria-hidden="true" />
                  </div>
                  <p className="ml-3 text-base font-medium capitalize text-violet-400">
                    {feature.label}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className={`flex justify-center gap-4 md:justify-end`}>
          <button
            onClick={() => router.push('/pricing')}
            className="md:text-l inline-block rounded-b-lg rounded-tl-lg bg-violet px-4 py-1.5 text-sm font-bold text-white hover:enabled:bg-violet/80 disabled:cursor-not-allowed disabled:opacity-50 md:px-8"
          >
            Upgrade
          </button>

          <button
            disabled={false}
            className="md:text-l inline-block rounded-b-lg rounded-tl-lg border-2 border-violet px-4 py-1.5 text-sm font-bold text-violet hover:enabled:bg-grey-200/20 disabled:cursor-not-allowed disabled:opacity-50 md:px-8"
            onClick={() => setModalOpen(false)}
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
};
export default UpdateAccountModal;

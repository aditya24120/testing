import { useState } from 'react';
import Modal from 'react-modal';
import { Dispatch, SetStateAction } from 'react';
import Checkbox from './form/Checkbox';
import logo from '../../public/assets/images/logo-large.png';
import logoImage from '../../public/assets/images/logo.png';
import Image from 'next/image';

const customStyles = {
  overlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
  },
  content: {
    top: '50%',
    left: '50%',
    bottom: 'auto',
    transform: 'translate(-50%, -50%)',
    background: '#3D3838',
    borderRadius: '6px',
    width: 'fit-content',
  },
};

type Props = {
  modalOpen: boolean;
  setModalOpen: Dispatch<SetStateAction<boolean>>;
};

const BetaPopup = ({ modalOpen, setModalOpen }: Props) => {
  const [checked, setChecked] = useState(false);

  const handleChange = () => {
    setChecked(!checked);
    localStorage.setItem('BetaPopup', JSON.stringify(!checked));
  };

  return (
    <Modal
      isOpen={modalOpen}
      ariaHideApp={false}
      style={customStyles}
      onRequestClose={() => setModalOpen(false)}
    >
      <div className=" flex w-full items-center   ">
        <div className=" m-6 w-72">
          <Image src={logoImage} alt="Clipbot.Tv" id="logo" />
        </div>
        <div className="flex flex-col py-2 ">
          <h1 className="mb-6 block w-full pr-4 text-3xl  text-white">
            <span className="text-border">Welcome</span> to Clipbot Web!
          </h1>
          <p className="mb-6 w-full text-lg text-gray-200">
            This is a beta version undergoing development, not the main product. To download the
            main desktop app, click here:
          </p>
          <div className="flex w-full justify-center">
            <a
              href="https://clipbot.tv/download"
              target="_blank"
              rel="noreferrer"
              className=" rounded-md bg-sidebar px-4 py-2 shadow shadow-white hover:bg-sidebar/80"
            >
              <div className="z-30 w-40">
                <Image src={logo} alt="Clipbot.Tv" id="logo" />
              </div>
            </a>
          </div>
        </div>
      </div>
      <div className={`flex justify-between gap-4`}>
        <Checkbox label="Do not show again" value={checked} onChange={handleChange} />
        <button
          disabled={false}
          className="border-navy-80 inline-block rounded-b-lg rounded-tl-lg border-2 py-1 px-6 font-bold text-white hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-50"
          onClick={() => setModalOpen(false)}
        >
          Close
        </button>
      </div>
    </Modal>
  );
};
export default BetaPopup;

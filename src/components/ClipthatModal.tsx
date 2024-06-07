import { useState } from 'react';
import Modal from 'react-modal';
import { Dispatch, SetStateAction } from 'react';
import Checkbox from './form/Checkbox';

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
  },
};

type Props = {
  modalOpen: boolean;
  setModalOpen: Dispatch<SetStateAction<boolean>>;
};

const ClipthatModal = ({ modalOpen, setModalOpen }: Props) => {
  const [checked, setChecked] = useState(false);

  const handleChange = () => {
    setChecked(!checked);
    localStorage.setItem('clipthatModalDSA', JSON.stringify(!checked));
  };

  return (
    <Modal isOpen={modalOpen} ariaHideApp={false} style={customStyles}>
      <div className="flex flex-col items-center mb-3 md:mb-6 w-full">
        <label className="block text-white font-bold text-2xl pr-4 w-full mb-6">
          Welcome to Clipbot Web!
        </label>
        <p className="text-gray-200 text-lg w-full mb-4">
          Now that you&rsquo;ve got an awesome clip, let&rsquo;s edit it and get it posted to Tiktok
          and YouTube Shorts!
        </p>
      </div>
      <div className={`flex justify-between gap-4`}>
        <Checkbox label="Do not show again" value={checked} onChange={handleChange} />
        <button
          disabled={false}
          className="bg-border hover:bg-border/80 text-black font-bold py-1.5 px-6 inline-block rounded-b-lg rounded-tl-lg disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={() => setModalOpen(false)}
        >
          Get started
        </button>
      </div>
    </Modal>
  );
};
export default ClipthatModal;

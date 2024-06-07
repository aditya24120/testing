import Modal from 'react-modal';
import { Dispatch, SetStateAction } from 'react';

const customStyles = {
  overlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.75)'
  },
  content: {
    top: '50%',
    left: '50%',
    bottom: 'auto',
    transform: 'translate(-35%, -50%)',
    background: '#3D3838',
    borderRadius: '6px'
  }
};

type Props = {
  modalOpen: boolean;
  setModalOpen: Dispatch<SetStateAction<boolean>>;
};
const InstagramLoginError = ({ modalOpen, setModalOpen }: Props) => {
  return (
    <Modal isOpen={modalOpen} ariaHideApp={false} style={customStyles}>
      <h1 className="text-4xl text-red-500">Error granting Permission for Facebook</h1>
      <h2 className="mb-6 text-sm text-red-300">
        While trying to grant Permission for Facebook, an error has occured.
      </h2>
      <p className="mb-4 text-lg text-slate-100">
        An Instagram Business account with a linked Facebook page is required to grant the correct
        permissions. You must approve all 4 requested permissions.
      </p>
      <p className="mb-2 text-sm text-slate-200">
        For help setting up a Business account please visit
        <a
          href="https://help.instagram.com/502981923235522"
          target="_blank"
          rel="noreferrer"
          className=" underline"
        >
          {' '}
          this post
        </a>
      </p>
      <p className="mb-6 text-sm text-slate-200">
        For help linking a facebook page please visit
        <a
          href="https://blog.hootsuite.com/link-instagram-to-facebook-page/"
          target="_blank"
          rel="noreferrer"
          className=" underline"
        >
          {' '}
          this post
        </a>
      </p>
      <p className="mb-6 text-sm text-slate-200">
        Please ensure the above is completed and try again. If you have an Instagram Business
        account with a linked Facebook page and this error is occurring, please contact support
        found in the
        <a
          href="https://discord.gg/FZscDWnhau"
          target="_blank"
          rel="noreferrer"
          className=" underline"
        >
          {' '}
          Discord
        </a>
      </p>
      <div className={`flex justify-end gap-4`}>
        <button
          className="inline-block rounded-b-lg rounded-tl-lg bg-border px-6 py-1.5 font-bold text-black hover:bg-border/80 disabled:cursor-not-allowed disabled:opacity-50"
          onClick={() => setModalOpen(false)}
        >
          Close
        </button>
      </div>
    </Modal>
  );
};
export default InstagramLoginError;

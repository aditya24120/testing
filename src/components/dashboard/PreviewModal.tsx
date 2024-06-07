import { Dispatch, SetStateAction } from 'react';
import Modal from 'react-modal';
import VideoPreview, { ClipData } from '../crop/VideoPreview';
import SecondaryButton from '../common/SecondaryButton';
type Props = {
  modalOpen: boolean;
  closeModal: Dispatch<SetStateAction<boolean>>;
  clipUrl: string;
  clipTitle: string;
  cropData: ClipData;
};

const customStyles = {
  overlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.75)'
  }
};
const PreviewModal = ({ modalOpen, closeModal, clipUrl, clipTitle, cropData }: Props) => {
  return (
    <Modal
      isOpen={modalOpen}
      ariaHideApp={false}
      style={customStyles}
      onRequestClose={() => closeModal(false)}
      className="absolute bottom-auto left-1/2 top-1/2 w-fit -translate-x-1/2 -translate-y-1/2 transform rounded-md bg-white p-4 shadow-inner"
    >
      <div className="mb-3 flex w-full flex-col items-center md:mb-6 ">
        <h1 className="max-w-sm overflow-hidden text-ellipsis whitespace-nowrap text-center font-semibold text-violet">
          {clipTitle}
        </h1>
        <VideoPreview clipURL={clipUrl} clipData={cropData} muted={false} />
      </div>

      <div className={`flex justify-center gap-4`}>
        <SecondaryButton onClick={() => closeModal(false)} className="block">
          Close
        </SecondaryButton>
      </div>
    </Modal>
  );
};
export default PreviewModal;

import { Dispatch, SetStateAction, useEffect } from 'react';
import Image from 'next/image';
import camTop from '../../../public/assets/images/camTop.png';
import noCam from '../../../public/assets/images/noCam.png';
import freeform from '../../../public/assets/images/freeform.png';
import camFreeform from '../../../public/assets/images/camFreeform.png';
import { CropSettings, TCropType } from '../../types/types';

const CropType = ({
  handleCropStateChange,
  setCropType,
  nextState,
  setCamCrop,
  textSize,
  marginBottom
}: {
  handleCropStateChange?: (type: TCropType) => void;
  setCropType: Dispatch<SetStateAction<TCropType>>;
  nextState: () => void;
  setCamCrop: Dispatch<SetStateAction<CropSettings | undefined>>;
  textSize?: string;
  marginBottom?: string;
}) => {
  const handleType = (type: TCropType) => {
    setCropType(type);
    if (handleCropStateChange) {
      handleCropStateChange(type);
    }

    nextState();
    if (type === 'NO_CAM') {
      setCamCrop(undefined);
    }
  };

  useEffect(() => {
    setCropType(undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <h1
        className={`font-semibold text-violet ${textSize ?? 'text-4xl'} ${marginBottom ?? 'mb-12'}`}
      >
        Choose a template:
      </h1>

      <div className="grid grid-cols-2 gap-2 md:grid-cols-4 md:gap-4" id="cropTypeDiv">
        <div className="input-group hover:border-border m-auto  rounded hover:border-2">
          <input
            type="radio"
            name="cropType"
            className="border-border hidden cursor-pointer rounded border"
            id="cam-top"
            onClick={() => handleType('CAM_TOP')}
          />
          <label
            htmlFor="cam-top"
            className="bg-sidebar flex cursor-pointer flex-col items-center rounded shadow-lg"
          >
            <Image src={camTop} alt="cam top image" className="rounded" />
            <p className="p-4 text-lg font-bold text-violet">Cam Top</p>
          </label>
        </div>

        <div className="input-group hover:border-border  m-auto  rounded hover:border-2">
          <input
            type="radio"
            name="cropType"
            className="border-border hidden cursor-pointer rounded border"
            id="no-cam"
            onClick={() => handleType('NO_CAM')}
          />
          <label
            htmlFor="no-cam"
            className="bg-sidebar flex cursor-pointer flex-col items-center rounded shadow-lg"
          >
            <Image src={noCam} alt="cam top image" className="rounded" />
            <p className="p-4 text-lg font-bold text-violet">No Cam</p>
          </label>
        </div>

        <div className="input-group hover:border-border  m-auto  rounded hover:border-2">
          <input
            type="radio"
            name="cropType"
            className="border-border hidden cursor-pointer rounded border"
            id="freeform"
            onClick={() => handleType('FREEFORM')}
          />
          <label
            htmlFor="freeform"
            className="bg-sidebar flex cursor-pointer flex-col items-center rounded shadow-lg"
          >
            <Image src={freeform} alt="cam top image" className="rounded" />
            <p className="p-4 text-lg font-bold text-violet">Freeform</p>
          </label>
        </div>

        <div className="input-group hover:border-border m-auto rounded hover:border-2">
          <input
            type="radio"
            name="cropType"
            className="border-border hidden cursor-pointer rounded border"
            id="cam-freeform"
            onClick={() => handleType('CAM_FREEFORM')}
          />
          <label
            htmlFor="cam-freeform"
            className="bg-sidebar flex cursor-pointer flex-col items-center rounded shadow-lg"
          >
            <Image src={camFreeform} alt="cam top image" className="rounded" />
            <p className="px-2 py-4 text-lg font-bold text-violet">Cam + Freeform</p>
          </label>
        </div>
      </div>
    </>
  );
};
export default CropType;

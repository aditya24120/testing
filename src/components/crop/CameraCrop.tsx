import { Dispatch, SetStateAction, useCallback, useContext, useEffect, useState } from 'react';
import { CropSettings, TCropType } from '../../types/types';
import VideoPlayer from '../VideoPlayer';
import Cropper from 'cropperjs';
import 'cropperjs/dist/cropper.css';
import ToggleInput from '../form/ToggleInput';
import { trpc } from '../../utils/trpc';
import { ClipContext, UserContextState } from '../../context/ClipContext';
import { useSession } from 'next-auth/react';
import UpdateAccountModal from '../UpdateAccountModal';

type CropState = 'camCrop' | 'screenCrop';
type Props = {
  cropType: TCropType;
  cropState: CropState;
  setCropState: Dispatch<SetStateAction<CropState>>;
  camCrop?: CropSettings;
  setCamCrop: Dispatch<SetStateAction<CropSettings | undefined>>;
  screenCrop: CropSettings | undefined;
  setScreenCrop: Dispatch<SetStateAction<CropSettings | undefined>>;
  screenAspectRatio: number | undefined;
  setScreenAspectRatio: Dispatch<SetStateAction<number | undefined>>;
  aspectRatio: number;
  setAspectRatio: Dispatch<SetStateAction<number>>;
  clipDownloadUrl: string;
  defaultStartTime: number;
  defaultEndTime: number;
  twitch_id?: string;
  handleChangeClip?: () => void;
};

const internalWidth = 960;
const internalHeight = 540;

const CameraCrop = ({
  cropType,
  cropState,
  setCropState,
  camCrop,
  setCamCrop,
  screenCrop,
  setScreenCrop,
  screenAspectRatio,
  setScreenAspectRatio,
  clipDownloadUrl,
  aspectRatio,
  setAspectRatio,
  defaultStartTime = 0,
  defaultEndTime = 60,
  handleChangeClip,
  twitch_id
}: Props) => {
  const { data: session } = useSession();
  const user = session?.user;

  const [upgradeShow, setUpgradeShow] = useState(false);
  const { setCurrentClip, currentClip } = useContext(ClipContext) as UserContextState;
  const [autoCation, setAutoCaption] = useState<boolean>(currentClip?.autoCaption || false);
  const [currCropDetails, setCurrCropDetails] = useState<CropSettings>();
  const [cropper, setCropper] = useState<Cropper>();

  const { mutateAsync: updateAutoCaption, isError: isAutoCaptionError } = trpc.useMutation([
    'transcribe.updateAutoCaption'
  ]);

  const { data: userDetails, isLoading: getUserLoading } = trpc.useQuery(['user.getDetails']);
  const isSubbed = user?.userId === userDetails?.id && userDetails?.sub_status === 'active';

  const handleOnCaptionUpdate = async (value: boolean) => {
    if (!twitch_id) return;
    await updateAutoCaption({ twitch_id, autoCation: value });
    if (isAutoCaptionError) return;

    setAutoCaption(value);
    setCurrentClip((prev) => {
      if (!prev) return;
      return { ...prev, autoCaption: value };
    });
  };

  const updateCropLocation = (x = 0, y = 0) => {
    cropper?.setData({ x, y });
  };

  const handleAspectRatioChange = (aspectRatio: number) => {
    if (cropState === 'screenCrop' && (cropType === 'CAM_TOP' || cropType === 'CAM_FREEFORM')) {
      setCropState('camCrop');
      cropper?.setAspectRatio(aspectRatio);
      setAspectRatio(aspectRatio);
      updateCropLocation(camCrop?.x, camCrop?.y);
      setScreenCrop(undefined);
    } else {
      cropper?.setAspectRatio(aspectRatio);
      setAspectRatio(aspectRatio);
      updateCropLocation(currCropDetails?.x, currCropDetails?.y);
    }
  };

  const cropperRef = useCallback((node: any) => {
    // the magic needed to set default hight on screen crop
    let screenRatio = screenAspectRatio;
    if (cropType === 'FREEFORM') {
      setScreenAspectRatio(NaN);
      screenRatio = NaN;
    }

    const aspectRatioToUse = cropState === 'screenCrop' ? screenRatio : aspectRatio;
    const defaultScreenCrop = screenCrop ?? {
      height: internalHeight,
      x: internalWidth / 2 - (internalHeight * aspectRatioToUse!) / 2
    };
    if (node !== null) {
      const cropperCanvas = new Cropper(node, {
        aspectRatio: aspectRatioToUse,
        background: false,
        modal: false,
        highlight: false,
        viewMode: 1,
        zoomable: false,
        data: cropState === 'screenCrop' ? defaultScreenCrop : camCrop,
        crop(event: Cropper.CropEvent) {
          const eventCropDetails = {
            x: event.detail.x,
            y: event.detail.y,
            width: event.detail.width,
            height: event.detail.height,
            scaleX: event.detail.scaleX,
            scaleY: event.detail.scaleY
          };

          cropState === 'screenCrop'
            ? setScreenCrop(eventCropDetails)
            : setCamCrop(eventCropDetails);
          setCurrCropDetails(eventCropDetails);
        }
      });

      setCropper(cropperCanvas);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (getUserLoading) return;
    if (autoCation && twitch_id && !isSubbed) {
      handleOnCaptionUpdate(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSubbed, autoCation]);

  return (
    <>
      <UpdateAccountModal modalOpen={upgradeShow} setModalOpen={setUpgradeShow} />

      <div className="flex flex-col items-center justify-center">
        <header className="mb-8">
          {cropState === 'camCrop' ? (
            <>
              <h2 className="text-2xl font-semibold text-violet" style={{ width: internalWidth }}>
                Select camera area
              </h2>
              <p className="text-gray-400">Drag and resize the box to wherever your facecam is.</p>
            </>
          ) : (
            <>
              <h2 className="text-2xl font-semibold text-violet" style={{ width: internalWidth }}>
                Select content area
              </h2>
              <p className="text-gray-400">Drag and resize the box to where your content is.</p>
            </>
          )}
        </header>

        <div className="relative">
          <div
            className="video-container relative overflow-hidden"
            style={{ width: internalWidth, height: internalHeight }}
          >
            <VideoPlayer
              url={clipDownloadUrl}
              width={internalWidth}
              height={internalHeight}
              defaultStartTime={defaultStartTime}
              defaultEndTime={defaultEndTime}
              autoplay={true}
              loop={true}
              muted={true}
              state={cropState}
            />
          </div>
          <div
            className="crop-contrainer absolute left-0 top-0 overflow-hidden "
            style={{ width: internalWidth, height: internalHeight }}
          >
            <canvas
              id="vidCanvas"
              ref={cropperRef}
              className="block max-w-full"
              width={internalWidth}
              height={internalHeight}
            />
          </div>
        </div>

        <div className="mb-4 mt-2 flex w-[960px] justify-between font-semibold">
          {(cropState === 'camCrop' || (cropState === 'screenCrop' && camCrop)) && (
            <div className="flex">
              <button
                className={`cursor rounded-bl rounded-tl border border-r-0 border-violet px-6 py-1 text-violet ${
                  aspectRatio === 16 / 9 ? 'bg-violet text-white ' : ''
                }`}
                onClick={() => handleAspectRatioChange(16 / 9)}
              >
                16:9
              </button>
              <div></div>
              <button
                className={`cursor rounded-br rounded-tr border border-violet px-6 py-1 text-violet ${
                  aspectRatio === 4 / 3 ? 'bg-violet text-white ' : ''
                }`}
                onClick={() => handleAspectRatioChange(4 / 3)}
              >
                4:3
              </button>
            </div>
          )}

          {handleChangeClip && (cropState === 'screenCrop' || cropState === 'camCrop') && (
            <button
              onClick={handleChangeClip}
              className="border-border inline-block rounded-b-lg rounded-tl-lg border bg-violet px-6 py-1.5 font-bold text-white hover:enabled:bg-violet/80 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Change Clip
            </button>
          )}

          {!handleChangeClip && cropState === 'screenCrop' && (
            <div className="">
              <ToggleInput
                id="autoCaption"
                label="Add Auto Captions"
                tooltipText="Auto generate captions that will appear at the bottom of the clip"
                onUpdate={(_, value) => {
                  if (!isSubbed) {
                    handleOnCaptionUpdate(false);
                    setUpgradeShow(true);
                  } else {
                    handleOnCaptionUpdate(value);
                  }
                }}
                checked={autoCation}
              />
            </div>
          )}
        </div>
      </div>
    </>
  );
};
export default CameraCrop;

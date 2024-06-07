import { useState } from 'react';
import CropType from './CropType';
import Preview from './Preview';
import { Clip, CropSettings, TCropType } from '../../types/types';
import { Step } from '../settings/Templates';
import CropWrapper from '../settings/CropWrapper';
import CameraCrop from './CameraCrop';
import TrimVideo from './TrimVideo';
import { trpc } from '../../utils/trpc';

const internalWidth = 960;
const internalHeight = 540;

export const TemplateStates = {
  CROPTYPE: 'CROPTYPE',
  VIDEOTRIM: 'VIDEOTRIM',
  CAMERACROP: 'CAMERACROP',
  PREVIEW: 'PREVIEW'
};

export const TemplateStatesInOrder = ['CROPTYPE', 'VIDEOTRIM', 'CAMERACROP', 'PREVIEW'];

const defaultSteps: Step[] = [
  {
    id: '1',
    name: 'Crop Type',
    status: 'current',
    stateName: TemplateStates.CROPTYPE,
    showButtons: false
  },
  {
    id: '2',
    name: 'Trim Video',
    status: 'upcoming',
    stateName: TemplateStates.VIDEOTRIM,
    showButtons: true
  },
  {
    id: '3',
    name: 'Camera Crop',
    status: 'upcoming',
    stateName: TemplateStates.CAMERACROP,
    showButtons: true
  },
  {
    id: '4',
    name: 'Preview',
    status: 'upcoming',
    stateName: TemplateStates.PREVIEW,
    showButtons: false
  }
];

const Crop = ({ clip }: { clip: Clip }) => {
  const [steps, setSteps] = useState(defaultSteps);
  const [currentState, setCurrentState] = useState(TemplateStates.CROPTYPE);
  const [prevState, setPrevState] = useState<string>();
  const [cropType, setCropType] = useState<TCropType>();
  const [cropState, setCropState] = useState<'camCrop' | 'screenCrop'>('screenCrop');
  const [prevCropState, setPrevCropState] = useState<'camCrop' | 'screenCrop'>();
  const [camCrop, setCamCrop] = useState<CropSettings>();
  const [screenCrop, setScreenCrop] = useState<CropSettings>();
  const [aspectRatio, setAspectRatio] = useState<number>(16 / 9);
  const [screenAspectRatio, setScreenAspectRatio] = useState<number>();
  const [defaultStartTime, setDefaultStartTime] = useState<number>(0);
  const [defaultEndTime, setDefaultEndTime] = useState<number>(60);

  trpc.useQuery(['cropTemplate.getFirstByType', { cropType: cropType! }], {
    enabled: Boolean(cropType),
    refetchOnWindowFocus: false,
    onSuccess: (data) => {
      if (data) {
        if (data.camCrop) {
          const camData = data.camCrop as CropSettings;
          const cropData = {
            x: camData.x,
            y: camData.y,
            width: camData.width,
            height: camData.height
          };
          const camAspect = Math.round((cropData.height / cropData.width) * 1000) / 1000;

          if (camAspect === Math.round((4 / 3) * 1000) / 1000) {
            setAspectRatio(4 / 3);
          }
          setCamCrop(scaleDownCrop(cropData));
        }
        if (data.screenCrop) {
          const screenCrop = data.screenCrop as CropSettings;
          const cropData = {
            x: screenCrop.x,
            y: screenCrop.y,
            width: screenCrop.width,
            height: screenCrop.height
          };
          setScreenCrop(scaleDownCrop(cropData));
        }
      }
    }
  });

  const scaleUpCrop = (crop: CropSettings) => {
    const newCrop: CropSettings = {
      x: crop.x / internalWidth,
      y: crop.y / internalHeight,
      width: crop.width / internalWidth,
      height: crop.height / internalHeight,
      isNormalized: true
    };

    return newCrop;
  };

  const scaleDownCrop = (crop: CropSettings) => {
    const scaleX = internalWidth;
    const scaleY = internalHeight;
    const newCrop: CropSettings = {
      x: crop.x * scaleX,
      y: crop.y * scaleY,
      width: crop.width * scaleX,
      height: crop.height * scaleY
    };
    return newCrop;
  };

  const handleCropStateChange = (type: TCropType) => {
    const isCamCrop = type === 'CAM_TOP' || type === 'CAM_FREEFORM';
    let currentStateIndex = TemplateStatesInOrder.indexOf(currentState);
    let nextState = TemplateStatesInOrder[currentStateIndex + 1];

    if (
      isCamCrop &&
      (!prevCropState || nextState === TemplateStates.VIDEOTRIM || prevCropState === 'camCrop')
    ) {
      setCropState('camCrop');
    } else {
      setCropState('screenCrop');
    }
  };

  const gameCanvas = (camCrop?: CropSettings) => {
    let aspectRatio = 1080 / 1320;

    if (camCrop && cropType === 'CAM_FREEFORM') {
      setScreenAspectRatio(NaN);
    } else if (camCrop) {
      if (camCrop.width / camCrop.height < 1.5) {
        aspectRatio = 1080 / 1110;
      }

      setScreenAspectRatio(aspectRatio);
    } else if (cropType === 'FREEFORM') {
      setScreenAspectRatio(NaN);
    } else {
      //no cam crop
      aspectRatio = 9 / 16;
      setScreenAspectRatio(aspectRatio);
    }
  };

  const updateSteps = (cState: string, pState?: string) => {
    let newSteps = steps.map((step) => step);

    let currentStateIndex = TemplateStatesInOrder.indexOf(cState);
    let prevStateIndex = pState ? TemplateStatesInOrder.indexOf(pState) : 0;
    if (currentStateIndex >= prevStateIndex) {
      for (let i = 0; i < TemplateStatesInOrder.length; i++) {
        newSteps[i].status = 'upcoming';
      }
      for (let i = 0; i <= prevStateIndex; i++) {
        newSteps[i].status = 'complete';
      }
      newSteps[currentStateIndex].status = 'current';
    } else {
      for (let i = 0; i < currentStateIndex; i++) {
        newSteps[i].status = 'complete';
      }
      newSteps[currentStateIndex].status = 'current';
      newSteps[prevStateIndex].status = 'upcoming';
    }
    setSteps(newSteps);
  };

  const handleNextState = () => {
    if (currentState) {
      let currentStateIndex = TemplateStatesInOrder.indexOf(currentState);
      if (currentStateIndex >= TemplateStatesInOrder.length - 1) {
        return;
      }
      let nextState = TemplateStatesInOrder[currentStateIndex + 1];
      if (nextState === TemplateStates.CAMERACROP && !screenCrop) {
        gameCanvas(camCrop);
      }
      if (currentState === TemplateStates.CAMERACROP && cropState === 'camCrop') {
        setPrevCropState(cropState);
        setCropState('screenCrop');
        if (!screenCrop) {
          gameCanvas(camCrop);
        }
        return;
      }
      setPrevState(currentState);
      setCurrentState(nextState);
      updateSteps(nextState, currentState);
    }
  };
  const handlePrevState = () => {
    if (currentState) {
      setPrevState(currentState);
      let currentStateIndex = TemplateStatesInOrder.indexOf(currentState);
      if (currentStateIndex > 0) {
        if (
          cropState === 'screenCrop' &&
          currentState === TemplateStates.CAMERACROP &&
          (cropType === 'CAM_TOP' || cropType === 'CAM_FREEFORM')
        ) {
          setPrevCropState(cropState);
          setCropState('camCrop');
          setScreenCrop(undefined);
          return;
        }
        let nextState = TemplateStatesInOrder[currentStateIndex - 1];
        setCurrentState(nextState);
        if (nextState === 'CROPTYPE') {
          setCamCrop(undefined);
          setScreenCrop(undefined);
          setScreenAspectRatio(NaN);
        }
        updateSteps(nextState, currentState);
      }
    }
  };

  return (
    <>
      <CropWrapper
        steps={steps}
        stepsInOrder={TemplateStatesInOrder}
        currentState={currentState}
        setCurrentState={setCurrentState}
        setPrevState={setPrevState}
        handleNextState={handleNextState}
        handlePrevState={handlePrevState}
      >
        {currentState === TemplateStates.CROPTYPE && (
          <CropType
            handleCropStateChange={handleCropStateChange}
            setCropType={setCropType}
            nextState={handleNextState}
            setCamCrop={setCamCrop}
            textSize={'text-2xl'}
            marginBottom={'mb-4'}
          />
        )}
        {currentState === TemplateStates.VIDEOTRIM && (
          <TrimVideo
            clip={clip}
            state={currentState}
            setDefaultEndTime={setDefaultEndTime}
            setDefaultStartTime={setDefaultStartTime}
          />
        )}
        {currentState === TemplateStates.CAMERACROP && (
          <CameraCrop
            key={cropState}
            cropType={cropType}
            cropState={cropState}
            setCropState={setCropState}
            camCrop={camCrop}
            setCamCrop={setCamCrop}
            screenCrop={screenCrop}
            setScreenCrop={setScreenCrop}
            screenAspectRatio={screenAspectRatio}
            setScreenAspectRatio={setScreenAspectRatio}
            clipDownloadUrl={clip.download_url}
            aspectRatio={aspectRatio}
            setAspectRatio={setAspectRatio}
            defaultStartTime={defaultStartTime}
            defaultEndTime={defaultEndTime}
            twitch_id={clip.twitch_id}
          />
        )}
        {currentState === TemplateStates.PREVIEW && (
          <Preview
            clip={clip}
            clipData={{
              cropType: cropType!,
              startTime: defaultStartTime,
              endTime: defaultEndTime,
              camCrop: camCrop ? scaleUpCrop(camCrop!) : undefined,
              screenCrop: scaleUpCrop(screenCrop!)
            }}
            setStateAndPrevState={handlePrevState}
          />
        )}
      </CropWrapper>
    </>
  );
};
export default Crop;

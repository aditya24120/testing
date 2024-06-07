import React, { useState } from 'react';
import { BsCameraVideo } from 'react-icons/bs';
import { toast } from 'react-toastify';
import { CreateCropTypeInput } from '../../schema/cropType.schema';
import { Clip, CropSettings, TCropType } from '../../types/types';
import { trpc } from '../../utils/trpc';
import SelectClip from '../clips/SelectClip';
import SelectClipUrl from '../clips/SelectClipUrl';
import CameraCrop from '../crop/CameraCrop';
import CropType from '../crop/CropType';
import VideoPreview from '../crop/VideoPreview';
import CropWrapper from './CropWrapper';

const internalWidth = 960;
const internalHeight = 540;

export const TemplateStates = {
  CROPTYPE: 'CROPTYPE',
  CAMERACROP: 'CAMERACROP',
  PREVIEW: 'PREVIEW'
};

export const TemplateStatesInOrder = ['CROPTYPE', 'CAMERACROP', 'PREVIEW'];

export type StepStatus = 'current' | 'upcoming' | 'complete';

export type Step = {
  id: string;
  name: string;
  status: StepStatus;
  stateName: string;
  showButtons: boolean;
};

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
    name: 'Camera Crop',
    status: 'upcoming',
    stateName: TemplateStates.CAMERACROP,
    showButtons: true
  },
  {
    id: '3',
    name: 'Preview',
    status: 'upcoming',
    stateName: TemplateStates.PREVIEW,
    showButtons: true
  }
];

const Templates = () => {
  const [steps, setSteps] = useState(defaultSteps);
  const [currentState, setCurrentState] = useState(TemplateStates.CROPTYPE);
  const [prevState, setPrevState] = useState<string>();
  const [cropType, setCropType] = useState<TCropType>();
  const [cropState, setCropState] = useState<'camCrop' | 'screenCrop'>('screenCrop');
  const [prevCropState, setPrevCropState] = useState<'camCrop' | 'screenCrop'>();
  const [camCrop, setCamCrop] = useState<CropSettings>();
  const [screenCrop, setScreenCrop] = useState<CropSettings>();
  const [aspectRatio, setAspectRatio] = useState(16 / 9);
  const [screenAspectRatio, setScreenAspectRatio] = useState<number>();
  const [selectedClip, setSelectedClip] = useState<Clip>();
  const [changeClip, setChangeClip] = useState(false);

  const { mutateAsync: createTemplate, isLoading: isCreatingTemplate } = trpc.useMutation([
    'cropTemplate.createOrUpdate'
  ]);

  const {
    data: firstClip,
    error,
    isLoading: isFirstClipLoading
  } = trpc.useQuery(['clip.getFirstPopularClips']);

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

  const resetState = () => {
    setSteps(defaultSteps);
    setCurrentState(TemplateStates.CROPTYPE);
    setPrevState(undefined);
    setCropType(undefined);
    setCropState('screenCrop');
    setPrevCropState(undefined);
    setCamCrop(undefined);
    setScreenCrop(undefined);
    setAspectRatio(16 / 9);
    setScreenAspectRatio(undefined);
    setSelectedClip(undefined);
    setChangeClip(false);
  };

  const handleCropStateChange = (type: TCropType) => {
    const isCamCrop = type === 'CAM_TOP' || type === 'CAM_FREEFORM';
    if (isCamCrop && (!prevCropState || prevCropState === 'camCrop')) {
      setCropState('camCrop');
    } else {
      setCropState('screenCrop');
    }
  };

  const handleSaveCropTemplate = async () => {
    if (!cropType || !screenCrop) return;
    const cropTemplate: CreateCropTypeInput = {
      name: 'default',
      cropType,
      camCrop: camCrop ? scaleUpCrop(camCrop) : undefined,
      screenCrop: scaleUpCrop(screenCrop)
    };

    await createTemplate(cropTemplate);
    if (error) {
      toast.error('Error creating template');
      return;
    }
    toast.success('Template saved');
    resetState();
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
    let newSteps = steps.map((step) => ({ ...step }));

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
      if (nextState === TemplateStates.CAMERACROP) {
        gameCanvas(camCrop);
      }
      if (cropState === 'camCrop') {
        gameCanvas(camCrop);
        setPrevCropState(cropState);
        setCropState('screenCrop');
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
          currentState === 'CAMERACROP' &&
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

  const handleSetClip = (clip: Clip) => {
    setSelectedClip(clip);
    setChangeClip(false);
  };

  const handleChangeClip = () => {
    setChangeClip(true);
  };

  if (isFirstClipLoading) {
    return (
      <div className="mt-6 flex animate-pulse flex-col items-center gap-4 text-violet">
        <BsCameraVideo className="h-20 w-20  " />
        <p className="text-base font-semibold">Searching for a clip to use...</p>
      </div>
    );
  }

  if ((!firstClip && !selectedClip) || changeClip) {
    return (
      <div className="py-2">
        <h1 className="flex items-center text-2xl font-bold text-violet">Please select a clip</h1>
        <p className="mb-4 text-gray-400">The selected clip is used to set your crop settings</p>
        <div className="mb-6 md:w-2/3">
          <SelectClipUrl setSelectedClip={handleSetClip} />
        </div>

        <SelectClip
          setSelectedClip={handleSetClip}
          grid={'grid-cols-1 gap-8 pb-16 md:grid-cols-2 lg:grid-cols-4'}
        />
      </div>
    );
  }

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
        handleSaveCropTemplate={handleSaveCropTemplate}
        isCreatingTemplate={isCreatingTemplate}
      >
        {currentState === TemplateStates.CROPTYPE && (
          <CropType
            handleCropStateChange={handleCropStateChange}
            setCropType={setCropType}
            nextState={handleNextState}
            setCamCrop={setCamCrop}
            textSize={'text-xl'}
            marginBottom={'mb-4'}
          />
        )}

        {currentState === TemplateStates.CAMERACROP && cropType && (
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
            clipDownloadUrl={selectedClip ? selectedClip.download_url : firstClip?.download_url!}
            aspectRatio={aspectRatio}
            setAspectRatio={setAspectRatio}
            defaultStartTime={0}
            defaultEndTime={60}
            handleChangeClip={handleChangeClip}
          />
        )}

        {currentState === TemplateStates.PREVIEW && (
          <VideoPreview
            clipURL={selectedClip ? selectedClip.download_url : firstClip?.download_url!}
            clipData={{
              cropType: cropType!,
              startTime: 0,
              endTime: 60,
              camCrop: camCrop ? scaleUpCrop(camCrop) : undefined,
              screenCrop: scaleUpCrop(screenCrop!)
            }}
          />
        )}
      </CropWrapper>
    </>
  );
};
export default Templates;

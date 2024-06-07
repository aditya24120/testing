import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { MdOutlineError } from 'react-icons/md';
import { ClipWithYoutube, CropSettings, TCropType } from '../../types/types';
import { trpc } from '../../utils/trpc';
import VideoPreview from '../crop/VideoPreview';
import ApproveForm from '../form/ApproveForm';
import Select from '../form/Select';
import ToggleInput from '../form/ToggleInput';
import UpdateAccountModal from '../UpdateAccountModal';
import NoStateFound from '../upload/NoStateFound';
import ErrorAlert from '../alert/ErrorAlert';
import SecondaryButton from '../common/SecondaryButton';

type Props = {
  clip: ClipWithYoutube;
};

const ApproveClips = ({ clip }: Props) => {
  const { data: session } = useSession();
  const user = session?.user;

  const { data, isLoading, isError } = trpc.useQuery(['user.getAccountsAndSettings']);
  const isSubbed = user?.userId === data?.user.id && data?.user.sub_status === 'active';
  const [upgradeShow, setUpgradeShow] = useState(false);

  const [cropType, setCropType] = useState<TCropType>();

  const [startTime, setStartTime] = useState<number>(clip.startTime || 0);
  const [endTime, setEndTime] = useState(clip.endTime || NaN);
  const [autoCaption, setAutoCaption] = useState<boolean>(clip.autoCaption || false);

  const { mutateAsync: updateAutoCaption, isError: isAutoCaptionError } = trpc.useMutation([
    'transcribe.updateAutoCaption'
  ]);

  const cropTemplates = data?.cropTemplate;

  const hasTemplates = Boolean(cropTemplates && cropTemplates?.length > 0);

  const templates = cropTemplates
    ? cropTemplates.map((template) => {
        return {
          value: template.cropType,
          label: template.cropType.split('_').join(' ').toLowerCase()
        };
      })
    : [];

  const getCropType = (cropType: TCropType) => {
    if (!cropType) return [];
    return cropTemplates?.filter((temp) => temp.cropType === cropType);
  };

  const cropSettings = cropType
    ? getCropType(cropType)
    : (data?.settings?.cropType as TCropType)
    ? getCropType(data?.settings?.cropType as TCropType)
    : getCropType(cropTemplates?.[0]?.cropType as TCropType);

  const screenCrop = cropSettings?.[0]?.screenCrop as CropSettings | undefined;

  const handleOnCaptionUpdate = async (value: boolean) => {
    if (!clip.twitch_id) return;
    await updateAutoCaption({ twitch_id: clip.twitch_id, autoCation: value });
    if (isAutoCaptionError) return;

    setAutoCaption(value);
  };

  useEffect(() => {
    if (isLoading) return;
    if (autoCaption && !isSubbed) {
      handleOnCaptionUpdate(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSubbed, autoCaption]);

  if (isLoading || !data) return null;
  if (isError) return <NoStateFound />;

  return (
    <>
      <UpdateAccountModal modalOpen={upgradeShow} setModalOpen={setUpgradeShow} />
      <h1 className="mx-auto flex w-full justify-center text-4xl font-semibold text-violet md:mb-10">
        Approve Clip
      </h1>

      <div className="mx-auto grid h-screen md:grid-cols-2 lg:w-2/3">
        <div>
          <h1 className="mb-4 justify-center border-b border-b-grey-200/40 text-2xl font-semibold text-violet ">
            Clip Details
          </h1>

          {clip.uploaded && (
            <ErrorAlert
              description={<p>Unable to change settings as clip has already been uploaded</p>}
            />
          )}

          <ApproveForm
            clip={clip}
            userSettings={data.settings}
            cropType={cropType || (cropSettings?.[0]?.cropType as TCropType)}
            hasTemplates={hasTemplates}
            startTime={startTime}
            endTime={endTime}
            autoCaption={autoCaption}
          />
        </div>

        <div
          className={`row-start-1 flex flex-col md:col-start-2  ${
            !hasTemplates && !cropSettings && 'items-center justify-center'
          }`}
        >
          <div className="mx-auto w-full md:w-2/3 lg:-mt-6">
            {hasTemplates && cropSettings ? (
              <>
                <div className=" ">
                  <VideoPreview
                    clipURL={clip.download_url}
                    clipData={{
                      cropType: cropType || (data?.settings.cropType as TCropType),
                      camCrop: (cropSettings?.[0]?.camCrop as CropSettings | null) || undefined,
                      screenCrop: screenCrop!
                    }}
                    showTrimBar={true}
                    startTime={startTime}
                    endTime={endTime}
                    updateStartTime={(value: number) => setStartTime(value)}
                    updateEndTime={(value: number) => setEndTime(value)}
                  />
                </div>

                <Select
                  id="cropType"
                  label="Template"
                  defaultValue={cropType || data.settings.cropType || 'CAM_TOP'}
                  options={templates}
                  onUpdate={(_, value) => setCropType(value as NonNullable<TCropType>)}
                />
                <div className="mt-4 w-full">
                  <ToggleInput
                    id="autoCaption"
                    label="Add Auto Captions"
                    tooltipText="Auto generate captions that will appear at the bottom of the clip"
                    margin={false}
                    onUpdate={(_, value) => {
                      if (!isSubbed) {
                        setAutoCaption(false);
                        setUpgradeShow(true);
                      } else {
                        setAutoCaption(value);
                      }
                    }}
                    checked={autoCaption}
                  />
                </div>
              </>
            ) : (
              <div className="mt-6 flex w-full flex-col justify-between gap-4">
                <label className="mb-2 block border-b text-sm font-semibold text-violet md:text-lg">
                  Preview Unavailable!
                </label>

                <ErrorAlert
                  description={<p>You need to create a template before you can approve a clip</p>}
                />

                <Link href={'/settings/templates'}>
                  <SecondaryButton>Create Template</SecondaryButton>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default ApproveClips;

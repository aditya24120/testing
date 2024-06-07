import { CropTemplate } from '@prisma/client';
import React, { useState } from 'react';
import { AiOutlineFieldTime } from 'react-icons/ai';
import { Platforms, TCropType } from '../../types/types';
import NumberInput from './NumberInput';
import Select from './Select';
import TagInput from './TagInput';
import TextArea from './TextArea';
import ToggleInput from './ToggleInput';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { trpc } from '../../utils/trpc';
import { toast } from 'react-toastify';
import Link from 'next/link';
import InstagramSettings from './InstagramSettings';
import UpdateAccountModal from '../UpdateAccountModal';

const SELECT_LOOK_UP = {
  selectYoutube: 'youtube',
  selectTiktok: 'tiktok',
  selectInstagram: 'instagram',
  selectFacebook: 'facebook'
} as const;

export type ProviderLookUpMap = typeof SELECT_LOOK_UP;
export type SelectedLookUp = keyof typeof SELECT_LOOK_UP;
// type ProviderLookUp = ProviderLookUpMap[keyof ProviderLookUpMap];

export type Categories =
  | 'Film & Animation'
  | 'Autos & Vehicles'
  | 'Music'
  | 'Pets & Animals'
  | 'Sports'
  | 'Travel & Events'
  | 'Gaming'
  | 'People & Blogs'
  | 'Comedy'
  | 'Entertainment'
  | 'News & Politics'
  | 'Howto & Style'
  | 'Education'
  | 'Science & Technology'
  | 'Nonprofits & Activism';

type Props = {
  user: { isSubbed: boolean };
  settings: {
    id: string;
    minViewCount: number;
    defaultApprove: boolean;
    selectedPlatforms: ('tiktok' | 'youtube' | 'instagram' | 'facebook')[];
    cropTemplates: CropTemplate[];
    cropType?: TCropType;
    youtubeHashtags: string[];
    youtubeDescription: string;
    youtubePrivacy: 'public' | 'unlisted' | 'private';
    approveDate?: Date;
    uploadEnabled: boolean;
    youtubeCategory?: string;
    instagramHashtags: string[];
    autoCaption: boolean;
  };
  providers: ('tiktok' | 'youtube' | 'instagram')[];
};

const ScheduleForm = ({ settings, providers, user }: Props) => {
  const locale = navigator.language;
  const [upgradeShow, setUpgradeShow] = useState(false);
  const [formData, setFormData] = useState({
    minViewCount: settings.minViewCount,
    defaultApprove: settings.defaultApprove || false,
    selectedPlatforms: settings.selectedPlatforms || [],
    cropType: (settings.cropType as NonNullable<TCropType>) || null,
    youtubeHashtags: settings.youtubeHashtags || [],
    youtubeDescription: settings.youtubeDescription,
    youtubePrivacy: settings.youtubePrivacy,
    approveDate: settings.approveDate!,
    uploadEnabled: settings.uploadEnabled!,
    youtubeCategory: (settings.youtubeCategory || 'Gaming') as Categories,
    instagramHashtags: settings.instagramHashtags || [],
    autoCaption: settings.autoCaption
  });

  const hasTemplates = settings.cropTemplates.length > 0;

  const { mutateAsync: updateScheduleSettings, isLoading: isUpdatingScheduleSetting } =
    trpc.useMutation(['setting.updateScheduleSettings'], {
      onSuccess: () => {
        toast.success('Settings Updated');
      }
    });

  const templates = settings.cropTemplates
    ? settings.cropTemplates.map((template) => {
        return {
          value: template.cropType,
          label: template.cropType.split('_').join(' ').toLowerCase()
        };
      })
    : [];

  const handleOnUpdate = (fieldName: string, value: string | number | boolean | Date) => {
    if (
      ['selectYoutube', 'selectTiktok', 'selectInstagram', 'selectFacebook'].includes(fieldName)
    ) {
      const selectedPlatform = SELECT_LOOK_UP[fieldName as SelectedLookUp];
      if (value) {
        const platforms = [...formData.selectedPlatforms, selectedPlatform] as Platforms;
        setFormData({ ...formData, selectedPlatforms: [...platforms] });
      } else {
        const platforms = formData.selectedPlatforms.filter(
          (platform) => platform !== selectedPlatform
        );
        setFormData({
          ...formData,
          selectedPlatforms: [...platforms],
          uploadEnabled: platforms.length === 0 ? false : formData.uploadEnabled
        });
      }
    } else {
      setFormData({ ...formData, [fieldName]: value });
    }
  };

  const handleAddTag = (fieldName: string, value: string) => {
    if (!['instagramHashtags', 'youtubeHashtags'].includes(fieldName)) return;

    const formTags =
      fieldName === 'instagramHashtags' ? formData.instagramHashtags : formData.youtubeHashtags;
    const splitString = value.split(',').map((v) => v.trim().replaceAll('#', ''));
    if (formTags.includes(value)) return;
    const tags = [...formTags, ...splitString];
    setFormData({ ...formData, [fieldName]: [...tags] });
  };

  const handleDeleteTag = (fieldName: string, value: string) => {
    if (!['instagramHashtags', 'youtubeHashtags'].includes(fieldName)) return;
    const hashtags =
      fieldName === 'instagramHashtags' ? formData.instagramHashtags : formData.youtubeHashtags;

    const tags = hashtags.filter((tag) => tag !== value);
    setFormData({ ...formData, [fieldName]: [...tags] });
  };

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        await updateScheduleSettings({ id: settings.id, settings: formData });
      }}
    >
      <h1 className="mb-2 border-b border-b-grey-200/40 text-lg font-semibold text-violet md:text-2xl">
        General Settings
      </h1>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {hasTemplates ? (
          <Select
            id="cropType"
            label="Select template"
            defaultValue={settings.cropType}
            options={templates}
            onUpdate={(fieldName, value) => handleOnUpdate(fieldName, value)}
          />
        ) : (
          <div className="flex w-full flex-col justify-between ">
            <label className="mb-2 block text-sm font-medium text-violet md:text-lg">
              Change template
            </label>

            <span className="mr-3 text-sm font-medium text-rose-ERROR ">
              You need to create a template before being able to auto schedule clips
            </span>

            <Link href={'/settings/templates'}>
              <div className=" bg-border hover:bg-border/80 flex justify-center rounded-b-lg rounded-tl-lg px-6 py-1.5 font-bold text-black disabled:cursor-not-allowed disabled:opacity-50">
                Create a template
              </div>
            </Link>
          </div>
        )}

        <NumberInput
          id={'minViewCount'}
          label={'Min Views'}
          min={1}
          value={formData.minViewCount}
          onUpdate={(fieldName, value) => handleOnUpdate(fieldName, value)}
        />

        <div>
          <div className="w-full ">
            <label className="mb-2 block text-sm font-medium text-violet md:text-lg">
              Approve clips from
            </label>

            <div className="flex items-center gap-2">
              <AiOutlineFieldTime className="h-8 w-8 text-violet" />

              <DatePicker
                selected={new Date(formData.approveDate!)}
                onChange={(date) => {
                  handleOnUpdate('approveDate', date!);
                }}
                locale={locale}
                dateFormat="PPP"
                wrapperClassName="w-full"
                className="w-full rounded-lg border border-grey-200 bg-white p-2.5 text-sm text-violet outline-none focus:border-violet"
              />
            </div>
          </div>
        </div>
        <div />

        <div>
          <ToggleInput
            id="defaultApprove"
            label="Auto Approve"
            tooltipText="Auto approve your clips using the minimum count and date set above"
            onUpdate={(fieldName, value) => {
              handleOnUpdate(fieldName, value);
            }}
            checked={formData.defaultApprove}
            margin={false}
          />
        </div>
      </div>

      <h1 className="mb-2 mt-8 border-b border-b-grey-200/40 text-lg font-semibold text-violet md:text-2xl">
        Auto Scheduled Clips
      </h1>
      <div className="mb-20 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ToggleInput
          id="selectTiktok"
          label="Upload Tiktok"
          disabled={!providers.includes('tiktok')}
          onUpdate={(fieldName, value) => {
            handleOnUpdate(fieldName, value);
          }}
          checked={formData.selectedPlatforms?.includes('tiktok')}
          margin={false}
        />

        {!providers.includes('tiktok') ? (
          <div className="flex flex-col">
            <Link href={'/settings/'}>
              <a className="flex cursor-pointer items-center justify-center rounded-b-lg rounded-tl-lg border-2 border-violet px-6 py-1 font-bold text-violet hover:bg-grey-200/10 disabled:cursor-not-allowed disabled:opacity-50">
                Connect
              </a>
            </Link>
          </div>
        ) : (
          <div></div>
        )}

        <ToggleInput
          id="selectYoutube"
          label="Upload Youtube"
          disabled={!providers.includes('youtube')}
          onUpdate={(fieldName, value) => {
            handleOnUpdate(fieldName, value);
          }}
          checked={formData.selectedPlatforms?.includes('youtube')}
          margin={false}
        />

        {!providers.includes('youtube') ? (
          <div className="flex flex-col">
            <Link href={'/settings/'}>
              <a className="flex cursor-pointer items-center justify-center rounded-b-lg rounded-tl-lg border-2 border-violet px-6 py-1 font-bold text-violet hover:bg-grey-200/10 disabled:cursor-not-allowed disabled:opacity-50">
                Connect
              </a>
            </Link>
          </div>
        ) : (
          <div></div>
        )}

        <ToggleInput
          id="selectInstagram"
          label="Upload Instagram"
          disabled={!providers.includes('instagram')}
          onUpdate={(fieldName, value) => {
            handleOnUpdate(fieldName, value);
          }}
          checked={formData.selectedPlatforms?.includes('instagram')}
          margin={false}
        />

        {providers.includes('instagram') ? (
          <div className="flex flex-col">
            <Link href={'/settings/'}>
              <a className="flex cursor-pointer items-center justify-center rounded-b-lg rounded-tl-lg border-2 border-violet px-6 py-1 font-bold text-violet hover:bg-grey-200/10 disabled:cursor-not-allowed disabled:opacity-50">
                Connect
              </a>
            </Link>
          </div>
        ) : (
          <div className="mx-auto mt-2 flex w-full items-center justify-start">
            <span className="text-md text-violet-300">Coming soon!</span>
          </div>
        )}

        <ToggleInput
          id="selectFacebook"
          label="Upload Facebook"
          disabled={!providers.includes('instagram')}
          onUpdate={(fieldName, value) => {
            handleOnUpdate(fieldName, value);
          }}
          checked={formData.selectedPlatforms?.includes('facebook')}
          margin={false}
        />

        {providers.includes('instagram') ? (
          <div className="flex flex-col">
            <Link href={'/settings/'}>
              <a className="flex cursor-pointer items-center justify-center rounded-b-lg rounded-tl-lg border-2 border-violet px-6 py-1 font-bold text-violet hover:bg-grey-200/10 disabled:cursor-not-allowed disabled:opacity-50">
                Connect
              </a>
            </Link>
          </div>
        ) : (
          <div className="mx-auto mt-2 flex w-full items-center justify-start">
            <span className="text-md text-violet-300">Coming soon!</span>
          </div>
        )}

        <div className="col-span-1">
          <ToggleInput
            id="uploadEnabled"
            label="Auto Schedule"
            tooltipText="Using your selected crop template and approved clips. Auto upload your clips to selected platforms on your scheduled days and time."
            disabled={
              user.isSubbed
                ? formData.selectedPlatforms.length === 0 || !formData.cropType || !hasTemplates
                : false
            }
            onUpdate={(fieldName, value) => {
              if (!user.isSubbed) {
                setUpgradeShow(true);
              } else {
                handleOnUpdate(fieldName, value);
              }
            }}
            checked={formData.uploadEnabled}
            margin={false}
          />

          {formData.selectedPlatforms.length === 0 && (
            <div className="mb-2 mr-3 text-sm font-medium text-rose-ERROR">
              Please select a platform to upload to
            </div>
          )}

          {(!formData.cropType || !hasTemplates) && (
            <div className="mb-2 mr-3 text-sm font-medium text-rose-ERROR">
              Please select a crop template
            </div>
          )}
        </div>

        <div />

        <div className="col-span-1">
          <ToggleInput
            id="autoCaption"
            label="Add Auto Captions"
            tooltipText="Auto generate captions that will appear at the bottom of the clip"
            onUpdate={(fieldName, value) => {
              if (!user.isSubbed) {
                handleOnUpdate(fieldName, false);
                setUpgradeShow(true);
              } else {
                handleOnUpdate(fieldName, value);
              }
            }}
            checked={formData.autoCaption}
            margin={false}
          />
        </div>
      </div>

      {formData.selectedPlatforms.includes('youtube') && (
        <div className="mb-6 flex flex-col gap-4">
          <h1 className="mb-2 border-b border-b-grey-200/40 text-lg font-semibold text-violet md:text-2xl">
            YouTube Settings
          </h1>

          <TagInput
            id="youtubeHashtags"
            label="Hashtags"
            onUpdate={(fieldName, value) => handleAddTag(fieldName, value)}
            onDelete={handleDeleteTag}
            placeholder={'clipbot, epic, upload!'}
            list={formData.youtubeHashtags}
          />

          <Select
            id="youtubeCategory"
            label="Category"
            defaultValue={settings.youtubeCategory || 'Gaming'}
            options={[
              { value: 'Film & Animation', label: 'Film & Animation' },
              { value: 'Autos & Vehicles', label: 'Autos & Vehicles' },
              { value: 'Music', label: 'Music' },
              { value: 'Pets & Animals', label: 'Pets & Animals' },
              { value: 'Sports', label: 'Sports' },
              { value: 'Travel & Events', label: 'Travel & Events' },
              { value: 'Gaming', label: 'Gaming' },
              { value: 'People & Blogs', label: 'People & Blogs' },
              { value: 'Comedy', label: 'Comedy' },
              { value: 'Entertainment', label: 'Entertainment' },
              { value: 'News & Politics', label: 'News & Politics' },
              { value: 'Howto & Style', label: 'Howto & Style' },
              { value: 'Education', label: 'Education' },
              { value: 'Science & Technology', label: 'Science & Technology' },
              { value: 'Nonprofits & Activism', label: 'Nonprofits & Activism' }
            ]}
            onUpdate={(fieldName, value) => handleOnUpdate(fieldName, value)}
          />

          <Select
            id="youtubePrivacy"
            label="Privacy "
            defaultValue={settings.youtubePrivacy}
            options={[
              { value: 'public', label: 'Public' },
              { value: 'unlisted', label: 'Unlisted' },
              { value: 'private', label: 'Private' }
            ]}
            onUpdate={(fieldName, value) => handleOnUpdate(fieldName, value)}
          />

          <TextArea
            id="youtubeDescription"
            label="Description"
            rows={8}
            value={formData.youtubeDescription}
            onUpdate={(fieldName, value) => handleOnUpdate(fieldName, value)}
            placeholder={'Tell viewers all about your video'}
          />
        </div>
      )}

      {formData.selectedPlatforms.includes('instagram') && (
        <InstagramSettings
          handleAddTag={(fieldName, value) => handleAddTag(fieldName, value)}
          handleDeleteTag={handleDeleteTag}
          defaultList={formData.instagramHashtags}
        />
      )}

      <div className="flex justify-end">
        <button
          type="submit"
          className="inline-block rounded-b-lg rounded-tl-lg bg-violet px-6 py-1.5 font-bold text-white transition-transform active:scale-105 hover:enabled:bg-violet-600 disabled:cursor-not-allowed disabled:opacity-50 "
          disabled={isUpdatingScheduleSetting}
        >
          Save
        </button>
      </div>

      <UpdateAccountModal modalOpen={upgradeShow} setModalOpen={setUpgradeShow} />
    </form>
  );
};

export default ScheduleForm;

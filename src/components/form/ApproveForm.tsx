import { Setting } from '@prisma/client';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { updateTwitchClipApprove } from '../../schema/uploadClip.schema';
import { ClipWithYoutube, TCropType } from '../../types/types';
import { trpc } from '../../utils/trpc';
import { FacebookSettings } from './FacebookSettings';
import FormTextInput from './FormTextInput';
import InstagramSettings from './InstagramSettings';
import { Categories } from './ScheduleForm';
import Select from './Select';
import TagInput from './TagInput';
import TextArea from './TextArea';
import SecondaryButton from '../common/SecondaryButton';
import PrimaryButton from '../common/PrimaryButton';

type Props = {
  clip: ClipWithYoutube;
  userSettings: Setting;
  cropType: TCropType;
  hasTemplates: boolean;
  startTime?: number;
  endTime?: number;
  autoCaption: boolean;
};

const ApproveForm = ({
  clip,
  userSettings,
  cropType,
  hasTemplates,
  startTime,
  endTime,
  autoCaption
}: Props) => {
  const {
    mutateAsync: upsertTwtichClip,
    isError,
    isLoading
  } = trpc.useMutation(['clip.approveTwitchClip'], {
    onSuccess: () => {
      toast.success('Clip Updated', { autoClose: 1000 });
    }
  });

  const [formData, setFormData] = useState<updateTwitchClipApprove>({
    cropType: cropType ? cropType : (userSettings?.cropType as NonNullable<TCropType>),
    youtubeHashtags: clip?.youtubeHashtags || userSettings?.youtubeHashtags || [],
    youtubeDescription: clip.youtubeDescription || userSettings?.youtubeDescription,
    youtubePrivacy: userSettings?.youtubePrivacy as 'private' | 'unlisted' | 'public',
    youtubeCategory: (userSettings?.youtubeCategory || 'Gaming') as Categories,
    youtubeTitle: clip.youtubeTitle || clip.title,
    instagramHashtags:
      clip?.instagramHashtags && clip?.instagramHashtags?.length !== 0
        ? clip?.instagramHashtags
        : userSettings?.instagramHashtags || [],
    caption: clip?.caption || clip.title || '',
    facebookDescription: clip?.facebookDescription || clip.title,
    startTime: startTime,
    endTime: endTime,
    autoCaption
  });

  useEffect(() => {
    if (cropType) {
      setFormData({ ...formData, cropType });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cropType]);

  useEffect(() => {
    if (startTime === undefined && endTime === undefined) return;
    setFormData({ ...formData, startTime, endTime });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startTime, endTime]);

  useEffect(() => {
    setFormData({ ...formData, autoCaption });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoCaption]);

  const handleOnUpdate = (fieldName: string, value: string | number | Date) => {
    setFormData({ ...formData, [fieldName]: value });
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

  const handleFormSubmit = async () => {
    await upsertTwtichClip({ clip, approveData: formData });
    if (isError) {
      console.log('failed to update clip');
    }
  };

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        await handleFormSubmit();
      }}
    >
      <div className="mb-10 grid grid-cols-1 gap-6">
        <FormTextInput
          id="youtubeTitle"
          label="Title"
          initialValue={formData.youtubeTitle}
          placeholder={formData.youtubeTitle}
          onUpdate={(fieldName, value) => handleOnUpdate(fieldName, value)}
        />
      </div>

      <div className="mb-6 flex flex-col gap-4">
        <h1 className="mb-2 border-b border-b-grey-200/40 text-lg font-semibold text-violet md:text-2xl">
          YouTube Settings
        </h1>
        <TagInput
          id="youtubeHashtags"
          label="Hashtags"
          onUpdate={(fieldName, value) => handleAddTag(fieldName, value)}
          onDelete={handleDeleteTag}
          placeholder={'hashtags'}
          list={formData.youtubeHashtags!}
        />

        <Select
          id="youtubeCategory"
          label="Category"
          defaultValue={userSettings?.youtubeCategory || 'Gaming'}
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
          defaultValue={userSettings?.youtubePrivacy}
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
          value={formData?.youtubeDescription || ''}
          onUpdate={(fieldName, value) => handleOnUpdate(fieldName, value)}
          placeholder={'Tell viewers all about your video'}
        />
      </div>

      <InstagramSettings
        handleAddTag={(fieldName, value) => handleAddTag(fieldName, value)}
        handleDeleteTag={handleDeleteTag}
        defaultList={formData.instagramHashtags}
        captionInput={true}
        handleOnUpdate={handleOnUpdate}
        instagramCaption={formData.caption}
      />

      <FacebookSettings
        description={formData.facebookDescription}
        handleOnUpdate={handleOnUpdate}
      />

      <div className=" flex justify-end gap-2 md:mb-8">
        <Link href={'/clips'} passHref>
          <SecondaryButton>Cancel</SecondaryButton>
        </Link>

        <PrimaryButton type="submit" disabled={isLoading || clip.uploaded || !hasTemplates}>
          {isLoading ? 'Approving...' : 'Approve'}
        </PrimaryButton>
      </div>
    </form>
  );
};

export default ApproveForm;

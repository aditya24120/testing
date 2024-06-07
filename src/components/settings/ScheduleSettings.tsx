import React from 'react';
import { trpc } from '../../utils/trpc';
import ScheduleCalendar from './ScheduleCalendar';
import ScheduleForm, { Categories } from '../form/ScheduleForm';
import { TCropType } from '../../types/types';
import { signOut, useSession } from 'next-auth/react';
import ErrorAlert from '../alert/ErrorAlert';

type Days = 'sun' | 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat';

type Providers = ('tiktok' | 'youtube' | 'instagram')[];

const ScheduleSettings = () => {
  const { data: session } = useSession();
  const user = session?.user;
  const { data, isLoading, isError } = trpc.useQuery(['user.getAccountsAndSettings'], {
    onError(err) {
      if (err.data?.code === 'UNAUTHORIZED') {
        signOut();
        return;
      }
    }
  });
  const days = data?.scheduledDays as { [key in Days]: string[] };
  const isSubbed = user?.userId === data?.user?.id && data?.user?.sub_status === 'active';

  if (isLoading) return null;

  if (isError && !data) {
    return (
      <div className="mx-auto flex max-w-lg justify-center">
        <ErrorAlert
          title="Error"
          description={
            <p className="text-sm">
              If this happens, please report a bug or contact support on discord.
            </p>
          }
        />
      </div>
    );
  }

  return (
    <>
      <h1 className="mb-2 mt-8 border-b border-b-grey-200/40 text-lg font-semibold text-violet md:text-2xl">
        Schedule
      </h1>
      <ScheduleCalendar days={days} />

      <div className="mt-8">
        <ScheduleForm
          user={{ isSubbed }}
          settings={{
            id: data?.settings.id!,
            minViewCount: data?.settings.minViewCount!,
            defaultApprove: data?.settings.defaultApprove!,
            selectedPlatforms: data?.settings.selectedPlatforms as ('tiktok' | 'youtube')[],
            cropTemplates: data?.cropTemplate || [],
            cropType: (data?.settings.cropType as TCropType) || undefined,
            youtubeHashtags: data?.settings.youtubeHashtags || [],
            youtubeDescription: data?.settings.youtubeDescription || '',
            youtubePrivacy: data?.settings.youtubePrivacy as 'public' | 'unlisted' | 'private',
            approveDate: data?.settings.approveDate || data?.user.createdAt!,
            uploadEnabled: data?.settings.uploadEnabled!,
            youtubeCategory: (data?.settings.youtubeCategory || 'Gaming') as Categories,
            instagramHashtags: data?.settings.instagramHashtags || [],
            autoCaption: data?.settings.autoCaption || false
          }}
          providers={data?.accounts.filter((acc) => acc !== 'twitch') as Providers}
        />
      </div>
    </>
  );
};

export default ScheduleSettings;

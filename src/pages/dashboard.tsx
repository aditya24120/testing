import React from 'react';
import Link from 'next/link';
import type { NextPage } from 'next';
import * as Sentry from '@sentry/nextjs';

import { ImSad } from 'react-icons/im';
import UserLayout from '../components/UserLayout';
import { FiVideo } from 'react-icons/fi';
import { signOut, useSession } from 'next-auth/react';
import { AiOutlineSchedule, AiOutlineVideoCamera } from 'react-icons/ai';
import ClipsListItem from '../components/clips/ClipsListItem';

import { trpc } from '../utils/trpc';
import { useRouter } from 'next/router';
import SkeletonLoader from '../components/dashboard/SkeletonLoader';
import ApprovedClipItem from '../components/clips/ApprovedClipItem';
import { UserSettings } from '../types/types';

const Dashboard: NextPage = () => {
  const router = useRouter();
  const { status, data } = useSession({
    required: true,
    onUnauthenticated() {
      router.push('/');
    }
  });

  React.useEffect(() => {
    if (data?.user?.userId) {
      Sentry.setUser({ id: data.user.userId, email: data.user.email ?? undefined });
    }
  }, [data?.user?.userId, data?.user?.email]);

  const {
    data: scheduledClipsList,
    isLoading,
    refetch: refetchScheduledClips
  } = trpc.useQuery(['clip.scheduledClips']);

  const { data: uploadedClip, isLoading: uploadClipIsLoading } = trpc.useQuery(
    ['clip.uploadedClips'],
    {
      onError: (error) => {
        console.log('error me: ', error.data?.code);
        if (error.data?.code === 'UNAUTHORIZED') {
          router.push('/');
        }
      }
    }
  );

  const {
    data: approvedClips,
    isLoading: apporovedClipsIsLoading,
    refetch: refetchApproved
  } = trpc.useQuery(['clip.approvedClips']);

  const { data: UserAccountWithSettings, isLoading: isLoadingUserAccounts } = trpc.useQuery(
    ['user.getAccountsAndSettings'],
    {
      onError(err) {
        if (err.data?.code === 'UNAUTHORIZED') {
          signOut();
          return;
        }
      }
    }
  );

  const { mutateAsync: deleteClip, error: deleteError } = trpc.useMutation(
    ['uploadClip.cancelScheduledClip'],
    {
      onSuccess: () => {
        refetchScheduledClips();
      }
    }
  );

  const { mutateAsync: updateClip } = trpc.useMutation(['clip.unapproveById'], {
    onSuccess: () => {
      refetchApproved();
    }
  });

  const unapproveClip = async (id: string) => {
    await updateClip(id);
  };

  const handleCancelScheduledClip = async (videoId: string, twitch_id: string) => {
    console.log('cancel clip');
    deleteClip({ videoId, twitch_id });
    if (deleteError) return;
  };

  if (status === 'loading') {
    return (
      <UserLayout>
        <></>
      </UserLayout>
    );
  }

  if (isLoading || uploadClipIsLoading || apporovedClipsIsLoading || isLoadingUserAccounts) {
    return (
      <UserLayout>
        <SkeletonLoader />
      </UserLayout>
    );
  }

  return (
    <UserLayout>
      <div className="flex items-center justify-between md:flex-row">
        <h2 className="text-xl font-semibold text-violet md:text-4xl">Dashboard</h2>

        <Link href="/clips">
          <a
            className={`flex items-center rounded-b-lg rounded-tl-lg bg-violet px-6 py-1.5 font-bold text-white hover:bg-violet-600`}
          >
            <FiVideo className="h-6 w-6" />
            <span className="mx-2 text-sm font-medium md:mx-4 md:text-xl">Upload</span>
          </a>
        </Link>
      </div>

      <section className="grid-col-1 mt-4 grid gap-12 md:mt-10 md:grid-cols-2 ">
        <div className=" border-border flex flex-col  gap-4 rounded-md border px-4 py-4">
          <h2 className="flex items-center gap-2 text-2xl font-medium text-violet">
            <AiOutlineSchedule className="h-6 w-6 fill-violet" /> Scheduled Clips
          </h2>

          {scheduledClipsList && scheduledClipsList.length > 0 ? (
            scheduledClipsList.map((clip) => (
              <ClipsListItem
                key={clip.id}
                clip={clip}
                scheduled={true}
                cancelScheduledClip={handleCancelScheduledClip}
              />
            ))
          ) : (
            <div className="mt-6 flex flex-col items-center justify-center gap-4">
              <ImSad className="h-20 w-20 fill-violet text-violet" />
              <p className="font-semibold text-violet">No scheduled clips found</p>

              <Link href="/clips">
                <a className="flex items-center rounded-b-lg rounded-tl-lg bg-violet px-6 py-1.5 font-bold text-white hover:bg-violet-600">
                  <AiOutlineSchedule className="h-6 w-6" />
                  <span className="mx-4 text-xl font-medium">Schedule clip</span>
                </a>
              </Link>
            </div>
          )}
        </div>
        <div className="border-border flex flex-col  gap-4 rounded-md border px-4 py-4">
          <h2 className="flex items-center gap-2 text-2xl font-medium text-violet">
            <AiOutlineVideoCamera className="h-6 w-6 fill-violet" /> Uploaded Clips
          </h2>

          {uploadedClip && uploadedClip.length > 0 ? (
            uploadedClip.map((clip) => <ClipsListItem key={clip.id} clip={clip} />)
          ) : (
            <div className="mt-6 flex flex-col items-center justify-center gap-4">
              <ImSad className="h-20 w-20 fill-violet text-violet" />
              <p className="font-semibold text-violet">No uploaded clips found</p>

              <Link href="/clips">
                <a className="flex items-center rounded-b-lg rounded-tl-lg bg-violet px-6 py-1.5 font-bold text-white hover:bg-violet-600">
                  <FiVideo className="h-6 w-6 fill-violet" />
                  <span className="mx-4 text-xl font-medium">Upload clip</span>
                </a>
              </Link>
            </div>
          )}
        </div>

        {approvedClips && approvedClips.length > 0 && (
          <div className="border-border flex flex-col  gap-4 rounded-md border p-4">
            <h2 className="flex items-center gap-2 text-2xl font-medium text-violet">
              <AiOutlineSchedule className="h-6 w-6 fill-violet" /> Approved Clips
            </h2>

            {approvedClips.map((clip) => (
              <ApprovedClipItem
                key={clip.id}
                clip={clip}
                settings={UserAccountWithSettings?.settings! as UserSettings}
                cropTemplates={UserAccountWithSettings?.cropTemplate}
                handleUpdate={unapproveClip}
              />
            ))}
          </div>
        )}
      </section>
    </UserLayout>
  );
};

export default Dashboard;

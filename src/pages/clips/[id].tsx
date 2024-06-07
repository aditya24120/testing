import { useState, useContext } from 'react';
import type { NextPage } from 'next';
import { useRouter } from 'next/router';
import UserLayout from '../../components/UserLayout';
import Crop from '../../components/crop/Crop';
import { toast } from 'react-toastify';
import { useSession } from 'next-auth/react';
import { ClipContext, UserContextState } from '../../context/ClipContext';
import { trpc } from '../../utils/trpc';

const Clip: NextPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const clipId = Array.isArray(id) ? id[0] : id!;
  const { data: userSession, status } = useSession({
    required: true,
    onUnauthenticated() {
      router.push('/');
    }
  });
  const { setCurrentClip } = useContext(ClipContext) as UserContextState;

  const {
    data,
    error: clipError,
    isLoading,
    isFetching
  } = trpc.useQuery(['clip.getClipById', clipId], {
    enabled: Boolean(clipId),
    onSuccess: (data) => {
      if (data) {
        setCurrentClip(data);
      }
    }
  });

  if (clipError) {
    toast.error('Unable to find clip with that ID');
    router.push('/clips');
    return null;
  }

  if (isLoading) {
    return (
      <UserLayout>
        <div> Loading...</div>
      </UserLayout>
    );
  }

  return (
    <UserLayout>
      <div className="flex flex-col justify-center ">{data && <Crop clip={data} />}</div>
    </UserLayout>
  );
};
export default Clip;

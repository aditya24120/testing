import type { NextPage } from 'next';
import { useRouter } from 'next/router';
import UserLayout from '../../../components/UserLayout';
import { toast } from 'react-toastify';
import { useSession } from 'next-auth/react';
import { trpc } from '../../../utils/trpc';
import ApproveClip from '../../../components/clips/ApproveClips';

const ClipApprove: NextPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const clipId = Array.isArray(id) ? id[0] : id!;
  const { data: userSession, status } = useSession({
    required: true,
    onUnauthenticated() {
      router.push('/');
    }
  });

  const {
    data,
    error: clipError,
    isLoading
  } = trpc.useQuery(['clip.getClipById', clipId], {
    enabled: Boolean(clipId)
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

  return <UserLayout>{data && <ApproveClip clip={data} />}</UserLayout>;
};
export default ClipApprove;

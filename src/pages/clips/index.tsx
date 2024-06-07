import UserLayout from '../../components/UserLayout';
import ClipUrl from '../../components/clips/ClipUrl';
import { NextPage } from 'next';
import UsersClips from '../../components/clips/UsersClips';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
const Clips: NextPage = () => {
  const router = useRouter();
  const { data: userSession, status } = useSession({
    required: true,
    onUnauthenticated() {
      router.push('/');
    }
  });
  return (
    <UserLayout>
      <h1 className="mb-2 text-xl font-bold text-violet md:text-2xl">Get Clip by URL</h1>
      <div className="mb-6 md:w-1/2">
        <ClipUrl />
      </div>

      <UsersClips />
    </UserLayout>
  );
};
export default Clips;

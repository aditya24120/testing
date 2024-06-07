import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import Connections from '../../components/settings/Connections';
import SettingsLayout from '../../components/settings/SettingsLayout';
import UserLayout from '../../components/UserLayout';

const ConnectionsPage = () => {
  const router = useRouter();
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      router.push('/clips');
    },
  });
  return (
    <UserLayout>
      <SettingsLayout>
        <Connections />
      </SettingsLayout>
    </UserLayout>
  );
};
export default ConnectionsPage;

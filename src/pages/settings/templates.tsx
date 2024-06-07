import SettingsLayout from '../../components/settings/SettingsLayout';
import Templates from '../../components/settings/Templates';
import UserLayout from '../../components/UserLayout';

const TemplatesPage = () => {
  return (
    <UserLayout>
      <SettingsLayout>
        <Templates />
      </SettingsLayout>
    </UserLayout>
  );
};
export default TemplatesPage;

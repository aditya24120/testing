import ScheduleSettings from '../../components/settings/ScheduleSettings';
import SettingsLayout from '../../components/settings/SettingsLayout';
import UserLayout from '../../components/UserLayout';

const SchedulingPage = () => {
  return (
    <UserLayout>
      <SettingsLayout>
        <ScheduleSettings />
      </SettingsLayout>
    </UserLayout>
  );
};
export default SchedulingPage;

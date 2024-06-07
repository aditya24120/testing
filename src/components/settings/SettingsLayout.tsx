import Navbar from './Navbar';

const SettingsLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="m-auto flex flex-col items-center md:w-4/5">
      <Navbar />

      <main className="w-full">{children}</main>
    </div>
  );
};
export default SettingsLayout;

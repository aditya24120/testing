import Sidebar from './sidebar/Sidebar';
import BlurImage from '../../public/assets/images/BlurImage.png';

const UserLayout = ({
  children,
  bgImage = false
}: {
  children: React.ReactNode;
  bgImage?: boolean;
}) => {
  return (
    <div
      className="from-primary via-primary bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] to-black/90 bg-cover bg-no-repeat text-white md:flex"
      style={{
        backgroundImage: bgImage ? `url(${BlurImage.src})` : ``
      }}
    >
      <Sidebar />
      <div className="h-screen w-full overflow-auto p-2 md:ml-52 md:p-10 lg:ml-64">
        <main className="">{children}</main>
      </div>
    </div>
  );
};
export default UserLayout;

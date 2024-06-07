import Link from 'next/link';
import { useRouter } from 'next/router';

const navItems = [
  {
    label: 'Connections',
    state: 'connections',
    href: '/settings',
    mobile: true
  },
  {
    label: 'Templates',
    state: 'templates',
    href: '/settings/templates',
    mobile: true
  },
  {
    label: 'Scheduling',
    state: 'scheduling',
    href: '/settings/scheduling',
    mobile: true
  },
  {
    label: 'Dashboard',
    state: 'dashboard',
    href: '/dashboard',
    mobile: false
  }
];
const Navbar = () => {
  const router = useRouter();
  const currentRoute = router.pathname;

  return (
    <div className="mb-2 mt-2 flex w-full items-center rounded-md text-xs font-semibold uppercase text-violet-300 md:mb-4 md:mt-6 md:w-11/12 md:text-base">
      {navItems.map((item) => (
        <Link key={item.state} href={item.href} target="_blank" rel="noreferrer">
          <a
            className={`w-1/3 border-b-4 text-center tracking-widest last:hidden hover:text-violet md:w-1/4 md:last:block ${
              currentRoute === item.href ? 'border-violet font-bold text-violet' : 'border-grey-100'
            }`}
          >
            {item.label}
          </a>
        </Link>
      ))}
    </div>
  );
};
export default Navbar;

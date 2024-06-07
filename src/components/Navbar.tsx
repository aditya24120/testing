import Link from 'next/link';
import Image from 'next/image';
import { Fragment, useState } from 'react';
import { HiChevronDown } from 'react-icons/hi';
import { FaDiscord, FaUser } from 'react-icons/fa';
import textLogo from '../../public/assets/images/text-logo.png';
import { Menu, Transition } from '@headlessui/react';
import { useSession, signIn, signOut } from 'next-auth/react';
import { useRouter } from 'next/router';
import { NavItems } from './sidebar/Sidebar';
import { FiHome, FiLogIn, FiLogOut, FiSettings, FiVideo } from 'react-icons/fi';

type NavItemWithAuth = NavItems & {
  isAuth: boolean;
};

const menuItems: NavItemWithAuth[] = [
  {
    label: 'Dashboard',
    icon: FiHome,
    href: '/dashboard',
    position: 'top',
    isAuth: true
  },
  {
    label: 'Clips',
    icon: FiVideo,
    href: '/clips',
    position: 'top',
    isAuth: true
  },

  {
    label: 'Settings',
    icon: FiSettings,
    href: '/settings',
    position: 'bottom',
    isAuth: true
  },
  {
    label: 'Logout',
    icon: FiLogOut,
    onClick: () => signOut(),
    position: 'bottom',
    isAuth: true
  },
  {
    label: 'Login',
    icon: FiLogIn,
    position: 'bottom',
    onClick: (e) => {
      if (e) {
        e.preventDefault();
      }
      signIn('twitch', { callbackUrl: `/clips` });
    },
    isAuth: false
  }
];

export default function Navbar() {
  const router = useRouter();
  const { data: session } = useSession();
  const user = session?.user;
  const [toggle, setToggle] = useState<boolean>(false);

  const isPathActive = (path: string) => {
    return router.asPath == path;
  };

  return (
    <nav className="container relative mx-auto px-4 text-sm md:p-0">
      {/* Flex Container For Nav Items */}
      <div className="flex items-center justify-between space-x-16">
        {/* Logo  */}
        <Link href={'/'} passHref>
          <div className="z-30 flex w-40 items-center justify-center hover:cursor-pointer">
            <Image src={textLogo} alt="Clipbot" id="logo" />
          </div>
        </Link>

        {/* Menu Items */}
        <div className="hidden items-center space-x-8 font-bold uppercase text-violet-300 md:flex [&>*]:cursor-pointer">
          <Link href={'/#features'}>
            <span
              className={`tracking-widest hover:text-violet ${
                isPathActive('/#features') ? 'text-violet' : ''
              }`}
            >
              Features
            </span>
          </Link>

          <Link href={'/#solution'}>
            <span
              className={`tracking-widest hover:text-violet  ${
                isPathActive('/#solution') ? 'text-violet' : ''
              }`}
            >
              Solution
            </span>
          </Link>

          <Link href={'/#pricing'}>
            <span
              className={`tracking-widest hover:text-violet ${
                isPathActive('/#pricing') ? 'text-violet' : ''
              }`}
            >
              Pricing
            </span>
          </Link>

          <Link href={'/#faq'}>
            <span
              className={`tracking-widest hover:text-violet ${
                router.asPath === '/#faq' && 'text-violet'
              }`}
            >
              faq
            </span>
          </Link>

          <a href="https://discord.gg/FZscDWnhau" target="_blank" rel="noreferrer">
            <span className="hover:text-border tracking-widest">Discord</span>
          </a>

          {user ? (
            <Menu as="div" className="relative z-50 ">
              <Menu.Button className="group flex items-center space-x-px">
                <div className="relative flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-solid border-violet-200 group-hover:border-violet-500 group-hover:text-violet-500">
                  {user?.image ? (
                    <Image src={user?.image} alt={user?.name || 'Avatar'} layout="fill" />
                  ) : (
                    <FaUser className="violet-200 h-5 w-5" />
                  )}
                </div>

                <HiChevronDown className="react-icon accent-200 h-5 w-5 shrink-0 group-hover:text-violet-500" />
              </Menu.Button>

              <Transition
                as={Fragment}
                enter="transition ease-out duration-100"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Menu.Items className="divide-primary absolute right-0 mt-1 w-72 origin-top-right divide-y overflow-hidden rounded-md bg-white normal-case text-violet shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                  <div className="mb-2 flex items-center space-x-2 px-4 py-4">
                    <div className="relative flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gray-200">
                      {user?.image ? (
                        <Image src={user?.image} alt={user?.name || 'Avatar'} layout="fill" />
                      ) : (
                        <FaUser className="h-6 w-6 text-gray-400" />
                      )}
                    </div>
                    <div className="flex flex-col truncate">
                      {' '}
                      <span>{user?.name}</span>
                    </div>
                  </div>

                  <div className="py-2">
                    {menuItems
                      .filter((item) => item.isAuth)
                      .map(({ label, href, onClick, icon: Icon }) => (
                        <div
                          key={label}
                          className="px-2 last:mt-2 last:border-t last:border-violet-100 last:pt-2"
                        >
                          <Menu.Item>
                            {href ? (
                              <Link href={href}>
                                <a className="flex items-center space-x-2 rounded-md px-4 py-2 hover:bg-violet hover:text-white">
                                  <Icon className="h-5 w-5 shrink-0 text-slate-200" />
                                  <span>{label}</span>
                                </a>
                              </Link>
                            ) : (
                              <button
                                className="flex w-full items-center space-x-2 rounded-md px-4 py-2 hover:bg-violet hover:text-white"
                                onClick={() => {
                                  if (onClick) {
                                    onClick();
                                  }
                                }}
                              >
                                <Icon className="h-5 w-5 shrink-0 text-slate-200" />
                                <span>{label}</span>
                              </button>
                            )}
                          </Menu.Item>
                        </div>
                      ))}
                  </div>
                </Menu.Items>
              </Transition>
            </Menu>
          ) : (
            <a
              href={`/api/auth/signin/twitch`}
              onClick={(e) => {
                e.preventDefault();
                signIn('twitch', { callbackUrl: `/clips` });
              }}
              className="rounded-lg border-2 border-violet bg-violet px-8 py-2 capitalize text-white shadow-md transition duration-75 ease-in-out hover:scale-105 hover:border-violet-600 hover:bg-violet-600 active:scale-90"
            >
              Login
            </a>
          )}
        </div>

        {/* Hamburger Button */}
        <button
          id="menu-btn"
          className={`hamburger z-30 block focus:outline-none md:hidden ${toggle && 'open'}`}
          onClick={() => setToggle(!toggle)}
        >
          <span className="hamburger-top"></span>
          <span className="hamburger-middle"></span>
          <span className="hamburger-bottom"></span>
        </button>
      </div>

      {/* mobile menu */}
      {toggle && (
        <div
          id="menu"
          className="fixed inset-0 z-20 h-full w-full items-center divide-y divide-white self-end px-6 py-1 pb-4 pt-16 uppercase tracking-widest text-white"
        >
          {/* logged in */}
          {user &&
            menuItems
              .filter((item) => item.isAuth)
              .map(({ label, icon: Icon, onClick, href }) => (
                <div key={label}>
                  {href ? (
                    <Link href={href}>
                      <a
                        className={`flex items-center justify-center rounded-md bg-violet px-4 py-3`}
                      >
                        <Icon className="h-6 w-6" />
                        <span className="mx-4 font-semibold">{label}</span>
                      </a>
                    </Link>
                  ) : (
                    <div
                      className={`flex items-center justify-center rounded-md bg-violet px-4 py-3`}
                      onClick={() => {
                        setToggle(false);
                        if (onClick) {
                          onClick();
                        }
                      }}
                    >
                      <Icon className="h-6 w-6" />
                      <span className="mx-4 font-semibold">{label}</span>
                    </div>
                  )}
                </div>
              ))}

          {/* not logged in */}
          {!user &&
            menuItems
              .filter((item) => !item.isAuth)
              .map(({ label, icon: Icon, onClick, href }) => (
                <div key={label}>
                  {href ? (
                    <Link href={href}>
                      <a
                        className={`flex items-center justify-center rounded-md bg-violet px-4 py-3`}
                      >
                        <Icon className="h-6 w-6" />
                        <span className="mx-4 font-semibold">{label}</span>
                      </a>
                    </Link>
                  ) : (
                    <div
                      className={`flex items-center justify-center rounded-md bg-violet px-4 py-3`}
                      onClick={() => {
                        setToggle(false);
                        if (onClick) {
                          onClick();
                        }
                      }}
                    >
                      <Icon className="h-6 w-6" />
                      <span className="mx-4 font-semibold">{label}</span>
                    </div>
                  )}
                </div>
              ))}

          <div>
            <a
              href="https://discord.gg/FZscDWnhau"
              target="_blank"
              rel="noreferrer"
              className={`flex items-center justify-center rounded-md bg-violet px-4 py-3`}
            >
              <FaDiscord className="h-6 w-6" />

              <span className="mx-4 font-semibold">Discord</span>
            </a>
          </div>
        </div>
      )}
    </nav>
  );
}

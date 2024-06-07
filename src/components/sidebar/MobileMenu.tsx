import React from 'react';

import Link from 'next/link';

import { FiHome, FiLogOut, FiVideo } from 'react-icons/fi';
import { AiOutlineDashboard, AiOutlineSchedule } from 'react-icons/ai';
import { BiVideoPlus } from 'react-icons/bi';
import { FaBug, FaDiscord } from 'react-icons/fa';

type MobileMenuProps = {
  onClipThatClick: () => void;
  onLogoutClick: () => void;
  onReportBugClick: () => void;
  isUserSubbed: boolean;
};

function MobileMenu(props: MobileMenuProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const toggleOpen = () => setIsOpen(!isOpen);

  return (
    <>
      {/* Mobile Menu - hamburger button */}
      <button
        id="menu-btn"
        className={`hamburger left-3 top-3 z-30 block focus:outline-none md:hidden ${
          isOpen && 'open2'
        }`}
        onClick={toggleOpen}
      >
        <span className="hamburger-top" />
        <span className="hamburger-middle" />
        <span className="hamburger-bottom" />
      </button>

      {/* Mobile Menu */}
      {isOpen && (
        <ul
          id="menu"
          className="fixed inset-0 z-20 h-full w-full flex-col items-center divide-y-4 divide-white self-end bg-white px-6 py-1 pb-4 pt-16 text-sm uppercase tracking-widest text-white"
        >
          <li>
            <Link href="/">
              <a className="flex items-center justify-center rounded-md bg-violet px-4 py-3">
                <FiHome className="h-6 w-6" />
                <span className="mx-4 font-semibold">Home</span>
              </a>
            </Link>
          </li>

          <li>
            <Link href="/dashboard">
              <a className="flex items-center justify-center rounded-md bg-violet px-4 py-3">
                <AiOutlineDashboard className="h-6 w-6" />
                <span className="mx-4 font-semibold">Dashboard</span>
              </a>
            </Link>
          </li>

          <li>
            <Link href="/clips">
              <a className="flex items-center justify-center rounded-md bg-violet px-4 py-3">
                <FiVideo className="h-6 w-6" />
                <span className="mx-4 font-semibold">Clips</span>
              </a>
            </Link>
          </li>

          <li>
            <Link href="/settings/scheduling">
              <a className="flex items-center justify-center rounded-md bg-violet px-4 py-3">
                <AiOutlineSchedule className="h-6 w-6" />
                <span className="mx-4 font-semibold">Automation</span>
              </a>
            </Link>
          </li>

          <li>
            <button
              className="flex w-full items-center justify-center rounded-md bg-violet px-4 py-3 text-sm uppercase disabled:opacity-60"
              onClick={() => {
                setIsOpen(false);
                props.onClipThatClick();
              }}
              disabled={!props.isUserSubbed}
            >
              <BiVideoPlus className="h-6 w-6" />
              <span className="mx-4 font-semibold">Clip That</span>
            </button>
          </li>

          <li>
            <button
              className="flex w-full items-center justify-center rounded-md bg-violet px-4 py-3 text-sm uppercase"
              onClick={() => {
                setIsOpen(false);
                props.onReportBugClick();
              }}
            >
              <FaBug className="h-6 w-6" />
              <span className="mx-4 font-semibold">Report Bug</span>
            </button>
          </li>

          <li>
            <a
              className="flex items-center justify-center rounded-md bg-violet px-4 py-3"
              href="https://discord.gg/FZscDWnhau"
              target="_blank"
              rel="noreferrer"
            >
              <FaDiscord className="h-6 w-6" />
              <span className="mx-4 font-semibold">Discord</span>
            </a>
          </li>

          <li>
            <Link href="/settings">
              <a className="flex items-center justify-center rounded-md bg-violet px-4 py-3">
                <AiOutlineSchedule className="h-6 w-6" />
                <span className="mx-4 font-semibold">Settings</span>
              </a>
            </Link>
          </li>

          <li>
            <button
              className="flex w-full items-center justify-center rounded-md bg-violet px-4 py-3 text-sm uppercase"
              onClick={() => {
                setIsOpen(false);
                props.onLogoutClick();
              }}
            >
              <FiLogOut className="h-6 w-6" />
              <span className="mx-4 font-semibold">Logout</span>
            </button>
          </li>
        </ul>
      )}
    </>
  );
}

export default MobileMenu;

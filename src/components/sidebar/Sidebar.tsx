import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

import { FiSettings, FiHome, FiVideo, FiLogOut } from 'react-icons/fi';
import { AiOutlineDashboard, AiOutlineSchedule } from 'react-icons/ai';
import { FaDiscord, FaBug } from 'react-icons/fa';
import { BiVideoPlus } from 'react-icons/bi';
import { IconType } from 'react-icons';

import { useRouter } from 'next/router';
import { useSession, signOut } from 'next-auth/react';
import { useContext, useState } from 'react';
import { ClipContext, UserContextState } from '../../context/ClipContext';
import { trpc } from '../../utils/trpc';
import { toast } from 'react-toastify';

import ReportBug from '../ReportBug';
import UpgradeCard from '../UpgradeCard';

import textLogo from '../../../public/assets/images/text-logo.png';

import Show from '../common/Show';
import TabAnchor from './TabAnchor';
import TabButton from './TabButton';
import MobileMenu from './MobileMenu';

export type NavItems = {
  label: string;
  icon: IconType;
  href?: string;
  isExternalLink?: boolean;
  position: 'top' | 'bottom' | 'none';
  onClick?: (e?: MouseEvent) => void;
};

const Sidebar = () => {
  const router = useRouter();
  const { data: session } = useSession({
    required: true,
    onUnauthenticated() {
      router.push('/');
    }
  });

  const user = session?.user;
  const { setUserClips } = useContext(ClipContext) as UserContextState;
  const [reportModalOpen, setReportModalOpen] = useState<boolean>(false);

  const { data: userDetails, isLoading: isUserQueryLoading } = trpc.useQuery(['user.getDetails']);
  const isSubbed = user?.userId === userDetails?.id && userDetails?.sub_status === 'active';

  const createClipMutation = trpc.useMutation(['clip.createClip'], {
    onSuccess: () => {
      toast.success('Clip Created! Please wait some time for this clip to process.', {
        autoClose: 3000
      });
    }
  });

  const handleLogoutClick = () => {
    setUserClips([]);
    signOut();
  };

  const handleClipThatClick = () => {
    createClipMutation
      .mutateAsync()
      .catch((error) => toast.error(error.message, { autoClose: 2000 }));
  };

  return (
    <>
      <div className="border-border bg-sidebar fixed hidden h-screen flex-col overflow-y-auto border-r px-4 py-8 md:flex md:w-52 lg:w-64">
        <div className="flex w-full justify-center">
          <Link href="/">
            <a className="pointer-cursor flex">
              <Image src={textLogo} alt="Clipbot.Tv" />
            </a>
          </Link>
        </div>

        <div className="mt-6 flex flex-1 flex-col justify-between">
          <aside>
            <ul className="flex flex-col gap-3">
              <li>
                <Link href="/dashboard">
                  <TabAnchor isActive={router.pathname == '/dashboard'}>
                    <AiOutlineDashboard className="h-6 w-6" />
                    <span className="mx-4 font-semibold">Dashboard</span>
                  </TabAnchor>
                </Link>
              </li>

              <li>
                <Link href="/clips">
                  <TabAnchor isActive={router.pathname == '/clips'}>
                    <FiVideo className="h-6 w-6" />
                    <span className="mx-4 font-semibold">Clips</span>
                  </TabAnchor>
                </Link>
              </li>

              <li>
                <Link href="/settings/scheduling">
                  <TabAnchor isActive={router.pathname == '/settings/scheduling'}>
                    <AiOutlineSchedule className="h-6 w-6" />
                    <span className="mx-4 font-semibold">Automation</span>
                  </TabAnchor>
                </Link>
              </li>

              <li>
                <Link href="/settings">
                  <TabAnchor isActive={router.pathname == '/settings'}>
                    <FiSettings className="h-6 w-6" />
                    <span className="ml-4 font-semibold">Settings</span>
                  </TabAnchor>
                </Link>
              </li>
            </ul>
          </aside>

          <aside>
            <ul className="flex flex-col gap-2">
              <Show when={!isUserQueryLoading && !isSubbed}>
                <li>
                  <UpgradeCard />
                </li>
              </Show>

              <li>
                <TabButton
                  onClick={handleClipThatClick}
                  disabled={!isSubbed || createClipMutation.isLoading}
                >
                  <BiVideoPlus className="h-6 w-6" />
                  <span className="ml-4 font-semibold">Clip That!</span>
                </TabButton>
              </li>

              <li>
                <TabButton onClick={() => setReportModalOpen(true)}>
                  <FaBug className="h-6 w-6" />
                  <span className="ml-4 font-semibold">Report Bug</span>
                </TabButton>
              </li>

              <li>
                <TabAnchor
                  href="https://discord.gg/FZscDWnhau"
                  target="_blank"
                  rel="noreferrer"
                  isActive={true}
                >
                  <FaDiscord className="h-6 w-6" />
                  <span className="ml-4 font-semibold">Discord</span>
                </TabAnchor>
              </li>

              <li>
                <TabButton onClick={handleLogoutClick}>
                  <FiLogOut className="h-6 w-6" />
                  <span className="ml-4 font-semibold">Logout</span>
                </TabButton>
              </li>
            </ul>
          </aside>
        </div>
      </div>

      <MobileMenu
        onClipThatClick={handleClipThatClick}
        onReportBugClick={() => setReportModalOpen(true)}
        onLogoutClick={handleLogoutClick}
        isUserSubbed={isSubbed}
      />

      <ReportBug modalOpen={reportModalOpen} setModalOpen={setReportModalOpen} user={user} />
    </>
  );
};

export default Sidebar;

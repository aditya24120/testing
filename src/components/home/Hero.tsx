import { Session } from 'next-auth';
import { signIn } from 'next-auth/react';
import Link from 'next/link';
import { FiTwitch } from 'react-icons/fi';
import { GrMultimedia } from 'react-icons/gr';
import Image from 'next/image';
import { motion } from 'framer-motion';
import heroImg from '../../../public/assets/images/hero-image.png';

type Props = {
  user?: Session['user'];
};
const Hero = ({ user }: Props) => {
  return (
    <section id="hero" className="mb-10 lg:mb-32">
      <div className="container mx-auto flex  flex-col-reverse p-6 lg:mb-0 lg:flex-row ">
        <motion.div
          whileInView={{ x: [-100, 0], opacity: [0, 1] }}
          transition={{ duration: 0.5 }}
          className="flex flex-col space-y-10 lg:mt-16 lg:w-1/2"
        >
          <h1 className="text-center text-3xl font-bold text-violet-300 lg:text-left lg:text-6xl">
            <span className="text-violet">Convert,</span> Enhance and Share Your Twitch Clips with
            Our Platform
          </h1>
          <p className="text-md mx-auto  text-center text-violet-400 lg:mx-0 lg:mt-0 lg:text-left lg:text-2xl">
            Create, schedule, upload, and easily manage your Twitch clips at scale, with the help of
            our features, auto-captioning, scheduling options and support for other social media
            platforms.
          </p>

          <div className="flex w-full items-center justify-center space-x-4 lg:justify-start">
            {!user && (
              <a
                href={`/api/auth/signin/twitch`}
                onClick={(e) => {
                  e.preventDefault();
                  signIn('twitch', { callbackUrl: `/clips` });
                }}
                className="flex items-center gap-2 rounded-lg border-2 border-violet-600 bg-violet-600 p-4 text-sm font-bold text-white shadow-md  transition duration-75 ease-in-out hover:scale-105 active:scale-90 md:text-base"
              >
                <FiTwitch className="h-8 w-8" />
                <span>Sign in with Twitch</span>
              </a>
            )}

            {user && (
              <Link href={`/clips`} passHref>
                <a className="flex items-center  gap-2 rounded-lg border-2 border-violet-600 bg-violet-600 p-4 text-sm font-bold text-white shadow-md transition duration-75 ease-in-out hover:scale-105 hover:border-violet-600/90 hover:bg-violet-600/90 active:scale-90 md:text-base">
                  <GrMultimedia className="react-icon h-7 w-7  stroke-white" />
                  <span>View My Clips</span>
                </a>
              </Link>
            )}
          </div>
        </motion.div>

        <div className="relative mx-auto hidden md:block lg:mx-0 lg:mb-0 lg:w-1/2">
          <motion.div
            whileInView={{ x: [500, 0], opacity: [0, 1] }}
            transition={{ duration: 0.6 }}
            className="absolute top-52 rounded-l-full bg-gradient-to-tr from-violet to-slushi-200 lg:left-1/3 lg:h-80 lg:w-[2000px]"
          />

          <motion.div
            whileInView={{ opacity: [0, 1] }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="relative overflow-x-visible md:hidden lg:left-40 lg:block xl:bottom-1 xl:left-48"
          >
            {/* <div className="blob absolute right-2/3 top-36 hidden h-80 w-80 rotate-12 scale-[200%] bg-gradient-to-tr from-slushi-500/70 to-rose-500/20 opacity-10 md:block" /> */}

            <Image src={heroImg} alt="" width={378} height={600} />
          </motion.div>
        </div>
      </div>
    </section>
  );
};
export default Hero;

import { motion } from 'framer-motion';
import Link from 'next/link';
import { BsTwitter } from 'react-icons/bs';
import { FaDiscord } from 'react-icons/fa';

const FollowUs = () => {
  return (
    <motion.div
      whileInView={{ x: [500, 0], opacity: [0, 1] }}
      transition={{ duration: 0.6 }}
      className="w-full rounded-lg bg-gradient-to-tr from-violet via-violet/90 to-slushi-500/50 py-10 md:px-10 lg:px-20"
    >
      <div className="flex justify-between gap-2">
        <div className="flex flex-col space-y-2">
          <p className=" font-bold text-white drop-shadow-md md:text-3xl lg:text-5xl">
            Stay updated with Clipbot
          </p>
          <p className="text-white/90 drop-shadow md:text-xl lg:text-xl">
            Follow us on Twitter and join our Discord to stay up to date
          </p>
        </div>

        <div className="flex md:gap-20 lg:gap-32 ">
          <a
            href="https://discord.gg/FZscDWnhau"
            target="_blank"
            rel="noreferrer"
            className="group flex flex-col items-center text-white transition duration-150 ease-in hover:scale-110"
          >
            <FaDiscord className="h-16 w-16" />
            <span className="text-xl">Discord</span>
          </a>

          <a
            href="https://twitter.com/ClipbotTV"
            target="_blank"
            rel="noreferrer"
            className="group flex flex-col items-center text-white transition duration-150 ease-in hover:scale-110"
          >
            <BsTwitter className="h-16 w-16" />
            <span className="text-xl">Twitter</span>
          </a>
        </div>
      </div>
    </motion.div>
  );
};
export default FollowUs;

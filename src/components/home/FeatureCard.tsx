import { motion } from 'framer-motion';
import Link from 'next/link';
import { IconType } from 'react-icons';
import { BsArrowRight } from 'react-icons/bs';

export type FeatureHome = {
  icon: IconType;
  label: string;
  description: string;
  bgColor?: string;
  iconColor?: string;
  href?: string;
};

const FeatureCard = ({ icon: Icon, label, description, bgColor, iconColor, href }: FeatureHome) => {
  return (
    <motion.div
      variants={{
        hidden: { y: 20, opacity: 0 },
        visible: {
          y: 0,
          opacity: 1
        }
      }}
      className="group z-10 flex items-start gap-4 rounded-md border-violet-200 p-4 shadow hover:-translate-y-1 hover:shadow-xl hover:transition hover:duration-75 hover:ease-linear sm:border md:border-2 "
    >
      <span
        className={`group-hover:duration-400 my-4 inline-block rounded-xl p-2 group-hover:scale-110 group-hover:transition group-hover:ease-linear ${
          bgColor ? bgColor : 'bg-gradient-to-tr from-violet to-slushi'
        } ${iconColor ? iconColor : 'text-white'}`}
      >
        <Icon className="h-8 w-8" />
      </span>

      <div className="flex flex-col items-start gap-2">
        <h3 className="my-3 text-3xl font-semibold group-hover:text-violet">{label}</h3>
        <div className="mt-auto space-y-1 leading-tight">
          <p>{description}</p>
        </div>
        {href && (
          <Link href={'/features/scheduling'}>
            <div
              className={`mt-2 flex transform items-center gap-1 font-semibold duration-150 ease-in hover:cursor-pointer group-hover:gap-2 group-hover:text-violet`}
            >
              More Details <BsArrowRight />
            </div>
          </Link>
        )}
      </div>
    </motion.div>
  );
};
export default FeatureCard;

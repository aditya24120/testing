import { Features } from '../utils/features';
import { motion } from 'framer-motion';

const FeatureItem = ({ feature, small = false }: { feature: Features; small?: boolean }) => {
  const { isNew, label, description, icon: Icon } = feature;

  return (
    <motion.li
      variants={{
        hidden: { y: 20, opacity: 0 },
        visible: {
          y: 0,
          opacity: 1
        }
      }}
      key={label}
      className="flex items-start"
    >
      <div className="md:-mx-4 md:flex md:items-start">
        <span
          className={`${
            small ? 'mt-1 rounded-md p-1' : 'rounded-xl p-2'
          } inline-block border-violet-200 bg-gradient-to-tr from-violet to-slushi text-white md:mx-4`}
        >
          <Icon className={`${small ? 'h-4 w-4' : 'h-6 w-6'}`} />
        </span>

        <div className="mt-4 md:mx-4 md:mt-0">
          <div className="flex items-center gap-2">
            <h1 className={`capitalize text-violet ${small ? 'text-xl' : 'text-2xl'} font-bold`}>
              {label}
            </h1>

            {isNew && (
              <div className="shadow-xs inline-block -skew-y-6 rounded-2xl bg-red-500 px-2 py-1 text-sm text-white ">
                New
              </div>
            )}
          </div>

          <p className={`${small ? 'text-xs' : ''} mt-3 text-violet-400 md:mt-0`}>{description}</p>
        </div>
      </div>
    </motion.li>
  );
};
export default FeatureItem;

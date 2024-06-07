import { motion, useAnimation } from 'framer-motion';
import FeatureCard, { FeatureHome } from './FeatureCard';
import { useInView } from 'react-intersection-observer';
import { useEffect } from 'react';

type Props = {
  premiumFeatures: FeatureHome[];
};

const Features = ({ premiumFeatures }: Props) => {
  const controls = useAnimation();
  const [ref, inView] = useInView();
  useEffect(() => {
    if (inView) {
      controls.start('visible');
    } else {
      controls.set('hidden');
      controls.stop();
    }
  }, [controls, inView]);

  return (
    <section id="features" className="m-4 md:my-20">
      <motion.div
        whileInView={{ y: [100, 50, 0], opacity: [0, 0, 1] }}
        transition={{ duration: 0.5 }}
        className="container relative mx-auto my-6 space-y-6 p-4 text-center"
      >
        <div className="mb-4 inline-block rounded-2xl bg-white px-6 py-2 font-bold text-violet shadow-md">
          Features
        </div>
        <h2 className="mx-auto text-4xl font-bold text-violet-300 md:text-5xl lg:w-2/3">
          <span className="text-violet">Easily</span> Schedule, Upload, and Share Your Clips with
          Our App
        </h2>

        <p className="mx-auto font-semibold text-violet-400 lg:w-2/3">
          Take your content creation to the next level with our advanced clip editing features. Our
          app allows you to easily edit, upload, and schedule your clips for maximum engagement. Our
          built-in templates make it easy to create professional-looking content, while our auto
          captioning feature ensures that your clips are accessible to all of your followers. With
          the ability to download your edited clips, you will have everything you need to grow your
          community on other platforms. Upgrade your content game with our app today!
        </p>

        <div
          aria-hidden
          className="blob -left- absolute -left-20 top-1/2  hidden h-96 w-96  -rotate-6 scale-[200%] bg-gradient-to-t from-slushi-500/80 to-transparent opacity-30 md:block"
        />
      </motion.div>

      <motion.div
        ref={ref}
        variants={{
          hidden: { opacity: 1, scale: 0 },
          visible: {
            opacity: 1,
            scale: 1,
            transition: {
              delayChildren: 0.3,
              staggerChildren: 0.2
            }
          }
        }}
        initial="hidden"
        animate={controls}
        className="container mx-auto grid auto-rows-fr justify-center gap-8 text-violet-300 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
      >
        {premiumFeatures.map(({ icon: Icon, label, description, bgColor, iconColor, href }) => (
          <FeatureCard
            key={label}
            icon={Icon}
            label={label}
            description={description}
            bgColor={bgColor}
            iconColor={iconColor}
            href={href}
          />
        ))}
      </motion.div>
    </section>
  );
};
export default Features;

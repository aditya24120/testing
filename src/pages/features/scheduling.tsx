import Layout from '../../components/Layout';
import Schedule from '../../../public/assets/images/schedule.jpg';
import { FaYoutube, FaTiktok, FaFacebookSquare } from 'react-icons/fa';
import { FiInstagram } from 'react-icons/fi';
import { AiOutlineDashboard } from 'react-icons/ai';
import FeatureSection, { TFeatureSection } from '../../components/FeatureSection';

const FeatureSections: TFeatureSection[] = [
  {
    img: {
      url: Schedule,
      altText: 'schedule image',
      blendColor: true
    },
    pillText: 'Schedule',
    heading: 'Plan and Schedule your content',
    description:
      'Lorem ipsum dolor sit amet consectetur adipisicing elit. Beatae, eos. adipisicing elit. Beatae , eos.',
    features: [
      {
        icon: AiOutlineDashboard,
        label: 'Preview clip'
      },
      {
        icon: AiOutlineDashboard,
        label: 'Post to multiple platforms'
      },
      {
        icon: AiOutlineDashboard,
        label: 'Best time to post'
      },
      {
        icon: AiOutlineDashboard,
        label: 'Lorem ipsum dolor sit amet'
      }
    ]
  },
  {
    img: {
      url: Schedule,
      altText: 'schedule image',
      blendColor: true
    },
    pillText: 'Reels, Shorts & TikTok',
    heading: 'Share your clips across multiple platforms!',
    description:
      'Lorem ipsum dolor sit amet consectetur adipisicing elit. Beatae, eos. adipisicing elit. Beatae , eos.',
    features: [
      {
        icon: FaYoutube,
        label: 'YouTube',
        bgColor: 'bg-red-500',
        iconColor: 'text-white'
      },
      {
        icon: FaTiktok,
        label: 'TikTok',
        bgColor: 'bg-black',
        iconColor: 'text-white'
      },
      {
        icon: FaFacebookSquare,
        label: 'Facebook Reels',
        bgColor: 'bg-sky-500',
        iconColor: 'text-white'
      },
      {
        icon: FiInstagram,
        label: 'Instagram Reels',
        bgColor: 'bg-pink-400',
        iconColor: 'text-white'
      }
    ]
  },
  {
    img: {
      url: Schedule,
      altText: 'schedule image',
      blendColor: true
    },
    pillText: 'Automation',
    heading: 'Create recurring uploads',
    description:
      'Lorem ipsum dolor sit amet consectetur adipisicing elit. Beatae, eos. adipisicing elit. Beatae , eos.',
    features: [
      {
        icon: AiOutlineDashboard,
        label: 'Repeating schedule'
      },
      {
        icon: AiOutlineDashboard,
        label: 'One-time setup'
      },
      {
        icon: AiOutlineDashboard,
        label: 'Automatic cropping'
      },
      {
        icon: AiOutlineDashboard,
        label: 'Lorem ipsum dolor sit amet.'
      }
    ]
  }
];

const SchedulingPage = () => {
  return (
    <Layout>
      <div className="mt-20"></div>
      <section className="mt-10">
        <div className="container mx-auto max-w-2xl">
          <div className="lea flex flex-col items-center justify-center text-center ">
            <h1 className="text-xl font-semibold capitalize text-violet md:text-6xl md:leading-normal">
              Plan and <span className="text-border">Schedule</span> your content
            </h1>

            <p className={`text-md mt-3 text-violet-400 md:text-xl`}>Currently under development</p>
          </div>
        </div>
        <div className="mb-10 mt-10 w-full border border-r-[100vw] border-t-[100px] border-violet border-t-transparent  "></div>
      </section>

      {FeatureSections.map((features, index) => (
        <section className="mt-20">
          <FeatureSection section={features} reverse={Boolean(index % 2)} />
        </section>
      ))}
    </Layout>
  );
};
export default SchedulingPage;

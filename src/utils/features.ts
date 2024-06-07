import { IconType } from 'react-icons';
import { AiOutlineCalendar, AiOutlineCheck, AiOutlineSchedule } from 'react-icons/ai';
import { BsDownload, BsUpload } from 'react-icons/bs';
import { FaRegClosedCaptioning } from 'react-icons/fa';
import { FiCrop, FiSettings } from 'react-icons/fi';
import { HiOutlineTemplate } from 'react-icons/hi';
import { MdAccessAlarms } from 'react-icons/md';
import { FeatureHome } from '../components/home/FeatureCard';
import { BiVideoPlus } from 'react-icons/bi';

export type Features = {
  label: string;
  icon: IconType;
  description: string;
  isNew: boolean;
};

export const basicFeatures = [
  {
    label: 'Upload to YouTube',
    description: '',
    icon: AiOutlineCheck
  },
  {
    label: 'Upload to Facebook reels  ( Coming soon! )',
    description: '',
    icon: AiOutlineCheck
  },
  {
    label: 'Upload to Instagram reels ( Coming soon! )',
    description: '',
    icon: AiOutlineCheck
  },
  {
    label: 'Share to TikTok',
    description: '',
    icon: AiOutlineCheck
  },
  {
    label: 'Templates',
    description: '',
    icon: AiOutlineCheck
  },
  {
    label: 'Trim clips',
    description: '',
    icon: AiOutlineCheck
  },
  {
    label: 'Download edited videos',
    description: '',
    icon: AiOutlineCheck
  }
];

export const premiumFeatures: Features[] = [
  {
    label: 'Everything in the basic plan',
    description:
      'Upload to YouTube and Tiktok. Create crop templates. Edit clips. Download edited videos',
    icon: AiOutlineCheck,
    isNew: false
  },
  {
    label: 'Create clips',
    description: 'Create clips from our app with a simple click of a button!',
    icon: BiVideoPlus,
    isNew: true
  },
  {
    label: 'Schedule clips',
    description: 'Schedule a time for the upload of your video',
    icon: AiOutlineCalendar,
    isNew: false
  },
  {
    label: 'Auto Scheduling',
    description:
      'Schedule when you want your clips to be uploaded each week. Approve your favorite clips, and we will take care of the rest',
    icon: AiOutlineSchedule,
    isNew: false
  },
  {
    label: 'Auto Captions',
    description:
      'Generate captions that will appear at the bottom of your clips. Captioning can help make media more accessible along with improving the user experience',
    icon: FaRegClosedCaptioning,
    isNew: false
  },
  {
    label: 'Early access to new features',
    description: 'Gain access to new features as they are being developed',
    icon: MdAccessAlarms,
    isNew: false
  },
  {
    label: 'Support development',
    description: 'Support the team! <3',
    icon: FiSettings,
    isNew: false
  }
];

export const homePageFeatures: FeatureHome[] = [
  {
    icon: FiCrop,
    label: 'Crop Clips',
    description:
      'Easily trim and crop your clips into vertical videos with our Crop Clips feature, perfect for platforms like YouTube and TikTok',
    bgColor: '',
    iconColor: ''
  },
  {
    icon: BsUpload,
    label: 'Upload',
    description:
      'Share your verticalized clips on other platforms with our Upload feature, expanding your reach and growing your community',
    bgColor: '',
    iconColor: ''
  },
  {
    icon: HiOutlineTemplate,
    label: 'Templates',
    description:
      'Streamline your editing process with our Templates feature, allowing you to save crop settings for fast and consistent video edits',
    bgColor: '',
    iconColor: ''
  },
  {
    icon: BsDownload,
    label: 'Download',
    description:
      'Take control of your content with our Download feature, allowing you to easily save and share your edited and rendered clips',
    bgColor: '',
    iconColor: ''
  },

  {
    icon: AiOutlineSchedule,
    label: 'Scheduling',
    description:
      'Maximize engagement with our Scheduling feature, allowing you to schedule your clips for future release.',
    bgColor: '',
    iconColor: ''
    // href: '/features/scheduling'
  },
  {
    icon: FaRegClosedCaptioning,
    label: 'Auto Captions',
    description:
      'Make your clips accessible to all with our Auto Captions feature, generating captions that will appear at the bottom of your clips to improve user experience',
    bgColor: '',
    iconColor: ''
  }
];

import Image, { StaticImageData } from 'next/image';
import { getFirstWord, removeFirstWord } from '../utils/string';
import { IconType } from 'react-icons';

export type TFeatureSection = {
  img: {
    url: StaticImageData;
    altText: string;
    blendColor: boolean;
  };
  pillText: string;
  heading: string;
  description: string;
  features: {
    icon: IconType;
    label: string;
    bgColor?: string;
    iconColor?: string;
  }[];
};

const FeatureSection = ({
  section,
  reverse = false
}: {
  section: TFeatureSection;
  reverse?: boolean;
}) => {
  const { img, pillText, heading, description, features } = section;
  return (
    <div
      className={`container mx-auto flex items-stretch justify-center gap-8 ${
        reverse && 'flex-row-reverse'
      }`}
    >
      <div className="w-full">
        <Image
          src={img.url}
          alt={img.altText}
          // className={`${img.blendColor && 'mix-blend-color-burn'}`}
        />
      </div>
      <div className="block w-full flex-col">
        <div className="mb-12 inline-block rounded-2xl bg-white px-6 py-2 font-bold text-violet shadow-md">
          {pillText}
        </div>

        <h1 className="mb-4 text-xl font-semibold  capitalize tracking-wide text-violet md:text-4xl ">
          <span className="text-border">{getFirstWord(heading)}</span> {removeFirstWord(heading)}
        </h1>

        <p className={`text-md mb-8 text-violet-400 md:text-xl`}>{description}</p>

        <div className="grid grid-cols-2 gap-8">
          {features?.map(({ icon: Icon, label, bgColor, iconColor }) => (
            <div className="flex items-center">
              <span
                className={`inline-block rounded-xl p-2  ${bgColor ? bgColor : 'bg-border'} ${
                  iconColor ? iconColor : 'text-black'
                }`}
              >
                <Icon className="h-10 w-10" />
              </span>
              <span className="mx-4 font-medium text-violet">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
export default FeatureSection;

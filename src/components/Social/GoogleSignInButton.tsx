import { useState } from 'react';
import Image from 'next/image';

const GoogleButton = ({
  onClick,
  width,
  height,
}: {
  onClick: () => void;
  width?: number;
  height?: number;
}) => {
  const [isHovering, setIsHovered] = useState(false);
  const onMouseEnter = () => setIsHovered(true);
  const onMouseLeave = () => setIsHovered(false);
  const widthVHeight = 382 / 92;
  const actualWidth = height ? widthVHeight * height : '382';
  const actualHeight = width ? width / widthVHeight : '92';
  return (
    <div
      className="flex items-center flex-shrink-0 mr-6 cursor-pointer"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <button type="button" onClick={onClick}>
        {isHovering ? (
          <Image
            src="/assets/images/google_signin_buttons/web/2x/btn_google_signin_dark_focus_web@2x.png"
            height={actualHeight + 'px'}
            width={actualWidth + 'px'}
            alt="logo"
          />
        ) : (
          <Image
            src="/assets/images/google_signin_buttons/web/2x/btn_google_signin_dark_normal_web@2x.png"
            height={actualHeight + 'px'}
            width={actualWidth + 'px'}
            alt="logo"
          />
        )}
      </button>
    </div>
  );
};

export default GoogleButton;

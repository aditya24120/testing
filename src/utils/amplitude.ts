import amplitude from 'amplitude-js';
import { Session } from 'next-auth';

let didInit = false;

export const initAmplitude = () => {
  amplitude.getInstance().init(process.env.NEXT_PUBLIC_AMP_KEY as string);
};

export const setAmplitudeUserDevice = (installationToken: string) => {
  amplitude.getInstance().setDeviceId(installationToken);
};

export const setAmplitudeUserId = (userId: string) => {
  amplitude.getInstance().setUserId(userId);
};

export const setAmplitudeUserProperties = (properties: any) => {
  amplitude.getInstance().setUserProperties(properties);
};

export const logEvent = (
  eventType: string,
  eventProperties: Record<string, any>,
  session: Session
) => {
  const allFields: Record<string, any> = eventProperties;
  let uuid = allFields.uuid;
  // copy all fields safely
  const keysToIgnore = ['tiktokSessionId', 'youtubeToken', 'igToken', 'userId', 'uuid'];
  const safeFields = Object.keys(allFields).reduce((acc: Record<string, any>, key) => {
    if (keysToIgnore.includes(key) || typeof allFields[key] === 'function') {
      return acc;
    }
    acc[key] = allFields[key];
    return acc;
  }, {});

  safeFields.isPremium = false;

  amplitude.getInstance().logEvent('clipbot_web_' + eventType, {
    user_id: session?.user?.email || uuid || 'Unknown',
    event_properties: safeFields,
  });
};

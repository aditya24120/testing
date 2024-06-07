/* eslint-disable @next/next/no-img-element */
import axios from 'axios';
import { useEffect, useState } from 'react';
import NextButtons from '../NextButtons';
import { AccountProviders, useUploadContext } from '../../context/UploadContext';
import { InstagramLoginButton, createButton } from 'react-social-login-buttons';
import GoogleButton from '../Social/GoogleSignInButton';
import { logEvent } from '../../utils/amplitude';
import { loginToTikTok } from '../../utils/logins';
//@ts-ignore
import * as FB from 'fb-sdk-wrapper';
import { states } from '../../utils/states';
import { toast } from 'react-toastify';
import InstagramLoginError from '../InstagramLoginError';
import { trpc } from '../../utils/trpc';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import { useQueryClient } from 'react-query';
import { requriedScopes } from '../settings/Connections';

const TiktokIcon = () => {
  return (
    <a
      title="tiktok"
      className="social-icon"
      aria-label="tiktok"
      style={{
        display: 'inline-block',
        width: '50px',
        height: '50px',
        position: 'relative',
        overflow: 'hidden',
        marginLeft: '-5px',
        marginRight: '5px'
      }}
    >
      <div
        className="social-container"
        style={{
          verticalAlign: 'middle',
          position: 'absolute',
          top: '0px',
          left: '0px',
          width: '100%',
          height: '100%'
        }}
      >
        <svg
          className="social-svg"
          viewBox="0 0 64 64"
          style={{ position: 'absolute', top: '0px', left: '0px', width: '100%', height: '100%' }}
        >
          <g
            className="social-svg-icon"
            style={{ transition: 'fill 170ms ease-in-out 0s', fill: 'transparent' }}
          >
            <path d="M 0,0 H 64 V 64 H 0 Z"></path>
          </g>
          <g
            className="social-svg-mask"
            style={{ transition: 'fill 170ms ease-in-out 0s', fill: 'white' }}
          >
            <path d="M 0 0 L 0 0 L 0 0 L 64 0 L 0 0 z M 33.330078 16 L 38.845703 16 C 38.841484 16.464979 38.879928 16.930827 38.960938 17.388672 L 38.962891 17.388672 C 39.347214 19.450699 40.563022 21.263117 42.324219 22.402344 C 43.560373 23.223837 45.011906 23.660664 46.496094 23.660156 L 46.496094 24.853516 C 46.499654 24.854516 46.504312 24.854771 46.507812 24.855469 L 46.507812 29.123047 C 43.760055 29.129293 41.080342 28.271577 38.847656 26.669922 L 38.847656 37.882812 C 38.835889 43.478203 34.296575 48.007827 28.701172 48.007812 C 26.63222 48.048166 24.599665 47.449168 22.884766 46.291016 C 22.767781 46.167585 22.658664 46.038312 22.548828 45.910156 C 19.166219 43.334883 17.735525 38.905122 19.021484 34.820312 C 20.351327 30.5961 24.272588 27.726928 28.701172 27.736328 C 29.158607 27.742889 29.614526 27.781926 30.066406 27.853516 L 30.054688 33.488281 C 29.612312 33.350917 29.152646 33.277637 28.689453 33.273438 C 26.564626 33.28434 24.721455 34.740631 24.216797 36.804688 C 23.712137 38.868744 24.676556 41.009904 26.556641 42 C 27.215641 42.344292 27.967447 42.505495 28.710938 42.511719 C 31.19892 42.507676 33.238354 40.539029 33.330078 38.052734 L 33.330078 16 z"></path>
          </g>
        </svg>
      </div>
    </a>
  );
};

const LoginScreen = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: session } = useSession();

  const fullContext = useUploadContext();
  const {
    platforms,
    currentState,
    prevState,
    nextButtonPressed,
    backButtonPressed,
    allPlatformsLoggedIn,
    usernames,
    setUsernames,
    setCurrentState,
    setPrevState
  } = fullContext;

  const [instagramLoginError, setInstagramLoginError] = useState<boolean>(false);
  const [providers, setProviders] = useState<AccountProviders[]>([]);

  const {
    data: accounts,
    isLoading,
    refetch
  } = trpc.useQuery(['setting.getAccounts'], {
    onSuccess: (data) => {
      setProviders(data.map((acc) => acc.provider) as AccountProviders[]);
    },

    onError: (error) => {
      console.log('error me: ', error.data?.code);
      if (error.data?.code === 'UNAUTHORIZED') {
        router.push('/');
      }
    }
  });

  const {
    mutateAsync: upsertAccount,
    error: accountError,
    isLoading: accountLoading
  } = trpc.useMutation(['setting.createOrUpdate'], {
    onSuccess: (data) => {
      queryClient.invalidateQueries(['setting.getAccounts']);
      if (data.provider === 'instagram' && data.pageName) {
        setUsernames({ ...usernames, facebook: data.pageName });
      }
    }
  });

  const { mutateAsync: updateUsername } = trpc.useMutation(['setting.setUsername'], {
    onSuccess: () => {
      refetch();
    }
  });

  const setUsernameInDb = async (
    provider: 'youtube' | 'tiktok' | 'instagram',
    username: string
  ) => {
    await updateUsername({ provider, username });
  };

  const TiktokConnectButton = createButton({
    icon: TiktokIcon,
    text: 'Connect to TikTok',
    iconFormat: (name) => `fa-brands fa-${name}`,
    style: { background: 'black', margin: 0, width: '264px' },
    activeStyle: { background: 'rgba(0,0,0,0.5)' }
  });

  useEffect(() => {
    if (!allPlatformsLoggedIn(providers)) return;
    if (!currentState || !prevState) return;
    nextButtonPressed();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [platforms, providers, currentState, prevState]);

  const isInstagramSelected = platforms?.includes('Instagram');
  const isInstagramConnected = providers?.includes('instagram');

  const isFacebookSelected = platforms?.includes('Facebook');

  const isYouTubeSelected = platforms?.includes('YouTube');
  const isYouTubeConnected = providers?.includes('youtube');

  return (
    <>
      <div className="flex flex-col items-center">
        <h2 className="mb-20 text-center text-2xl font-bold text-violet">Connect your accounts</h2>

        {!isInstagramConnected && (isInstagramSelected || isFacebookSelected) && (
          <div className="form-group mb-3 w-72">
            <img
              src={'/assets/images/fb-button.png'}
              alt="fb"
              className={'w-64 font-bold hover:cursor-pointer'}
              onClick={() => {
                FB.login(
                  {
                    scope:
                      'instagram_basic, instagram_content_publish, pages_read_engagement, pages_show_list, pages_manage_posts',
                    return_scopes: true,
                    enable_profile_selector: true
                  },
                  { auth_type: 'reauthorize' }
                )
                  .then(
                    //@ts-ignore
                    async (data) => {
                      let igToken = data.authResponse;
                      const validPerms = requriedScopes.every((perm) => {
                        if (igToken?.grantedScopes) {
                          return igToken.grantedScopes.includes(perm);
                        }
                        return false;
                      });

                      if (!validPerms) {
                        setInstagramLoginError(true);
                        toast.error(
                          <div>
                            <h1 className="text-xl text-rose-ERROR">Facebook login failed</h1>
                            <p className="text-xs">Invalid permissions granted.</p>
                          </div>
                        );
                        if (session) {
                          logEvent('instagram_login_fail', fullContext, session);
                        }
                      } else {
                        let longTermIGTokenBlob = await axios.get(
                          `/api/fbLongTermAuth?accessToken=${igToken.accessToken}`
                        );
                        let longTermIGToken = longTermIGTokenBlob.data.newAccessToken;

                        const IGpromise = new Promise(async (resolve, reject) => {
                          const update = await upsertAccount({
                            type: 'oauth',
                            provider: 'instagram',
                            providerAccountId: igToken.userID,
                            refresh_token: longTermIGToken.refresh_token ?? undefined,
                            refresh_expires_at: longTermIGToken.refresh_expires_in,
                            access_token: longTermIGToken.access_token ?? undefined,
                            expires_at: longTermIGToken.expires_in ?? undefined,
                            token_type: 'Bearer',
                            scope: igToken?.grantedScopes
                          });
                          if (accountError) {
                            reject('account not updated');
                            return;
                          }
                          resolve(update);
                        });
                        IGpromise.then((data) => {
                          //@ts-ignore
                          axios
                            .get('/api/instagram/username?token=' + longTermIGToken.access_token)
                            .then((usernameBlob) => {
                              let username = usernameBlob.data.username;
                              if (username) {
                                setUsernameInDb('instagram', username);
                                setUsernames((prev) => ({ ...prev, instagram: username }));
                              }
                              setProviders((prev) => [...prev, 'instagram']);
                            });
                          toast.success('Facebbok login successful');
                          if (session) {
                            logEvent('instagram_login_success', fullContext, session);
                          }
                        }).catch(() => {
                          console.error('facebook account update failed');
                        });
                      }
                    }
                  )
                  //@ts-ignore
                  .catch((e) => {
                    setInstagramLoginError(true);
                    console.log('IG login or perms error');
                    console.log(e);
                  });
              }}
            />
          </div>
        )}

        {!isYouTubeConnected && isYouTubeSelected && (
          <div className="form-group mb-3 w-72">
            <GoogleButton
              onClick={() => {
                //@ts-ignore
                window.location = '/api/youtubeInitialAuth';
              }}
            />
          </div>
        )}

        {platforms?.includes('TikTok') && providers.length > 0 && !providers.includes('tiktok') && (
          <div className="form-group mb-6 w-72 ">
            <TiktokConnectButton className="font-bold" onClick={() => loginToTikTok()} />
          </div>
        )}

        <NextButtons
          nextButtonPressed={() => {
            if (allPlatformsLoggedIn(providers)) {
              if (!platforms?.includes('Instagram') && !platforms?.includes('YouTube')) {
                setCurrentState(states.REVIEW);
                setPrevState(states.SELECT);
              } else {
                nextButtonPressed();
              }
            } else {
              toast.error(
                <div className="w- w-full">
                  <h1 className=" text-xl text-red-600">
                    You must login to all selected platforms to continue
                  </h1>
                  <p className=" text-xs ">
                    Please login to the remaining platforms, or go back and select different
                    platforms.
                  </p>
                </div>,
                {
                  className: 'w-96 right-14 '
                }
              );
            }
          }}
          backButtonPressed={backButtonPressed}
        />
      </div>
      <InstagramLoginError modalOpen={instagramLoginError} setModalOpen={setInstagramLoginError} />
    </>
  );
};
export default LoginScreen;

import React, { useEffect, useState } from 'react';
import { FaYoutube, FaTiktok, FaStripeS, FaFacebookSquare } from 'react-icons/fa';
import { loginToTikTok } from '../../utils/logins';
import axios from 'axios';
import { signOut, useSession } from 'next-auth/react';
import { useUploadContext } from '../../context/UploadContext';
import { useRouter } from 'next/router';
import { toast } from 'react-toastify';
import { logEvent } from '../../utils/amplitude';
import { trpc } from '../../utils/trpc';
import { Platforms, TLocalStorageYouTubeToken } from '../../types/types';
import ConnectItem from './ConnectItem';
//@ts-ignore
import * as FB from 'fb-sdk-wrapper';
import InstagramLoginError from '../InstagramLoginError';
import Image from 'next/image';

export const requriedScopes = [
  'instagram_basic',
  'instagram_content_publish',
  'pages_read_engagement',
  'pages_show_list',
  'public_profile'
];

const Connections = () => {
  const router = useRouter();
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      router.push('/');
    }
  });
  const user = session?.user;

  const {
    data: UserAccountWithSettings,
    isLoading: isLoadingUserAccounts,
    refetch
  } = trpc.useQuery(['user.getAccountsAndSettings'], {
    onSuccess: (data) => {
      if (data.accounts) {
        setProviders(data.accounts);
      }
    },
    onError: (error) => {
      console.log('error me: ', error.data?.code);
      if (error.data?.code === 'UNAUTHORIZED') {
        signOut();
        return;
      }
    }
  });

  const [providers, setProviders] = useState<string[]>([]);
  const [instagramLoginError, setInstagramLoginError] = useState<boolean>(false);

  const fullContext = useUploadContext();
  const { setUsernames, usernames } = fullContext;

  // const { data: userDetails, isLoading: getUserLoading } = trpc.useQuery(['user.getDetails']);
  const isSubbed =
    user?.userId === UserAccountWithSettings?.user.id &&
    UserAccountWithSettings?.user.sub_status === 'active';

  const { mutateAsync: deleteAccount, error: deleteError } = trpc.useMutation(['setting.destroy']);
  const {
    mutateAsync: upsertAccount,
    error: accountError,
    isLoading: accountLoading
  } = trpc.useMutation(['setting.createOrUpdate'], {
    onSuccess: (data) => {
      refetch();
      if (data.provider === 'instagram' && data.pageName) {
        setUsernames((prev) => ({ ...prev, facebook: data.pageName } as Record<string, string>));
      }
    }
  });

  const { mutateAsync: updateUsername } = trpc.useMutation(['setting.setUsername'], {
    onSuccess: () => {
      refetch();
    }
  });

  const generatePortal = trpc.useMutation('stripe.portal');

  const disconnectAccount = async (platform: 'youtube' | 'tiktok' | 'instagram') => {
    const PLATFORM_LOOKUP = {
      tiktok: 'tiktokSessionId',
      youtube: 'youtubeToken',
      instagram: 'instagramToken'
    };
    const settingProviders = UserAccountWithSettings?.settings.selectedPlatforms.filter(
      (p) => p !== platform
    ) as Platforms;

    const removeAccount = await deleteAccount({ provider: platform, providers: settingProviders });
    if (deleteError) return;

    localStorage.removeItem(PLATFORM_LOOKUP[platform]);
    delete usernames?.[platform];

    setUsernames({ ...usernames });

    const removeProvider = providers.filter((p) => p !== platform);
    setProviders(removeProvider);
  };

  const setUsernameInDb = async (
    provider: 'youtube' | 'tiktok' | 'instagram',
    username: string
  ) => {
    await updateUsername({ provider, username });
  };

  const loginToFB = () => {
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
                <h1 className="text-xl text-rose-700">Facebook login failed</h1>
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
              toast.success('Facebook login successful');
              if (session) {
                logEvent('instagram_login_success', fullContext, session);
              }
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
  };

  useEffect(() => {
    const { youtubeToken, code, scopes } = router.query;
    const igToken = router.query?.['api-key'];
    if (code) {
      if (scopes?.includes('user.info.basic')) {
        //tiktok
        axios.get('/api/tiktokRedirect?code=' + code).then((res) => {
          let newToken = res.data.tiktokSessionId;
          if (newToken.error_code != 0) {
            toast.error(
              'TikTok login failed\nIf you just reloaded the page, you can ignore this. Otherwise, try again or contact rox@rox.works'
            );
            if (session) logEvent('tiktok_login_failed', fullContext, session);
            return;
          }
          const TTpromise = new Promise((resolve, reject) => {
            const update = upsertAccount({
              type: 'oauth',
              provider: 'tiktok',
              providerAccountId: newToken.open_id,
              refresh_token: newToken.refresh_token ?? null,
              refresh_expires_at: newToken.refresh_expires_in,
              access_token: newToken.access_token ?? null,
              expires_at: newToken.expires_in ?? null,
              token_type: 'Bearer',
              scope: newToken.scope
            });
            if (accountError) {
              reject('account not updated');
              return;
            }
            resolve(update);
          });
          TTpromise.then(() => {
            axios
              .get('/api/tiktok/username?tiktokToken=' + JSON.stringify(newToken))
              .then((usernameBlob) => {
                let newUsername = usernameBlob.data.username;
                if (newUsername) {
                  setUsernameInDb('tiktok', newUsername);
                  setUsernames((prev) => ({ ...prev, tiktok: newUsername }));
                }
              });
            setProviders((prev) => [...prev, 'tiktok']);
            toast.success('Tiktok login successful!');
            router.replace('/settings', undefined, { shallow: true });

            if (session) logEvent('tiktok_login_success', fullContext, session);
          });
        });
      } else {
        //@ts-ignore
        axios.get(`/api/youtubeInitialAuth?code=${code}&redirectUrl=settings`).then((res) => {
          let newToken: TLocalStorageYouTubeToken = res.data.token.token;
          if (newToken == undefined) {
            toast.error('Youtube login failed');
            if (session) logEvent('yt_login_failed', fullContext, session);
            return;
          }
          const YTpromise = new Promise((resolve, reject) => {
            const expiresTimeToSeconds = parseInt(String(newToken.expiry_date / 1000));
            const update = upsertAccount({
              type: 'oauth',
              provider: 'youtube',
              providerAccountId: newToken.access_token,
              refresh_token: newToken.refresh_token ?? undefined,
              access_token: newToken.access_token ?? undefined,
              expires_at: expiresTimeToSeconds,
              token_type: 'Bearer',
              scope: newToken.scope
            });
            if (accountError) {
              reject('account not updated');
              return;
            }
            resolve(update);
          });

          YTpromise.then(() => {
            setUsernames((prev) => ({ ...prev, youtube: 'Connected' }));

            setProviders((prev) => [...prev, 'youtube']);
            toast.success('YouTube login successful!');
            router.replace('/settings', undefined, { shallow: true });
            if (session) logEvent('yt_login_success', fullContext, session);
          });
        });
      }
    }
    if (youtubeToken && typeof youtubeToken === 'string') {
      toast.success('YouTube login successful!');
    }

    if (igToken) {
      toast.success('Instagram login successful!');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  if (status === 'loading' || isLoadingUserAccounts) {
    return null;
  }

  return (
    <div className="mt-2 flex w-full flex-col items-center gap-4 lg:p-10 ">
      <ConnectItem
        icon={
          <div className="flex h-8 w-8 items-center lg:h-14 lg:w-14">
            <Image alt="YouTube" src="/assets/images/youtube-icon.png" width={300} height={211} />
          </div>
        }
        label="YouTube"
        blurb="Connect your YouTube account to publish videos directly from Clipbot!"
        providers={providers}
        provider="youtube"
        accountLoading={accountLoading}
        isLoading={isLoadingUserAccounts}
        handleConnect={() => {
          //@ts-ignore
          window.location = '/api/youtubeInitialAuth?redirectUrl=settings';
        }}
        handleDisconnect={() => disconnectAccount('youtube')}
      />

      <ConnectItem
        icon={<FaTiktok className="h-8 w-8 text-black lg:h-12 lg:w-12" />}
        label="TikTok"
        blurb="Connect your Tiktok account to publish videos directly from Clipbot!"
        providers={providers}
        provider="tiktok"
        username={usernames?.tiktok}
        accountLoading={accountLoading}
        isLoading={isLoadingUserAccounts}
        handleConnect={() => loginToTikTok('?redirectUrl=settings')}
        handleDisconnect={() => disconnectAccount('tiktok')}
      />

      <ConnectItem
        icon={<FaFacebookSquare className="h-8 w-8 text-sky-500 lg:h-12 lg:w-12" />}
        label="Facebook"
        blurb="Connect your Facebook account to publish videos directly from Clipbot!"
        providers={providers}
        provider="instagram"
        username={usernames?.instagram}
        accountLoading={accountLoading}
        isLoading={isLoadingUserAccounts}
        handleConnect={() => loginToFB()}
        handleDisconnect={(provider) => disconnectAccount(provider)}
      />

      <ConnectItem
        icon={<FaStripeS className="h-6 w-8 text-blue-500 lg:h-10 lg:w-10" />}
        label="Stripe"
        blurb="Manage your Stripe subscription."
        accountLoading={accountLoading}
        isLoading={isLoadingUserAccounts}
        isSubbed={isSubbed}
        handleConnect={() => {
          if (isSubbed && UserAccountWithSettings.user) {
            generatePortal.mutateAsync(UserAccountWithSettings?.user.customer_id!).then((res) => {
              res?.url ? router.push(res.url) : console.log('couldnt generate Portal');
            });
          } else {
            router.push('/pricing');
          }
        }}
      />

      <InstagramLoginError modalOpen={instagramLoginError} setModalOpen={setInstagramLoginError} />
    </div>
  );
};
export default Connections;

import { useState, useCallback } from 'react';
import { trpc } from '../utils/trpc';
import router from 'next/router';
import { AiOutlineCheck } from 'react-icons/ai';
import { basicFeatures, premiumFeatures } from '../utils/features';
import { signIn, useSession } from 'next-auth/react';
import { FiTwitch } from 'react-icons/fi';
import MotionWrap from './MotionWrapper';

export const tiers = [
  {
    type: 0,
    name: 'Free',
    href: '#',
    priceMonthly: 0,
    priceYearly: 0,
    savings: 0,
    features: [...basicFeatures],
    buttonText: 'Get started'
  },
  {
    type: 1,
    name: 'Premium',
    href: '#',
    priceMonthly: 15, //180
    priceYearly: 9, //108
    savings: 40,
    features: [...premiumFeatures],
    buttonText: 'Upgrade now'
  }
];

const focusedPaymentStyle = ' bg-violet border-gray-200 shadow-lg text-white ';

function Pricing() {
  const { data, status } = useSession();
  const user = data?.user;

  const { data: userDetails, isLoading: getUserLoading } = trpc.useQuery(['user.getDetails']);
  const isSubbed = user?.userId === userDetails?.id && userDetails?.sub_status === 'active';

  const [pricingTimeRange, setPricingTimeRange] = useState<number>(1);
  const generateCheckout = trpc.useMutation('stripe.checkout');

  const checkoutWithReferral = useCallback(
    (type: number) => {
      generateCheckout.mutateAsync({ type, timeRange: pricingTimeRange }).then((res) => {
        res?.url ? router.push(res.url) : console.log('couldnt checkout');
      });
    },
    [generateCheckout, pricingTimeRange]
  );

  if (status === 'loading') {
    return null;
  }

  return (
    <div className="text-violet-400">
      <div className="pt-8">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <div className="mx-auto flex max-w-3xl flex-col items-center gap-2 lg:max-w-none">
            <div className="mb-4 inline-block rounded-2xl bg-white px-6 py-2 font-bold text-violet shadow-md">
              Pricing
            </div>

            <p className="text-3xl font-extrabold text-violet sm:text-4xl lg:text-5xl">
              Get Full Access
            </p>
            <p className="mx-auto text-xs  md:w-2/3 md:text-lg">
              Experience all the benefits our app has to offer for free, with the option to upgrade
              to premium features to support our development and gain access to additional features
            </p>

            <p className="text-xl text-violet-300">
              Full refund within 30 days if you don{`'`}t love it.
            </p>

            <div className="mb-4 mt-4 flex w-56 rounded-lg bg-grey-100 p-0.5">
              <button
                type="button"
                onClick={() => setPricingTimeRange(0)}
                className={
                  'relative w-1/2 whitespace-nowrap rounded-md border border-transparent p-2 font-medium text-gray-700 transition delay-75 ease-in-out ' +
                  (pricingTimeRange === 0 ? focusedPaymentStyle + 'animate-fade' : ' ')
                }
              >
                Monthly
              </button>
              <button
                type="button"
                onClick={() => setPricingTimeRange(1)}
                className={
                  'relative w-1/2 whitespace-nowrap rounded-md border border-transparent p-2 font-medium text-gray-700 transition delay-75 ease-in-out ' +
                  (pricingTimeRange === 1 ? focusedPaymentStyle + 'animate-fade' : ' ')
                }
              >
                Yearly
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 pb-12">
        <div className="">
          <div className=" mx-auto max-w-7xl flex-1 px-4 sm:px-6 lg:px-8">
            <div className="mx-auto flex max-w-md flex-col  items-stretch justify-center space-y-4 lg:max-w-5xl lg:flex-row lg:gap-5 lg:space-y-0">
              {tiers.map((tier) => (
                <div
                  key={tier.name}
                  className="flex w-full flex-col overflow-hidden rounded-b-lg rounded-tl-lg bg-gradient-to-tr from-slushi-500/10 to-violet-600/20 shadow-lg "
                >
                  <div className="px-6 py-8 sm:p-10 sm:pb-6">
                    <div>
                      <h3
                        className="inline-flex rounded-full bg-violet px-4 py-1 text-sm font-semibold uppercase tracking-wide text-white"
                        id="tier-standard"
                      >
                        {tier.name}
                      </h3>
                    </div>

                    <div className="mt-4 flex items-baseline text-6xl font-extrabold text-violet-400">
                      ${pricingTimeRange === 0 ? tier.priceMonthly : tier.priceYearly}
                      <span className="ml-1 text-2xl font-medium text-gray-400">/mo</span>
                    </div>

                    {pricingTimeRange === 1 ? (
                      <div className="text-violet-400">
                        {tier.priceMonthly > 0 ? (
                          <>Billed annually as ${tier.priceYearly * 12} </>
                        ) : (
                          <br />
                        )}
                      </div>
                    ) : (
                      <div className="text-violet-400">
                        {tier.priceMonthly > 0 ? (
                          <>Save {tier.savings}% by paying yearly </>
                        ) : (
                          <br />
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex h-full flex-1 flex-col justify-between space-y-6 px-6 pb-8 pt-6 sm:p-10 sm:pt-6">
                    <ul role="list" className="space-y-4">
                      {tier.features.map(({ label }) => (
                        <li key={label} className="flex items-start">
                          <div className="flex-shrink-0">
                            <AiOutlineCheck className="h-6 w-6 text-violet" aria-hidden="true" />
                          </div>
                          {label.includes('( Coming soon! )') ? (
                            <>
                              <p className="ml-3 text-violet-400">
                                {label.split('(')[0]}
                                <span className="text-violet-300">
                                  {label.substring(label.indexOf('('))}
                                </span>
                              </p>
                            </>
                          ) : (
                            <p className="ml-3 text-violet-400">{label}</p>
                          )}
                        </li>
                      ))}
                    </ul>

                    <div className="mx-auto w-80 rounded-md shadow hover:-translate-y-1 hover:scale-105 hover:bg-violet-600 hover:transition hover:duration-100 hover:ease-linear active:scale-90 ">
                      {user ? (
                        <button
                          disabled={user && isSubbed && tier.name === 'Premium'}
                          onClick={() => {
                            if (user && tier.name === 'Free') {
                              router.push('/clips');
                            }

                            if (user && tier.name === 'Premium') {
                              checkoutWithReferral(tier.type);
                            }
                          }}
                          className="flex w-full items-center justify-center rounded-b-lg rounded-tl-lg border border-transparent bg-violet px-5 py-3 text-lg font-bold text-white disabled:bg-violet/60 disabled:hover:cursor-not-allowed"
                          aria-describedby="tier-standard"
                        >
                          {tier.buttonText}
                        </button>
                      ) : (
                        <button
                          onClick={(e) => {
                            if (!user && tier.name === 'Free') {
                              e.preventDefault();
                              signIn('twitch', { callbackUrl: `/clips` });
                            }

                            if (!user && tier.name === 'Premium') {
                              e.preventDefault();
                              signIn('twitch', { callbackUrl: `/pricing` });
                            }
                          }}
                          className="flex w-full items-center justify-center gap-4 rounded-b-lg rounded-tl-lg  border border-transparent bg-violet px-5 py-3 text-lg font-bold text-white hover:bg-violet-600  disabled:hover:cursor-not-allowed"
                          aria-describedby="tier-standard"
                        >
                          <FiTwitch className="h-6 w-6" />
                          <span>{tier.buttonText}</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MotionWrap(Pricing);

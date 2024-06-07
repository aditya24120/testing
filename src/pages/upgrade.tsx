import UserLayout from '../components/UserLayout';
import { premiumFeatures } from '../utils/features';
import FeatureItem from '../components/FeatureItem';
import { useSession } from 'next-auth/react';
import { trpc } from '../utils/trpc';
import { useCallback, useState } from 'react';
import router from 'next/router';
import { tiers } from '../components/Pricing';
import { motion } from 'framer-motion';

const UpgradePage = () => {
  const { data: user } = useSession();
  const { data: userDetails, isLoading: getUserLoading } = trpc.useQuery(['user.getDetails']);
  // @ts-ignore
  const isSubbed = user?.userId === userDetails?.id && userDetails?.sub_status === 'active';
  const [pricingTimeRange, setPricingTimeRange] = useState<number>(1);
  const generateCheckout = trpc.useMutation('stripe.checkout');
  const prem = tiers[1];

  const checkoutWithReferral = useCallback(
    (type: number) => {
      generateCheckout.mutateAsync({ type, timeRange: pricingTimeRange }).then((res) => {
        res?.url ? router.push(res.url) : console.log('could not checkout');
      });
    },
    [generateCheckout, pricingTimeRange]
  );

  const focusedPaymentStyle = ' bg-violet border-gray-200 shadow-lg text-white ';

  if (getUserLoading) {
    return null;
  }

  return (
    <UserLayout>
      <div className="relative flex flex-wrap justify-center pb-6 md:pb-0">
        <section className="w-full md:w-1/2">
          <div className="container mx-auto px-6 py-10 ">
            <div className="lg:flex lg:items-center">
              <motion.div
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
                animate="visible"
                className="w-full space-y-8 "
              >
                <div className="mb-12">
                  <h1 className="text-3xl font-bold capitalize text-violet-400 lg:text-4xl">
                    <span className="text-violet">Gain</span> full access to our premium features!
                  </h1>

                  <div className="mt-2">
                    <span className="inline-block h-1 w-40 rounded-full bg-violet-400" />
                    <span className="ml-1 inline-block h-1 w-3 rounded-full bg-violet-400" />
                    <span className="ml-1 inline-block h-1 w-1 rounded-full bg-violet-400" />
                  </div>
                </div>

                {premiumFeatures.map((feature) => (
                  <FeatureItem feature={feature} />
                ))}
              </motion.div>
            </div>
          </div>
        </section>

        <motion.section
          whileInView={{ opacity: [0, 1] }}
          transition={{ duration: 0.5, delay: 1.4 }}
          className="flex flex-col items-center justify-center sm:w-full md:w-1/2"
        >
          <div className="mb-4 pt-8">
            <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
              <div className="mx-auto flex max-w-3xl flex-col items-center gap-2 lg:max-w-none">
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
                      (pricingTimeRange === 1 ? focusedPaymentStyle + 'animate-fade' : '')
                    }
                  >
                    Yearly
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="flex min-w-[340px] flex-col overflow-hidden rounded-b-lg rounded-tl-lg bg-gradient-to-tr from-slushi-500/10 to-violet-600/20 shadow-lg">
            <div className="bg-sidebar px-6 py-8 sm:p-10 sm:pb-6">
              <div>
                <h3
                  className="inline-flex rounded-full bg-violet px-4 py-1 text-sm font-semibold uppercase tracking-wide text-white"
                  id="tier-standard"
                >
                  {prem.name}
                </h3>
              </div>
              <div className="mt-4 flex items-baseline text-6xl font-extrabold text-violet-400">
                ${pricingTimeRange === 0 ? prem.priceMonthly : prem.priceYearly}
                <span className="ml-1 text-2xl font-medium text-gray-400">/mo</span>
              </div>

              {pricingTimeRange === 1 ? (
                <div className="text-violet-400">
                  {prem.priceMonthly > 0 ? (
                    <>Billed annually as ${prem.priceYearly * 12} </>
                  ) : (
                    <br />
                  )}
                </div>
              ) : (
                <div className="text-violet-400">
                  {prem.priceMonthly > 0 ? <>Save {prem.savings}% by paying yearly </> : <br />}
                </div>
              )}
            </div>

            <div className="bg-sidebar flex w-full flex-1 flex-col justify-between space-y-6 px-6 pb-8 pt-6 sm:p-10 sm:pt-6">
              {user && (
                <button
                  disabled={user && isSubbed}
                  onClick={() => {
                    if (user) {
                      checkoutWithReferral(1);
                    }
                  }}
                  className="w-75 flex w-full items-center justify-center rounded-md rounded-b-lg rounded-tl-lg rounded-tr-none border border-transparent bg-violet px-5 py-3 text-lg font-bold text-white shadow hover:-translate-y-1 hover:scale-105 hover:bg-violet-600 hover:transition hover:duration-100 hover:ease-linear active:scale-90 disabled:bg-violet/60 disabled:hover:cursor-not-allowed"
                  aria-describedby="tier-standard"
                >
                  Upgrade now
                </button>
              )}
            </div>
          </div>
        </motion.section>
      </div>
    </UserLayout>
  );
};
export default UpgradePage;

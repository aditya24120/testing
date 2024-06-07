import Layout from '../components/Layout';
import type { NextPage } from 'next';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import Pricing from '../components/Pricing';
import Faq from '../components/Faq';
import Features from '../components/home/Features';
import Hero from '../components/home/Hero';
import { homePageFeatures } from '../utils/features';
import Solution from '../components/home/Solution';
import FollowUs from '../components/home/FollowUs';

const Home: NextPage = () => {
  const { data: session } = useSession();
  const user = session?.user;

  const [showBetaPopup, setShowBetaPopup] = useState(false);

  useEffect(() => {
    if (localStorage.getItem('BetaPopup') !== 'true') {
      setShowBetaPopup(true);
    }
  }, []);

  return (
    <Layout>
      <Hero user={user} />
      <Solution />

      <div
        aria-hidden
        className="ripples h-40 w-full bg-gradient-to-b from-slushi-500/70 to-rose-500/70 opacity-30"
      />

      <Features premiumFeatures={homePageFeatures} />

      <div
        aria-hidden
        className="waves mb-10 hidden h-36 w-full rotate-180 bg-gradient-to-tr from-violet to-slushi-500/50 opacity-70 md:block"
      />

      <section className="container relative m-auto mb-20 hidden md:-mt-32 md:block">
        <FollowUs />
      </section>

      <section id="pricing" className="mb-20 h-full w-full lg:scroll-mt-24">
        <Pricing />
      </section>

      <Faq />
    </Layout>
  );
};

export default Home;

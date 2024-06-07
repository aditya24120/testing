import type { NextPage } from 'next';
import { useSession } from 'next-auth/react';
import { AiOutlineSchedule } from 'react-icons/ai';
import { useRouter } from 'next/router';
import Pricing from '../components/Pricing';
import Layout from '../components/Layout';

const PricingPage: NextPage = () => {
  return (
    <Layout>
      <div className="mx-auto flex items-center justify-center">
        <section className="w-full">
          <Pricing />
        </section>
      </div>
    </Layout>
  );
};

export default PricingPage;

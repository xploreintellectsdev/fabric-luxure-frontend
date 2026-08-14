import dynamic from 'next/dynamic';
import Hero from '../../../pages/home/Hero';
import Breath from '../../../pages/home/Breath';
import OurPicks from '../../../components/OurPicks';
const Shopbycategory = dynamic(() => import('../../../pages/home/Shopbycategory'));
const ShopbyTexturePatterns = dynamic(() => import('../../../pages/home/ShopbyTexturePatterns'));
const WhereComfortMeets = dynamic(() => import('../../../components/WhereComfortMeets'));
const ExclusiveSummerLinens = dynamic(() => import('../../../pages/home/ExclusiveSummerLinens'));
const WhyLinen = dynamic(() => import('../../../pages/home/WhyLinen'));
const WhoWeAre = dynamic(() => import('../../../pages/home/WhoWeAre'));
const OurPSC = dynamic(() => import('../../../components/OurPSC'));
const CustomersSay = dynamic(() => import('../../../components/CustomersSay'));
const WeBelieve = dynamic(() => import('../../../pages/home/WeBelieve'));
const FAQ = dynamic(() => import('../../../pages/home/FAQ'));

//px-6 sm:px-12 lg:px-16 py-8

function HomePage() {
    return (
        <>
            <Hero />
            <Breath />
            <OurPicks />
            <Shopbycategory />
            <ShopbyTexturePatterns />
            <WhereComfortMeets />
            <ExclusiveSummerLinens />
            <WhyLinen />
            <WhoWeAre />
            <OurPSC />
            <CustomersSay />
            <WeBelieve />
            <FAQ />
        </>
    )
}

export default HomePage

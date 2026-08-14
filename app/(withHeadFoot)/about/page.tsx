import dynamic from "next/dynamic";
import AboutHero from "../../../pages/about/AboutHero";
import WhereItBegin from "../../../pages/about/WhereItBegin";
const OurJourney = dynamic(() => import("../../../pages/about/OurJourney"));
const Whatwestandfor = dynamic(() => import("../../../pages/about/Whatwestandfor"));
const TheMaking = dynamic(() => import("../../../pages/about/TheMaking"));
const ThePeople = dynamic(() => import("../../../pages/about/ThePeople"));
const ExperienceTheLinen = dynamic(() => import("../../../pages/about/ExperienceTheLinen"));

function AboutPage() {
  return (
    <>
      <AboutHero />
      <WhereItBegin />
      {/* <OurJourney /> */}
      <Whatwestandfor />
      <TheMaking />
      <ThePeople />
      <ExperienceTheLinen />
    </>
  );
}

export default AboutPage;

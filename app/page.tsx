import HomePage from "./(withHeadFoot)/Home/page";
import Header from "../components/Header";
import Footer from "../components/Footer";

export default function Home() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center">
      <Header />
      <HomePage />
      <Footer />
    </div>
  );
}

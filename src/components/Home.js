import { ResumeProvider } from '../Context';
import Header from "./Layouts/Header";
import Navbar from './Layouts/Navbar';
import Footer from './Layouts/Footer';
import Main from "./Main";

function Home() {
    return (
        <>
            <ResumeProvider>
                <Navbar />
                <Header />
                <Main />
                <Footer />
            </ResumeProvider>
        </>
    );
}

export default Home;
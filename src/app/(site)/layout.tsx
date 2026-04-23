import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import BottomNav from "@/components/layout/BottomNav";
import TopBar from "@/components/ads/TopBar";
import { AuthProvider } from "@/context/AuthContext";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <TopBar />
      <Navbar />
      <main id="main-content" className="pb-16 md:pb-0">{children}</main>
      <Footer />
      <BottomNav />
    </AuthProvider>
  );
}

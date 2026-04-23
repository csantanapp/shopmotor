import PerfilSidebar from "@/components/layout/PerfilSidebar";
import PerfilMobileTabs from "@/components/layout/PerfilMobileTabs";

export default function PerfilLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-[calc(100vh-80px)]">
      <PerfilSidebar />
      <div className="flex-1 flex flex-col bg-surface overflow-auto">
        <PerfilMobileTabs />
        <main className="flex-1 p-4 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}

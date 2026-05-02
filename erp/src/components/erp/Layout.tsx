import { Sidebar } from "./Sidebar";
import { Header } from "./Header";

export function Layout({
  title, subtitle, action, children,
}: { title: string; subtitle?: string; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className="md:pl-64">
        <Header title={title} subtitle={subtitle} action={action} />
        <main className="p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}

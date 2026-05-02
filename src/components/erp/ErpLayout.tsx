import ErpSidebar from "./ErpSidebar";
import ErpHeader from "./ErpHeader";

export default function ErpLayout({
  title,
  subtitle,
  action,
  children,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#0f0f0f]">
      <ErpSidebar />
      <div className="md:pl-64">
        <ErpHeader title={title} subtitle={subtitle} action={action} />
        <main className="p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Icon from "@/components/ui/Icon";

const nav = [
  { href: "/admin",          icon: "dashboard",      label: "Dashboard"       },
  { href: "/admin/receita",  icon: "payments",       label: "Receita"         },
  { href: "/admin/usuarios", icon: "person",         label: "Usuários"        },
  { href: "/admin/lojas",    icon: "storefront",     label: "Lojas"           },
  { href: "/admin/seo",      icon: "travel_explore", label: "SEO"             },
  { href: "/admin/scripts",  icon: "code",           label: "Pixel & Scripts" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-[#0a0c0c] flex">
      {/* Sidebar */}
      <aside className="w-64 bg-[#111414] border-r border-white/5 flex flex-col fixed inset-y-0 left-0 z-40">
        <div className="p-6 border-b border-white/5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary-container rounded-lg flex items-center justify-center">
              <Icon name="admin_panel_settings" className="text-on-primary-container text-base" />
            </div>
            <div>
              <p className="text-white font-black text-sm tracking-tight">ShopMotor</p>
              <p className="text-[10px] text-neutral-500 font-medium uppercase tracking-widest">CMS Admin</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {nav.map(item => {
            const active = item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  active
                    ? "bg-primary-container text-on-primary-container"
                    : "text-neutral-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <Icon name={item.icon} className="text-lg" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/5">
          <Link href="/" className="flex items-center gap-2 text-xs text-neutral-500 hover:text-neutral-300 transition-colors">
            <Icon name="arrow_back" className="text-sm" />
            Voltar ao site
          </Link>
        </div>
      </aside>

      {/* Content */}
      <main className="flex-1 ml-64 min-h-screen">
        {children}
      </main>
    </div>
  );
}

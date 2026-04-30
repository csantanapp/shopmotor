"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Icon from "@/components/ui/Icon";

const items = [
  { label: "Home",     icon: "home",       href: "/"                  },
  { label: "Busca",    icon: "search",     href: "/busca"             },
  { label: "Anunciar", icon: "add_circle", href: "/perfil/cadastrar"  },
  { label: "Perfil",   icon: "person",     href: "/perfil"            },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 w-full bg-zinc-950 flex justify-around items-center pt-3 px-4 border-t border-zinc-800 z-50 shadow-[0_-4px_20px_rgba(0,0,0,0.5)]" style={{ paddingBottom: "max(1rem, env(safe-area-inset-bottom))" }}>
      {items.map((item) => {
        const active = pathname === item.href;
        return (
          <Link
            key={item.label}
            href={item.href}
            aria-label={item.label}
            className={`flex flex-col items-center justify-center rounded-lg p-1 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-container ${
              active ? "text-yellow-500" : "text-zinc-500"
            }`}
          >
            <Icon name={item.icon} fill={active} />
            <span className="text-[10px] font-medium uppercase tracking-widest mt-1">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

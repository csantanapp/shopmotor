"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Icon from "@/components/ui/Icon";

const tabs = [
  { icon: "list_alt",        label: "Anúncios",  href: "/perfil/meus-anuncios" },
  { icon: "directions_car",  label: "Cadastrar", href: "/perfil/cadastrar"  },
  { icon: "chat_bubble",     label: "Msgs",      href: "/perfil/mensagens"  },
  { icon: "favorite",        label: "Favoritos", href: "/perfil/favoritos"  },
  { icon: "person",          label: "Conta",     href: "/perfil/conta"      },
  { icon: "help",            label: "Ajuda",     href: "/perfil/ajuda"      },
];

export default function PerfilMobileTabs() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Navegação do perfil"
      className="md:hidden flex overflow-x-auto scrollbar-hide border-b border-neutral-200 bg-surface-container-lowest sticky top-[64px] z-40 -mx-4 px-4"
    >
      <div className="flex gap-1 py-2 min-w-max">
        {tabs.map((tab) => {
          const active = pathname === tab.href;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              aria-current={active ? "page" : undefined}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-container ${
                active
                  ? "bg-primary-container text-on-primary-container"
                  : "text-on-surface-variant hover:bg-surface-container"
              }`}
            >
              <Icon name={tab.icon} className="text-base" />
              {tab.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

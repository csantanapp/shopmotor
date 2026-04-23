"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Icon from "@/components/ui/Icon";

export default function HeroSearch() {
  const [query, setQuery] = useState("");
  const router = useRouter();

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (query.trim()) params.set("q", query.trim());
    router.push(`/busca${params.size ? `?${params}` : ""}`);
  };

  return (
    <div className="bg-surface-container-lowest rounded-2xl p-2 shadow-2xl flex flex-col md:flex-row gap-2 w-full max-w-2xl">
      <div className="flex items-center gap-3 flex-1 px-4">
        <Icon name="search" className="text-outline text-xl flex-shrink-0" />
        <input
          className="w-full border-none focus:ring-0 bg-transparent py-3 text-base outline-none placeholder:text-outline"
          placeholder="Marca, modelo ou versão..."
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
        />
      </div>
      <button
        onClick={handleSearch}
        className="bg-primary-container hover:bg-primary-fixed-dim text-on-primary-container font-black px-8 py-4 rounded-xl transition-all flex items-center justify-center gap-2 text-sm uppercase tracking-widest whitespace-nowrap"
      >
        Buscar oferta
        <Icon name="arrow_forward" />
      </button>
    </div>
  );
}

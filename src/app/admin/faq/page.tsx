"use client";

import { useEffect, useState } from "react";
import Icon from "@/components/ui/Icon";

interface FaqItem {
  id: string; categoria: string; pergunta: string; resposta: string;
  ordem: number; ativo: boolean; pagina: string;
}

const EMPTY: Omit<FaqItem, "id"> = {
  categoria: "", pergunta: "", resposta: "",
  ordem: 0, ativo: true, pagina: "faq",
};

const PAGINAS = [
  { value: "faq",   label: "FAQ (/faq)" },
  { value: "ads",   label: "Impulsionamento (/ads)" },
  { value: "ambas", label: "Ambas as páginas" },
];

export default function AdminFaq() {
  const [items, setItems]       = useState<FaqItem[]>([]);
  const [loading, setLoading]   = useState(true);
  const [modal, setModal]       = useState(false);
  const [form, setForm]         = useState<Omit<FaqItem, "id">>(EMPTY);
  const [editId, setEditId]     = useState<string | null>(null);
  const [saving, setSaving]     = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [filter, setFilter]     = useState("");

  async function load() {
    setLoading(true);
    const r = await fetch("/api/admin/faq");
    const d = await r.json();
    setItems(d.items ?? []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  function openNew() {
    setForm(EMPTY);
    setEditId(null);
    setModal(true);
  }

  function openEdit(item: FaqItem) {
    const { id, ...rest } = item;
    setForm(rest);
    setEditId(id);
    setModal(true);
  }

  async function handleSave() {
    setSaving(true);
    if (editId) {
      await fetch("/api/admin/faq", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: editId, ...form }),
      });
    } else {
      await fetch("/api/admin/faq", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
    }
    setSaving(false);
    setModal(false);
    load();
  }

  async function handleDelete(id: string) {
    if (!confirm("Excluir esta pergunta?")) return;
    setDeleting(id);
    await fetch("/api/admin/faq", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    setDeleting(null);
    load();
  }

  async function toggleAtivo(item: FaqItem) {
    await fetch("/api/admin/faq", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: item.id, ativo: !item.ativo }),
    });
    load();
  }

  const filtered = items.filter(i =>
    !filter ||
    i.categoria.toLowerCase().includes(filter.toLowerCase()) ||
    i.pergunta.toLowerCase().includes(filter.toLowerCase())
  );

  // Agrupar por pagina + categoria
  const grouped: Record<string, FaqItem[]> = {};
  for (const item of filtered) {
    const key = `${item.pagina}__${item.categoria}`;
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(item);
  }

  const paginaLabel = (p: string) => PAGINAS.find(x => x.value === p)?.label ?? p;

  return (
    <div className="p-6 lg:p-8 space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white">FAQ</h1>
          <p className="text-neutral-500 text-sm mt-1">{items.length} perguntas cadastradas</p>
        </div>
        <button
          onClick={openNew}
          className="flex items-center gap-2 bg-primary-container text-on-primary-container font-black px-5 py-2.5 rounded-full text-sm uppercase tracking-widest hover:-translate-y-0.5 transition-all"
        >
          <Icon name="add" className="text-base" />
          Nova pergunta
        </button>
      </div>

      {/* Busca */}
      <div className="flex items-center gap-2 bg-[#111414] border border-white/5 rounded-xl px-4 py-2.5 max-w-sm">
        <Icon name="search" className="text-neutral-500 text-lg" />
        <input
          className="bg-transparent outline-none text-sm text-white placeholder:text-neutral-600 w-full"
          placeholder="Buscar pergunta ou categoria..."
          value={filter}
          onChange={e => setFilter(e.target.value)}
        />
      </div>

      {/* Lista agrupada */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <span className="w-8 h-8 border-2 border-white/10 border-t-white/40 rounded-full animate-spin" />
        </div>
      ) : Object.keys(grouped).length === 0 ? (
        <div className="text-center py-20 text-neutral-600">
          <Icon name="quiz" className="text-5xl mb-3 block mx-auto" />
          <p>Nenhuma pergunta cadastrada. Clique em "Nova pergunta" para começar.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped).map(([key, groupItems]) => {
            const [pagina, categoria] = key.split("__");
            return (
              <div key={key} className="bg-[#111414] border border-white/5 rounded-2xl overflow-hidden">
                <div className="px-6 py-3 border-b border-white/5 flex items-center gap-3">
                  <span className="text-xs font-black uppercase tracking-widest text-neutral-500">{categoria}</span>
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-white/5 text-neutral-400">
                    {paginaLabel(pagina)}
                  </span>
                </div>
                <div className="divide-y divide-white/5">
                  {groupItems.map(item => (
                    <div key={item.id} className="px-6 py-4 flex items-start gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className={`text-sm font-semibold ${item.ativo ? "text-white" : "text-neutral-600 line-through"}`}>
                            {item.pergunta}
                          </p>
                          <span className="text-[10px] text-neutral-600">#{item.ordem}</span>
                        </div>
                        <p className="text-xs text-neutral-500 leading-relaxed line-clamp-2">{item.resposta}</p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <button
                          onClick={() => toggleAtivo(item)}
                          className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                            item.ativo ? "bg-green-500/10 text-green-400" : "bg-white/5 text-neutral-600"
                          }`}
                          title={item.ativo ? "Desativar" : "Ativar"}
                        >
                          <Icon name={item.ativo ? "visibility" : "visibility_off"} className="text-sm" />
                        </button>
                        <button
                          onClick={() => openEdit(item)}
                          className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
                        >
                          <Icon name="edit" className="text-sm text-neutral-400" />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          disabled={deleting === item.id}
                          className="w-8 h-8 rounded-lg bg-red-500/10 hover:bg-red-500/20 flex items-center justify-center transition-colors disabled:opacity-50"
                        >
                          <Icon name="delete" className="text-sm text-red-400" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#111414] border border-white/10 rounded-2xl w-full max-w-lg p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h2 className="font-black text-white">{editId ? "Editar pergunta" : "Nova pergunta"}</h2>
              <button onClick={() => setModal(false)} className="text-neutral-500 hover:text-white">
                <Icon name="close" className="text-xl" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-black uppercase tracking-widest text-neutral-500 block mb-2">Página</label>
                  <select
                    value={form.pagina}
                    onChange={e => setForm(f => ({ ...f, pagina: e.target.value }))}
                    className="w-full bg-[#1a1e1e] border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white outline-none"
                  >
                    {PAGINAS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-black uppercase tracking-widest text-neutral-500 block mb-2">Ordem</label>
                  <input
                    type="number"
                    value={form.ordem}
                    onChange={e => setForm(f => ({ ...f, ordem: Number(e.target.value) }))}
                    className="w-full bg-[#1a1e1e] border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-black uppercase tracking-widest text-neutral-500 block mb-2">Categoria</label>
                <input
                  value={form.categoria}
                  onChange={e => setForm(f => ({ ...f, categoria: e.target.value }))}
                  placeholder="Ex: Geral, Anúncios, Pagamentos..."
                  className="w-full bg-[#1a1e1e] border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white outline-none placeholder:text-neutral-600"
                />
              </div>

              <div>
                <label className="text-xs font-black uppercase tracking-widest text-neutral-500 block mb-2">Pergunta</label>
                <input
                  value={form.pergunta}
                  onChange={e => setForm(f => ({ ...f, pergunta: e.target.value }))}
                  placeholder="Digite a pergunta..."
                  className="w-full bg-[#1a1e1e] border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white outline-none placeholder:text-neutral-600"
                />
              </div>

              <div>
                <label className="text-xs font-black uppercase tracking-widest text-neutral-500 block mb-2">Resposta</label>
                <textarea
                  value={form.resposta}
                  onChange={e => setForm(f => ({ ...f, resposta: e.target.value }))}
                  rows={5}
                  placeholder="Digite a resposta completa..."
                  className="w-full bg-[#1a1e1e] border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white outline-none placeholder:text-neutral-600 resize-none"
                />
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setForm(f => ({ ...f, ativo: !f.ativo }))}
                  className={`relative w-10 h-6 rounded-full transition-colors ${form.ativo ? "bg-green-500" : "bg-white/10"}`}
                >
                  <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${form.ativo ? "left-4" : "left-0.5"}`} />
                </button>
                <span className="text-sm text-neutral-400">Pergunta ativa (visível no site)</span>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setModal(false)}
                className="flex-1 py-3 rounded-full border border-white/10 text-sm text-neutral-400 hover:bg-white/5 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !form.categoria || !form.pergunta || !form.resposta}
                className="flex-1 py-3 rounded-full bg-primary-container text-on-primary-container text-sm font-black uppercase tracking-widest hover:-translate-y-0.5 transition-all disabled:opacity-60"
              >
                {saving ? "Salvando..." : editId ? "Salvar" : "Criar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

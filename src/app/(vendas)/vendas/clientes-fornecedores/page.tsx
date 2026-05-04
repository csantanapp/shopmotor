"use client";

import { useState, useEffect, useCallback } from "react";
import ErpLayout from "@/components/erp/ErpLayout";
import ErpKpiCard from "@/components/erp/ErpKpiCard";
import Icon from "@/components/ui/Icon";
import Link from "next/link";

interface Cliente {
  id: string;
  tipo: string;
  categoria: string;
  nome: string;
  documento: string;
  telefone?: string;
  email?: string;
  cidade?: string;
  estado?: string;
  createdAt: string;
  _count: { vehicles: number };
}

function maskPhone(v: string) {
  const d = v.replace(/\D/g, "").slice(0, 11);
  if (d.length <= 10) return d.replace(/(\d{2})(\d{4})(\d{0,4})/, "($1) $2-$3").replace(/-$/, "");
  return d.replace(/(\d{2})(\d{5})(\d{0,4})/, "($1) $2-$3").replace(/-$/, "");
}

const EMPTY = { tipo: "PF", categoria: "CLIENTE", nome: "", documento: "", telefone: "", email: "", endereco: "", cidade: "", estado: "", cep: "" };

const iCls = "w-full border border-black/10 bg-white rounded-xl p-3 text-sm focus:ring-2 focus:ring-primary-container outline-none";

function MField({ label, className, children }: { label: string; className?: string; children: React.ReactNode }) {
  return (
    <div className={`flex flex-col gap-1.5 ${className ?? ""}`}>
      <label className="text-[11px] font-black uppercase tracking-wider text-gray-400">{label}</label>
      {children}
    </div>
  );
}

function ModalForm({ form, setF }: { form: Record<string, string>; setF: (f: string, v: string) => void }) {
  return (
    <div className="space-y-4">
      {/* Categoria */}
      <div className="flex gap-3">
        {[{ v: "CLIENTE", l: "Cliente" }, { v: "FORNECEDOR", l: "Fornecedor" }, { v: "AMBOS", l: "Ambos" }].map(({ v, l }) => (
          <label key={v} className="flex items-center gap-2 cursor-pointer">
            <input type="radio" checked={form.categoria === v} onChange={() => setF("categoria", v)} className="w-4 h-4 accent-yellow-500" />
            <span className="text-sm font-medium text-gray-700">{l}</span>
          </label>
        ))}
      </div>

      {/* Tipo */}
      <div className="flex gap-4">
        {[{ v: "PF", l: "Pessoa Física" }, { v: "PJ", l: "Pessoa Jurídica" }].map(({ v, l }) => (
          <label key={v} className="flex items-center gap-2 cursor-pointer">
            <input type="radio" checked={form.tipo === v} onChange={() => setF("tipo", v)} className="w-4 h-4 accent-yellow-500" />
            <span className="text-sm font-medium text-gray-700">{l}</span>
          </label>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <MField label="Nome *" className="md:col-span-2">
          <input type="text" value={form.nome} onChange={e => setF("nome", e.target.value)}
            className={iCls} placeholder="Nome completo" />
        </MField>
        <MField label={form.tipo === "PF" ? "CPF *" : "CNPJ *"}>
          <input type="text" value={form.documento} onChange={e => setF("documento", e.target.value)}
            className={iCls} placeholder={form.tipo === "PF" ? "000.000.000-00" : "00.000.000/0000-00"} />
        </MField>
        <MField label="Telefone">
          <input type="tel" value={form.telefone ?? ""}
            onChange={e => setF("telefone", maskPhone(e.target.value))}
            className={iCls} placeholder="(00) 00000-0000" maxLength={15} />
        </MField>
        <MField label="E-mail" className="md:col-span-2">
          <input type="email" value={form.email ?? ""} onChange={e => setF("email", e.target.value)}
            className={iCls} placeholder="email@exemplo.com" />
        </MField>
        <MField label="Endereço" className="md:col-span-2">
          <input type="text" value={form.endereco ?? ""} onChange={e => setF("endereco", e.target.value)}
            className={iCls} placeholder="Rua, número, complemento" />
        </MField>
        <MField label="Cidade">
          <input type="text" value={form.cidade ?? ""} onChange={e => setF("cidade", e.target.value)}
            className={iCls} placeholder="São Paulo" />
        </MField>
        <MField label="Estado">
          <input type="text" value={form.estado ?? ""} onChange={e => setF("estado", e.target.value.toUpperCase().slice(0, 2))}
            className={iCls} placeholder="SP" maxLength={2} />
        </MField>
        <MField label="CEP">
          <input type="text" value={form.cep ?? ""} onChange={e => setF("cep", e.target.value.replace(/\D/g, "").replace(/(\d{5})(\d{0,3})/, "$1-$2").slice(0, 9))}
            className={iCls} placeholder="00000-000" />
        </MField>
      </div>
    </div>
  );
}

/* ── table ── */
function ItemTable({ items }: { items: Cliente[] }) {
  if (items.length === 0) return (
    <p className="text-sm text-gray-400 py-6 text-center">Nenhum cadastro nesta categoria.</p>
  );
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="text-xs uppercase tracking-wider text-gray-400 border-b border-black/10">
          <tr>
            {["Nome","Tipo","CPF / CNPJ","Telefone","E-mail","Cidade","Vínculos",""].map(h => (
              <th key={h} className="px-4 py-3 text-left font-black whitespace-nowrap">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-black/5">
          {items.map(c => (
            <tr key={c.id} className="hover:bg-gray-50 transition">
              <td className="px-4 py-4">
                <p className="font-black text-gray-900">{c.nome}</p>
                <p className="text-xs text-gray-400">{new Date(c.createdAt).toLocaleDateString("pt-BR")}</p>
              </td>
              <td className="px-4 py-4">
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-black border ${c.tipo === "PJ" ? "bg-blue-50 text-blue-700 border-blue-200" : "bg-gray-50 text-gray-600 border-gray-200"}`}>
                  {c.tipo}
                </span>
              </td>
              <td className="px-4 py-4 text-gray-700 font-mono text-xs">{c.documento}</td>
              <td className="px-4 py-4 text-gray-600">{c.telefone ?? "—"}</td>
              <td className="px-4 py-4 text-gray-600 max-w-[160px] truncate">{c.email ?? "—"}</td>
              <td className="px-4 py-4 text-gray-500">{c.cidade ? `${c.cidade}${c.estado ? `/${c.estado}` : ""}` : "—"}</td>
              <td className="px-4 py-4">
                {c._count.vehicles > 0 ? (
                  <span className="rounded-full bg-yellow-50 text-yellow-700 border border-yellow-200 px-2 py-0.5 text-[10px] font-black">
                    {c._count.vehicles} veículo{c._count.vehicles !== 1 ? "s" : ""}
                  </span>
                ) : <span className="text-xs text-gray-400">—</span>}
              </td>
              <td className="px-4 py-4">
                <Link href={`/vendas/clientes-fornecedores/${c.id}`}
                  className="flex items-center gap-1 rounded-lg border border-black/10 px-3 py-1.5 text-xs font-black text-gray-600 hover:bg-gray-50 transition whitespace-nowrap">
                  <Icon name="edit" className="text-xs" /> Ver ficha
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ── section header ── */
function SectionHeader({ icon, title, color, count }: { icon: string; title: string; color: string; count: number }) {
  return (
    <div className={`flex items-center gap-3 px-5 py-3 rounded-t-xl border-b border-black/10 ${color}`}>
      <Icon name={icon} className="text-lg" />
      <h2 className="font-black text-gray-900">{title}</h2>
      <span className="ml-auto text-xs font-black text-gray-500 bg-white/60 rounded-full px-2 py-0.5">{count}</span>
    </div>
  );
}

/* ── page ── */
export default function ClientesFornecedoresPage() {
  const [items, setItems]         = useState<Cliente[]>([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState("");
  const [toast, setToast]         = useState("");
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving]       = useState(false);
  const [form, setForm]           = useState({ ...EMPTY });

  const fire = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 3000); };

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/perfil/clientes-fornecedores");
    const data = await res.json();
    setItems(data.items ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  function setF(field: string, value: string) { setForm(f => ({ ...f, [field]: value })); }

  async function handleSave() {
    if (!form.nome || !form.documento) { fire("Nome e documento são obrigatórios."); return; }
    setSaving(true);
    const res = await fetch("/api/perfil/clientes-fornecedores", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) { fire(data.error ?? "Erro ao salvar."); return; }
    fire("Cadastro realizado!");
    setShowModal(false);
    setForm({ ...EMPTY });
    await load();
  }

  const q = search.toLowerCase();
  const filterFn = (i: Cliente) =>
    !q ||
    i.nome.toLowerCase().includes(q) ||
    i.documento.includes(q) ||
    (i.email ?? "").toLowerCase().includes(q);

  const clientes    = items.filter(i => (i.categoria === "CLIENTE" || i.categoria === "AMBOS") && filterFn(i));
  const fornecedores = items.filter(i => (i.categoria === "FORNECEDOR" || i.categoria === "AMBOS") && filterFn(i));

  return (
    <ErpLayout title="Clientes / Fornecedores" subtitle="Cadastro de clientes e fornecedores da sua loja">
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 rounded-xl bg-gray-900 px-4 py-3 text-sm text-white shadow-2xl">{toast}</div>
      )}

      {/* Modal novo */}
      {showModal && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 p-4" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-6 border-b border-black/10">
              <p className="font-black text-gray-900">Novo Cadastro</p>
              <button onClick={() => setShowModal(false)} className="p-1 rounded-lg hover:bg-gray-100">
                <Icon name="close" className="text-gray-500" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <ModalForm form={form} setF={setF} />
            </div>
            <div className="flex gap-3 p-6 border-t border-black/10">
              <button onClick={handleSave} disabled={saving}
                className="flex-1 flex items-center justify-center gap-2 bg-primary-container text-black py-3 rounded-xl font-black text-sm hover:opacity-90 transition disabled:opacity-50">
                {saving && <span className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />}
                Salvar
              </button>
              <button onClick={() => setShowModal(false)}
                className="px-6 py-3 rounded-xl border border-black/10 text-sm text-gray-500 hover:bg-gray-50">
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* KPIs */}
      <div className="grid gap-4 md:grid-cols-4 mb-6">
        <ErpKpiCard label="Total" value={String(items.length)} icon="people" />
        <ErpKpiCard label="Clientes" value={String(items.filter(i => i.categoria === "CLIENTE" || i.categoria === "AMBOS").length)} icon="person" />
        <ErpKpiCard label="Fornecedores" value={String(items.filter(i => i.categoria === "FORNECEDOR" || i.categoria === "AMBOS").length)} icon="business" />
        <ErpKpiCard label="Pessoa Jurídica" value={String(items.filter(i => i.tipo === "PJ").length)} icon="store" />
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Icon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Buscar por nome, CPF/CNPJ ou e-mail..."
            className="w-full border border-black/10 bg-white rounded-xl pl-9 pr-4 py-2 text-sm focus:ring-2 focus:ring-primary-container outline-none" />
        </div>
        <button onClick={() => { setForm({ ...EMPTY }); setShowModal(true); }}
          className="flex items-center gap-2 bg-primary-container text-black px-5 py-2 rounded-xl font-black text-sm hover:opacity-90 transition">
          <Icon name="add" className="text-base" /> Novo cadastro
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <span className="h-8 w-8 rounded-full border-2 border-primary-container/30 border-t-primary-container animate-spin" />
        </div>
      ) : (
        <div className="space-y-6">

          {/* Clientes */}
          <div className="rounded-xl border border-black/10 bg-white shadow-sm overflow-hidden">
            <SectionHeader icon="person" title="Clientes" color="bg-blue-50" count={clientes.length} />
            <ItemTable items={clientes} />
          </div>

          {/* Fornecedores */}
          <div className="rounded-xl border border-black/10 bg-white shadow-sm overflow-hidden">
            <SectionHeader icon="business" title="Fornecedores" color="bg-orange-50" count={fornecedores.length} />
            <ItemTable items={fornecedores} />
          </div>

        </div>
      )}
    </ErpLayout>
  );
}

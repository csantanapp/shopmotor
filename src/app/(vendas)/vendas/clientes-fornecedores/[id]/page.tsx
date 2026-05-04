"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import ErpLayout from "@/components/erp/ErpLayout";
import Icon from "@/components/ui/Icon";
import Link from "next/link";

interface Aquisicao {
  proveniencia: string;
  vehicle: { id: string; brand: string; model: string; version?: string; yearFab: number; price: number; status: string };
}

interface Cliente {
  id: string; tipo: string; nome: string; documento: string;
  telefone?: string; email?: string; endereco?: string;
  cidade?: string; estado?: string; cep?: string;
  createdAt: string; updatedAt: string;
  vehicles: Aquisicao[];
}

const iCls = "w-full border border-black/10 bg-white rounded-xl p-3 text-sm focus:ring-2 focus:ring-primary-container outline-none";

function maskPhone(v: string) {
  const d = v.replace(/\D/g, "").slice(0, 11);
  if (d.length <= 10) return d.replace(/(\d{2})(\d{4})(\d{0,4})/, "($1) $2-$3").replace(/-$/, "");
  return d.replace(/(\d{2})(\d{5})(\d{0,4})/, "($1) $2-$3").replace(/-$/, "");
}

function Field({ label, className, children }: { label: string; className?: string; children: React.ReactNode }) {
  return (
    <div className={`flex flex-col gap-1.5 ${className ?? ""}`}>
      <label className="text-[11px] font-black uppercase tracking-wider text-gray-400">{label}</label>
      {children}
    </div>
  );
}

export default function ClienteDetailPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const router = useRouter();

  const [item, setItem]       = useState<Cliente | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [toast, setToast]     = useState("");
  const [confirm, setConfirm] = useState(false);

  const [form, setForm] = useState({
    tipo: "PF", categoria: "CLIENTE", nome: "", documento: "", telefone: "",
    email: "", endereco: "", cidade: "", estado: "", cep: "",
  });

  const fire = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 3000); };

  function setF(field: string, value: string) { setForm(f => ({ ...f, [field]: value })); }

  useEffect(() => {
    fetch(`/api/perfil/clientes-fornecedores/${id}`)
      .then(r => r.json())
      .then(d => {
        if (!d.item) { router.push("/vendas/clientes-fornecedores"); return; }
        setItem(d.item);
        const v = d.item;
        setForm({
          tipo:      v.tipo      ?? "PF",
          categoria: v.categoria ?? "CLIENTE",
          nome:      v.nome      ?? "",
          documento: v.documento ?? "",
          telefone:  v.telefone  ?? "",
          email:     v.email     ?? "",
          endereco:  v.endereco  ?? "",
          cidade:    v.cidade    ?? "",
          estado:    v.estado    ?? "",
          cep:       v.cep       ?? "",
        });
        setLoading(false);
      })
      .catch(() => router.push("/vendas/clientes-fornecedores"));
  }, [id, router]);

  async function handleSave() {
    if (!form.nome || !form.documento) { fire("Nome e documento são obrigatórios."); return; }
    setSaving(true);
    const res = await fetch(`/api/perfil/clientes-fornecedores/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setSaving(false);
    if (res.ok) { fire("Cadastro atualizado!"); }
    else { const d = await res.json(); fire(d.error ?? "Erro ao salvar."); }
  }

  async function handleDelete() {
    setDeleting(true);
    await fetch(`/api/perfil/clientes-fornecedores/${id}`, { method: "DELETE" });
    router.push("/vendas/clientes-fornecedores");
  }

  const statusCls: Record<string, string> = {
    ACTIVE: "bg-green-100 text-green-700",
    SOLD:   "bg-gray-100 text-gray-500",
    DRAFT:  "bg-yellow-100 text-yellow-700",
    PAUSED: "bg-orange-100 text-orange-700",
  };

  return (
    <ErpLayout
      title={loading ? "Ficha Cadastral" : form.nome}
      subtitle={loading ? "" : `${form.categoria === "CLIENTE" ? "Cliente" : form.categoria === "FORNECEDOR" ? "Fornecedor" : "Cliente / Fornecedor"} · ${form.tipo === "PF" ? "Pessoa Física" : "Pessoa Jurídica"} · ${form.documento}`}
    >
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 rounded-xl bg-gray-900 px-4 py-3 text-sm text-white shadow-2xl">{toast}</div>
      )}

      <div className="mb-6">
        <button onClick={() => router.push("/vendas/clientes-fornecedores")}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition">
          <Icon name="arrow_back" className="text-base" /> Voltar
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-32">
          <span className="h-8 w-8 rounded-full border-2 border-primary-container/30 border-t-primary-container animate-spin" />
        </div>
      ) : (
        <div className="max-w-2xl space-y-6">

          {/* Ficha */}
          <div className="rounded-xl border border-black/10 bg-white p-6 shadow-sm space-y-5">
            <h2 className="font-black text-gray-900 border-b border-black/5 pb-4">Dados cadastrais</h2>

            {/* Categoria */}
            <div className="flex gap-4">
              {[{ v: "CLIENTE", l: "Cliente" }, { v: "FORNECEDOR", l: "Fornecedor" }, { v: "AMBOS", l: "Ambos" }].map(({ v, l }) => (
                <label key={v} className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" checked={form.categoria === v} onChange={() => setF("categoria", v)} className="w-4 h-4 accent-yellow-500" />
                  <span className="text-sm font-medium text-gray-700">{l}</span>
                </label>
              ))}
            </div>

            {/* Tipo */}
            <div className="flex gap-6">
              {[{ v: "PF", l: "Pessoa Física" }, { v: "PJ", l: "Pessoa Jurídica" }].map(({ v, l }) => (
                <label key={v} className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" checked={form.tipo === v} onChange={() => setF("tipo", v)} className="w-4 h-4 accent-yellow-500" />
                  <span className="text-sm font-medium text-gray-700">{l}</span>
                </label>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Nome *" className="md:col-span-2">
                <input type="text" value={form.nome} onChange={e => setF("nome", e.target.value)} className={iCls} placeholder="Nome completo" />
              </Field>
              <Field label={form.tipo === "PF" ? "CPF *" : "CNPJ *"}>
                <input type="text" value={form.documento} onChange={e => setF("documento", e.target.value)} className={iCls}
                  placeholder={form.tipo === "PF" ? "000.000.000-00" : "00.000.000/0000-00"} />
              </Field>
              <Field label="Telefone">
                <input type="tel" value={form.telefone} onChange={e => setF("telefone", maskPhone(e.target.value))}
                  className={iCls} placeholder="(00) 00000-0000" maxLength={15} />
              </Field>
              <Field label="E-mail" className="md:col-span-2">
                <input type="email" value={form.email} onChange={e => setF("email", e.target.value)}
                  className={iCls} placeholder="email@exemplo.com" />
              </Field>
              <Field label="Endereço" className="md:col-span-2">
                <input type="text" value={form.endereco} onChange={e => setF("endereco", e.target.value)}
                  className={iCls} placeholder="Rua, número, complemento" />
              </Field>
              <Field label="Cidade">
                <input type="text" value={form.cidade} onChange={e => setF("cidade", e.target.value)}
                  className={iCls} placeholder="São Paulo" />
              </Field>
              <Field label="Estado">
                <input type="text" value={form.estado} onChange={e => setF("estado", e.target.value.toUpperCase().slice(0, 2))}
                  className={iCls} placeholder="SP" maxLength={2} />
              </Field>
              <Field label="CEP">
                <input type="text" value={form.cep}
                  onChange={e => setF("cep", e.target.value.replace(/\D/g, "").replace(/(\d{5})(\d{0,3})/, "$1-$2").slice(0, 9))}
                  className={iCls} placeholder="00000-000" />
              </Field>
            </div>

            <div className="flex gap-3 pt-2">
              <button onClick={handleSave} disabled={saving}
                className="flex items-center gap-2 bg-primary-container text-black px-8 py-2.5 rounded-xl font-black text-sm hover:opacity-90 transition disabled:opacity-50">
                {saving && <span className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />}
                <Icon name="save" className="text-sm" /> Salvar alterações
              </button>
              {item?.telefone && (
                <a href={`https://wa.me/55${item.telefone.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 rounded-xl bg-green-500 px-5 py-2.5 text-sm font-black text-white hover:opacity-90 transition">
                  <Icon name="chat" className="text-sm" /> WhatsApp
                </a>
              )}
            </div>
          </div>

          {/* Veículos vinculados */}
          {item && item.vehicles.length > 0 && (
            <div className="rounded-xl border border-black/10 bg-white p-6 shadow-sm space-y-4">
              <h2 className="font-black text-gray-900 border-b border-black/5 pb-4">
                Veículos vinculados <span className="text-gray-400 font-normal text-sm">({item.vehicles.length})</span>
              </h2>
              <div className="space-y-3">
                {item.vehicles.map((a, i) => (
                  <div key={i} className="flex items-center justify-between gap-3 rounded-xl border border-black/5 bg-gray-50 px-4 py-3">
                    <div className="min-w-0 flex-1">
                      <p className="font-black text-gray-900 text-sm">{a.vehicle.brand} {a.vehicle.model} {a.vehicle.version} {a.vehicle.yearFab}</p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {a.proveniencia.charAt(0) + a.proveniencia.slice(1).toLowerCase()} · R$ {a.vehicle.price?.toLocaleString("pt-BR")}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-black ${statusCls[a.vehicle.status] ?? "bg-gray-100 text-gray-500"}`}>
                        {a.vehicle.status}
                      </span>
                      <Link href={`/vendas/veiculos/editar/${a.vehicle.id}`}
                        className="rounded-lg border border-black/10 px-3 py-1 text-xs font-black text-gray-600 hover:bg-white transition">
                        Editar
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Meta */}
          {item && (
            <div className="rounded-xl border border-black/10 bg-white p-5 shadow-sm text-xs text-gray-400 flex justify-between">
              <span>Cadastrado em {new Date(item.createdAt).toLocaleDateString("pt-BR")}</span>
              <span>Atualizado em {new Date(item.updatedAt).toLocaleDateString("pt-BR")}</span>
            </div>
          )}

          {/* Danger zone */}
          <div className="rounded-xl border border-red-100 bg-red-50 p-5 space-y-3">
            <p className="font-black text-red-800 text-sm">Zona de perigo</p>
            {!confirm ? (
              <button onClick={() => setConfirm(true)}
                className="flex items-center gap-2 rounded-xl border border-red-200 px-5 py-2 text-sm font-black text-red-600 hover:bg-red-100 transition">
                <Icon name="delete" className="text-sm" /> Excluir cadastro
              </button>
            ) : (
              <div className="flex items-center gap-3">
                <p className="text-sm text-red-700">Tem certeza? Esta ação não pode ser desfeita.</p>
                <button onClick={handleDelete} disabled={deleting}
                  className="flex items-center gap-1 bg-red-600 text-white px-4 py-2 rounded-xl text-sm font-black hover:bg-red-700 transition disabled:opacity-50">
                  {deleting && <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                  Confirmar
                </button>
                <button onClick={() => setConfirm(false)} className="text-sm text-gray-500 hover:text-gray-700">Cancelar</button>
              </div>
            )}
          </div>
        </div>
      )}
    </ErpLayout>
  );
}

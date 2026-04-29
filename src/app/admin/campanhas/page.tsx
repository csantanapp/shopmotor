"use client";

import { useEffect, useState } from "react";
import Icon from "@/components/ui/Icon";

type Coupon = {
  id: string; code: string; description?: string;
  discountType: string; discountValue: number;
  maxUses?: number; usesCount: number;
  validFrom?: string; validUntil?: string; active: boolean;
  _count?: { uses: number };
};

const EMPTY_FORM = {
  code: "", description: "", discountType: "percent", discountValue: "",
  maxUses: "", validFrom: "", validUntil: "", active: true,
};

function toLocalDate(iso?: string) {
  if (!iso) return "";
  return new Date(iso).toISOString().slice(0, 16);
}

export default function CampanhasPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<"create" | "edit" | null>(null);
  const [form, setForm] = useState<any>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    const r = await fetch("/api/admin/campanhas");
    setCoupons(await r.json());
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  function openCreate() { setForm(EMPTY_FORM); setModal("create"); }
  function openEdit(c: Coupon) {
    setForm({
      id: c.id, code: c.code, description: c.description ?? "",
      discountType: c.discountType, discountValue: String(c.discountValue),
      maxUses: c.maxUses ? String(c.maxUses) : "",
      validFrom: toLocalDate(c.validFrom), validUntil: toLocalDate(c.validUntil),
      active: c.active,
    });
    setModal("edit");
  }

  async function save() {
    if (!form.code.trim() || !form.discountValue) return;
    setSaving(true);
    const method = modal === "edit" ? "PUT" : "POST";
    await fetch("/api/admin/campanhas", {
      method, headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        discountValue: Number(form.discountValue),
        maxUses: form.maxUses ? Number(form.maxUses) : null,
        validFrom: form.validFrom || null,
        validUntil: form.validUntil || null,
      }),
    });
    setSaving(false);
    setModal(null);
    load();
  }

  async function toggleActive(c: Coupon) {
    await fetch("/api/admin/campanhas", {
      method: "PUT", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: c.id, active: !c.active }),
    });
    load();
  }

  async function del(id: string) {
    await fetch("/api/admin/campanhas", {
      method: "DELETE", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    setDeleting(null);
    load();
  }

  const fmt = (iso?: string) => iso ? new Date(iso).toLocaleDateString("pt-BR") : "—";

  function statusBadge(c: Coupon) {
    if (!c.active) return { label: "Inativo", color: "bg-white/5 text-neutral-500 border-white/10" };
    const now = new Date();
    if (c.validUntil && new Date(c.validUntil) < now) return { label: "Expirado", color: "bg-red-500/10 text-red-400 border-red-500/20" };
    if (c.validFrom && new Date(c.validFrom) > now) return { label: "Agendado", color: "bg-blue-500/10 text-blue-400 border-blue-500/20" };
    if (c.maxUses && c.usesCount >= c.maxUses) return { label: "Esgotado", color: "bg-orange-500/10 text-orange-400 border-orange-500/20" };
    return { label: "Ativo", color: "bg-green-500/10 text-green-400 border-green-500/20" };
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black text-white">Campanhas & Cupons</h1>
          <p className="text-neutral-400 text-sm mt-1">{coupons.length} cupons cadastrados</p>
        </div>
        <button onClick={openCreate}
          className="flex items-center gap-2 bg-yellow-500 hover:bg-yellow-400 text-black font-black px-5 py-2.5 rounded-xl text-sm transition-colors">
          <Icon name="add" className="text-base" /> Novo cupom
        </button>
      </div>

      {loading ? (
        <p className="text-neutral-500 text-center py-16">Carregando...</p>
      ) : coupons.length === 0 ? (
        <div className="text-center py-16 text-neutral-500">
          <Icon name="local_offer" className="text-4xl mb-3 block" />
          <p>Nenhum cupom cadastrado.</p>
        </div>
      ) : (
        <div className="bg-[#111414] border border-white/5 rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5">
                <th className="px-5 py-3 text-left text-[10px] font-black uppercase tracking-widest text-neutral-500">Código</th>
                <th className="px-5 py-3 text-center text-[10px] font-black uppercase tracking-widest text-neutral-500">Desconto</th>
                <th className="px-5 py-3 text-center text-[10px] font-black uppercase tracking-widest text-neutral-500">Usos</th>
                <th className="px-5 py-3 text-center text-[10px] font-black uppercase tracking-widest text-neutral-500">Validade</th>
                <th className="px-5 py-3 text-center text-[10px] font-black uppercase tracking-widest text-neutral-500">Status</th>
                <th className="px-5 py-3 text-center text-[10px] font-black uppercase tracking-widest text-neutral-500">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {coupons.map(c => {
                const badge = statusBadge(c);
                return (
                  <tr key={c.id} className="hover:bg-white/2 transition-colors">
                    <td className="px-5 py-4">
                      <p className="text-white font-black font-mono tracking-widest">{c.code}</p>
                      {c.description && <p className="text-neutral-500 text-xs mt-0.5">{c.description}</p>}
                    </td>
                    <td className="px-5 py-4 text-center">
                      <span className="text-yellow-400 font-black text-base">
                        {c.discountType === "percent" ? `${c.discountValue}%` : `R$ ${c.discountValue.toFixed(2).replace(".", ",")}`}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-center text-neutral-300 font-semibold">
                      {c.usesCount}{c.maxUses ? `/${c.maxUses}` : ""}
                    </td>
                    <td className="px-5 py-4 text-center text-neutral-400 text-xs">
                      {c.validFrom || c.validUntil ? `${fmt(c.validFrom)} → ${fmt(c.validUntil)}` : "Sem prazo"}
                    </td>
                    <td className="px-5 py-4 text-center">
                      <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border ${badge.color}`}>
                        {badge.label}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-center gap-1">
                        <button onClick={() => toggleActive(c)}
                          className={`p-1.5 rounded-lg transition-colors ${c.active ? "hover:bg-red-500/10 text-neutral-400 hover:text-red-400" : "hover:bg-green-500/10 text-neutral-400 hover:text-green-400"}`}
                          title={c.active ? "Desativar" : "Ativar"}>
                          <Icon name={c.active ? "pause" : "play_arrow"} className="text-sm" />
                        </button>
                        <button onClick={() => openEdit(c)}
                          className="p-1.5 rounded-lg hover:bg-white/5 text-neutral-400 hover:text-white transition-colors" title="Editar">
                          <Icon name="edit" className="text-sm" />
                        </button>
                        <button onClick={() => setDeleting(c.id)}
                          className="p-1.5 rounded-lg hover:bg-red-500/10 text-neutral-400 hover:text-red-400 transition-colors" title="Excluir">
                          <Icon name="delete" className="text-sm" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal criar/editar */}
      {modal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-[#111414] border border-white/10 rounded-2xl p-6 w-full max-w-md">
            <h3 className="text-white font-black text-lg mb-5">{modal === "edit" ? "Editar cupom" : "Novo cupom"}</h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-neutral-400 font-semibold uppercase tracking-widest block mb-1">Código do cupom *</label>
                <input value={form.code} onChange={e => setForm((f: any) => ({ ...f, code: e.target.value.toUpperCase() }))}
                  placeholder="Ex: DESCONTO10"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white font-mono uppercase tracking-widest focus:outline-none focus:border-yellow-500/50" />
              </div>
              <div>
                <label className="text-xs text-neutral-400 font-semibold uppercase tracking-widest block mb-1">Descrição</label>
                <input value={form.description} onChange={e => setForm((f: any) => ({ ...f, description: e.target.value }))}
                  placeholder="Ex: Campanha de lançamento"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-yellow-500/50" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-neutral-400 font-semibold uppercase tracking-widest block mb-1">Tipo</label>
                  <select value={form.discountType} onChange={e => setForm((f: any) => ({ ...f, discountType: e.target.value }))}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-yellow-500/50">
                    <option value="percent">Percentual (%)</option>
                    <option value="fixed">Valor fixo (R$)</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-neutral-400 font-semibold uppercase tracking-widest block mb-1">
                    Valor {form.discountType === "percent" ? "(%)" : "(R$)"} *
                  </label>
                  <input type="number" value={form.discountValue} onChange={e => setForm((f: any) => ({ ...f, discountValue: e.target.value }))}
                    placeholder={form.discountType === "percent" ? "10" : "5.00"} min="0"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-yellow-500/50" />
                </div>
              </div>
              <div>
                <label className="text-xs text-neutral-400 font-semibold uppercase tracking-widest block mb-1">Limite de usos (deixe vazio = ilimitado)</label>
                <input type="number" value={form.maxUses} onChange={e => setForm((f: any) => ({ ...f, maxUses: e.target.value }))}
                  placeholder="Ex: 100"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-yellow-500/50" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-neutral-400 font-semibold uppercase tracking-widest block mb-1">Válido de</label>
                  <input type="datetime-local" value={form.validFrom} onChange={e => setForm((f: any) => ({ ...f, validFrom: e.target.value }))}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-yellow-500/50 [color-scheme:dark]" />
                </div>
                <div>
                  <label className="text-xs text-neutral-400 font-semibold uppercase tracking-widest block mb-1">Válido até</label>
                  <input type="datetime-local" value={form.validUntil} onChange={e => setForm((f: any) => ({ ...f, validUntil: e.target.value }))}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-yellow-500/50 [color-scheme:dark]" />
                </div>
              </div>
              <label className="flex items-center gap-3 cursor-pointer pt-1">
                <input type="checkbox" checked={form.active} onChange={e => setForm((f: any) => ({ ...f, active: e.target.checked }))} className="accent-yellow-500 w-4 h-4" />
                <span className="text-sm text-neutral-300 font-semibold">Cupom ativo</span>
              </label>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setModal(null)}
                className="flex-1 bg-white/5 hover:bg-white/10 text-neutral-300 font-semibold py-2.5 rounded-xl text-sm transition-colors">
                Cancelar
              </button>
              <button onClick={save} disabled={saving}
                className="flex-1 bg-yellow-500 hover:bg-yellow-400 disabled:opacity-60 text-black font-black py-2.5 rounded-xl text-sm transition-colors">
                {saving ? "Salvando..." : "Salvar"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal excluir */}
      {deleting && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-[#111414] border border-white/10 rounded-2xl p-6 w-full max-w-sm mx-4">
            <h3 className="text-white font-black text-lg mb-2">Excluir cupom?</h3>
            <p className="text-neutral-400 text-sm mb-6">Esta ação não pode ser desfeita.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleting(null)}
                className="flex-1 bg-white/5 hover:bg-white/10 text-neutral-300 font-semibold py-2.5 rounded-xl text-sm transition-colors">
                Cancelar
              </button>
              <button onClick={() => del(deleting)}
                className="flex-1 bg-red-600 hover:bg-red-500 text-white font-black py-2.5 rounded-xl text-sm transition-colors">
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

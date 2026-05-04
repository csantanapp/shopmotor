"use client";

import { useState, useEffect, useCallback } from "react";
import ErpLayout from "@/components/erp/ErpLayout";
import Icon from "@/components/ui/Icon";

/* ── helpers ── */
const iCls = "w-full rounded-xl border border-black/10 bg-gray-50 px-3 py-2.5 text-sm text-gray-800 outline-none focus:border-primary-container/60 focus:bg-white transition";

function Field({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={`flex flex-col gap-1.5 ${className ?? ""}`}>
      <label className="text-[11px] font-black uppercase tracking-wider text-gray-400">{label}</label>
      {children}
    </div>
  );
}

const PLAN_FEATURES = ["Anúncios ilimitados", "BI avançado", "CRM completo", "Suporte prioritário"];

const MODULES = [
  { key: "dashboard",     label: "Dashboard de Direção",    icon: "explore" },
  { key: "veiculos",      label: "Veículos",                icon: "directions_car" },
  { key: "estoque",       label: "Estoque",                 icon: "inventory" },
  { key: "vendidos",      label: "Vendidos",                icon: "sell" },
  { key: "clientes",      label: "Clientes / Fornecedores", icon: "contacts" },
  { key: "leads",         label: "CRM de Leads",            icon: "group" },
  { key: "financiamento", label: "Financiamento",           icon: "account_balance" },
  { key: "seguros",       label: "Seguros",                 icon: "shield" },
  { key: "anuncios",      label: "Impulsionamento",         icon: "rocket_launch" },
  { key: "comunicado",    label: "Comunicado de Venda",     icon: "description" },
  { key: "consulta",      label: "Consulta Veicular",       icon: "manage_search" },
  { key: "financeiro",    label: "Financeiro",              icon: "payments" },
  { key: "relatorios",    label: "Relatórios",              icon: "bar_chart" },
];

interface Vendedor { id: string; nome: string; loja: string }
interface Grupo    { id: string; nome: string; modulos: Record<string, boolean> }
interface Usuario  { id: string; nome: string; email: string; grupo: { id: string; nome: string } }

const EMPTY_VEND = { nome: "", loja: "" };
const EMPTY_GRUP = { nome: "", modulos: {} as Record<string, boolean> };
const EMPTY_USER = { nome: "", email: "", senha: "", grupoId: "" };

export default function ConfiguracoesPage() {
  const [toast, setToast] = useState("");
  const fire = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 3500); };

  /* ── Dados da loja ── */
  const [loja, setLoja] = useState({ razaoSocial: "", cnpj: "", email: "", telefone: "", cidade: "", responsavel: "" });
  const [savingLoja, setSavingLoja] = useState(false);

  useEffect(() => {
    fetch("/api/user/profile").then(r => r.json()).then(d => {
      const u = d.user ?? {};
      setLoja({
        razaoSocial: u.companyName ?? u.name ?? "",
        cnpj:        u.cnpj ?? "",
        email:       u.email ?? "",
        telefone:    u.phone ?? "",
        cidade:      u.city ? `${u.city}${u.state ? `, ${u.state}` : ""}` : "",
        responsavel: u.tradeName ?? u.name ?? "",
      });
    });
  }, []);

  async function salvarLoja() {
    setSavingLoja(true);
    const [cidade, estado] = loja.cidade.split(",").map(s => s.trim());
    await fetch("/api/user/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone: loja.telefone, city: cidade, state: estado ?? "", tradeName: loja.responsavel }),
    });
    setSavingLoja(false);
    fire("Alterações salvas!");
  }

  /* ── Vendedores ── */
  const [vendedores, setVendedores] = useState<Vendedor[]>([]);
  const [vendForm, setVendForm]     = useState({ ...EMPTY_VEND });
  const [vendModal, setVendModal]   = useState(false);
  const [vendSaving, setVendSaving] = useState(false);

  const loadVendedores = useCallback(async () => {
    const d = await fetch("/api/loja/vendedores").then(r => r.json());
    setVendedores(d.items ?? []);
  }, []);
  useEffect(() => { loadVendedores(); }, [loadVendedores]);

  async function saveVendedor() {
    if (!vendForm.nome || !vendForm.loja) { fire("Preencha nome e loja."); return; }
    setVendSaving(true);
    const res = await fetch("/api/loja/vendedores", {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(vendForm),
    });
    setVendSaving(false);
    if (res.ok) { fire("Vendedor cadastrado!"); setVendForm({ ...EMPTY_VEND }); setVendModal(false); await loadVendedores(); }
    else { const d = await res.json(); fire(d.error ?? "Erro ao salvar."); }
  }

  async function removeVendedor(id: string) {
    await fetch(`/api/loja/vendedores/${id}`, { method: "DELETE" });
    fire("Vendedor removido."); await loadVendedores();
  }

  /* ── Grupos ── */
  const [grupos, setGrupos]         = useState<Grupo[]>([]);
  const [grupoForm, setGrupoForm]   = useState({ ...EMPTY_GRUP });
  const [grupoModal, setGrupoModal] = useState(false);
  const [editGrupoId, setEditGrupoId] = useState<string | null>(null);
  const [grupoSaving, setGrupoSaving] = useState(false);

  const loadGrupos = useCallback(async () => {
    const d = await fetch("/api/loja/grupos").then(r => r.json());
    setGrupos(d.items ?? []);
  }, []);
  useEffect(() => { loadGrupos(); }, [loadGrupos]);

  function toggleModulo(key: string) {
    setGrupoForm(g => ({ ...g, modulos: { ...g.modulos, [key]: !g.modulos[key] } }));
  }

  async function saveGrupo() {
    if (!grupoForm.nome) { fire("Nome do grupo é obrigatório."); return; }
    setGrupoSaving(true);
    if (editGrupoId) {
      await fetch(`/api/loja/grupos/${editGrupoId}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(grupoForm),
      });
      fire("Grupo atualizado!");
    } else {
      await fetch("/api/loja/grupos", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(grupoForm),
      });
      fire("Grupo criado!");
    }
    setGrupoSaving(false);
    setGrupoForm({ ...EMPTY_GRUP }); setEditGrupoId(null); setGrupoModal(false);
    await loadGrupos();
  }

  function openEditGrupo(g: Grupo) {
    setGrupoForm({ nome: g.nome, modulos: { ...g.modulos } });
    setEditGrupoId(g.id);
    setGrupoModal(true);
  }

  async function removeGrupo(id: string) {
    await fetch(`/api/loja/grupos/${id}`, { method: "DELETE" });
    fire("Grupo removido."); await loadGrupos();
  }

  /* ── Usuários ── */
  const [usuarios, setUsuarios]     = useState<Usuario[]>([]);
  const [userForm, setUserForm]     = useState({ ...EMPTY_USER });
  const [userModal, setUserModal]   = useState(false);
  const [userSaving, setUserSaving] = useState(false);

  const loadUsuarios = useCallback(async () => {
    const d = await fetch("/api/loja/usuarios").then(r => r.json());
    setUsuarios(d.items ?? []);
  }, []);
  useEffect(() => { loadUsuarios(); }, [loadUsuarios]);

  async function saveUsuario() {
    if (!userForm.nome || !userForm.email || !userForm.senha || !userForm.grupoId) {
      fire("Preencha todos os campos."); return;
    }
    setUserSaving(true);
    const res = await fetch("/api/loja/usuarios", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nome: userForm.nome, email: userForm.email, senha: userForm.senha, grupoId: userForm.grupoId }),
    });
    setUserSaving(false);
    if (res.ok) { fire("Usuário cadastrado!"); setUserForm({ ...EMPTY_USER }); setUserModal(false); await loadUsuarios(); }
    else { const d = await res.json(); fire(d.error ?? "Erro ao salvar."); }
  }

  async function removeUsuario(id: string) {
    await fetch(`/api/loja/usuarios/${id}`, { method: "DELETE" });
    fire("Usuário removido."); await loadUsuarios();
  }

  return (
    <ErpLayout title="Configurações" subtitle="Dados da loja, vendedores, grupos e usuários">
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 rounded-xl bg-gray-900 px-4 py-3 text-sm text-white shadow-2xl">{toast}</div>
      )}

      {/* ── Modal Vendedor ── */}
      {vendModal && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 p-4" onClick={() => setVendModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-6 border-b border-black/10">
              <p className="font-black text-gray-900">Cadastro de Vendedor</p>
              <button onClick={() => setVendModal(false)} className="p-1 rounded-lg hover:bg-gray-100"><Icon name="close" className="text-gray-500" /></button>
            </div>
            <div className="p-6 space-y-4">
              <Field label="Nome *">
                <input type="text" value={vendForm.nome} onChange={e => setVendForm(v => ({ ...v, nome: e.target.value }))} className={iCls} placeholder="Nome do vendedor" />
              </Field>
              <Field label="Loja *">
                <input type="text" value={vendForm.loja} onChange={e => setVendForm(v => ({ ...v, loja: e.target.value }))} className={iCls} placeholder="Nome da loja" />
              </Field>
            </div>
            <div className="flex gap-3 p-6 border-t border-black/10">
              <button onClick={saveVendedor} disabled={vendSaving}
                className="flex-1 flex items-center justify-center gap-2 bg-primary-container text-black py-2.5 rounded-xl font-black text-sm hover:opacity-90 transition disabled:opacity-50">
                {vendSaving && <span className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />}
                Salvar
              </button>
              <button onClick={() => setVendModal(false)} className="px-5 py-2.5 rounded-xl border border-black/10 text-sm text-gray-500 hover:bg-gray-50">Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal Grupo ── */}
      {grupoModal && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 p-4" onClick={() => { setGrupoModal(false); setEditGrupoId(null); setGrupoForm({ ...EMPTY_GRUP }); }}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-6 border-b border-black/10">
              <p className="font-black text-gray-900">{editGrupoId ? "Editar Grupo" : "Novo Grupo de Permissão"}</p>
              <button onClick={() => { setGrupoModal(false); setEditGrupoId(null); setGrupoForm({ ...EMPTY_GRUP }); }} className="p-1 rounded-lg hover:bg-gray-100"><Icon name="close" className="text-gray-500" /></button>
            </div>
            <div className="p-6 space-y-5">
              <Field label="Nome do grupo *">
                <input type="text" value={grupoForm.nome} onChange={e => setGrupoForm(g => ({ ...g, nome: e.target.value }))} className={iCls} placeholder="Ex: Vendedor, Gerente, Administrador" />
              </Field>
              <div>
                <p className="text-[11px] font-black uppercase tracking-wider text-gray-400 mb-3">Módulos com acesso</p>
                <div className="grid grid-cols-1 gap-2">
                  {MODULES.map(m => (
                    <label key={m.key} className="flex items-center gap-3 rounded-xl border border-black/8 bg-gray-50 px-4 py-2.5 cursor-pointer hover:bg-gray-100 transition">
                      <input type="checkbox" checked={!!grupoForm.modulos[m.key]} onChange={() => toggleModulo(m.key)} className="w-4 h-4 accent-yellow-500 shrink-0" />
                      <Icon name={m.icon} className="text-base text-gray-400 shrink-0" />
                      <span className="text-sm font-medium text-gray-700">{m.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex gap-3 p-6 border-t border-black/10">
              <button onClick={saveGrupo} disabled={grupoSaving}
                className="flex-1 flex items-center justify-center gap-2 bg-primary-container text-black py-2.5 rounded-xl font-black text-sm hover:opacity-90 transition disabled:opacity-50">
                {grupoSaving && <span className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />}
                {editGrupoId ? "Atualizar" : "Salvar"}
              </button>
              <button onClick={() => { setGrupoModal(false); setEditGrupoId(null); setGrupoForm({ ...EMPTY_GRUP }); }} className="px-5 py-2.5 rounded-xl border border-black/10 text-sm text-gray-500 hover:bg-gray-50">Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal Usuário ── */}
      {userModal && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 p-4" onClick={() => setUserModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-6 border-b border-black/10">
              <p className="font-black text-gray-900">Cadastro de Usuário</p>
              <button onClick={() => setUserModal(false)} className="p-1 rounded-lg hover:bg-gray-100"><Icon name="close" className="text-gray-500" /></button>
            </div>
            <div className="p-6 space-y-4">
              <Field label="Nome *">
                <input type="text" value={userForm.nome} onChange={e => setUserForm(u => ({ ...u, nome: e.target.value }))} className={iCls} placeholder="Nome completo" />
              </Field>
              <Field label="E-mail *">
                <input type="email" value={userForm.email} onChange={e => setUserForm(u => ({ ...u, email: e.target.value }))} className={iCls} placeholder="email@exemplo.com" />
              </Field>
              <Field label="Senha *">
                <input type="password" value={userForm.senha} onChange={e => setUserForm(u => ({ ...u, senha: e.target.value }))} className={iCls} placeholder="••••••••" />
              </Field>
              <Field label="Grupo de permissão *">
                {grupos.length === 0 ? (
                  <p className="text-xs text-yellow-800 bg-yellow-50 border border-yellow-200 rounded-xl px-3 py-2">
                    Nenhum grupo cadastrado. Crie um grupo primeiro.
                  </p>
                ) : (
                  <select value={userForm.grupoId} onChange={e => setUserForm(u => ({ ...u, grupoId: e.target.value }))} className={iCls}>
                    <option value="">Selecione um grupo</option>
                    {grupos.map(g => <option key={g.id} value={g.id}>{g.nome}</option>)}
                  </select>
                )}
              </Field>
            </div>
            <div className="flex gap-3 p-6 border-t border-black/10">
              <button onClick={saveUsuario} disabled={userSaving || grupos.length === 0}
                className="flex-1 flex items-center justify-center gap-2 bg-primary-container text-black py-2.5 rounded-xl font-black text-sm hover:opacity-90 transition disabled:opacity-50">
                {userSaving && <span className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />}
                Salvar
              </button>
              <button onClick={() => setUserModal(false)} className="px-5 py-2.5 rounded-xl border border-black/10 text-sm text-gray-500 hover:bg-gray-50">Cancelar</button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-8">

        {/* ── Dados da Loja ── */}
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 rounded-xl border border-black/10 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-4 mb-6">
              <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-primary-container text-black shadow-lg shadow-primary-container/30">
                <Icon name="store" className="text-2xl" />
              </div>
              <div>
                <h2 className="text-lg font-black text-gray-900">{loja.razaoSocial || "Minha Loja"}</h2>
                <p className="text-sm text-gray-400">{loja.cidade || "—"}</p>
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {([
                ["Razão social", "razaoSocial", false],
                ["CNPJ", "cnpj", false],
                ["E-mail", "email", false],
                ["Telefone", "telefone", false],
                ["Cidade / Estado", "cidade", false],
                ["Responsável", "responsavel", false],
              ] as [string, keyof typeof loja, boolean][]).map(([label, key]) => (
                <div key={key}>
                  <p className="text-xs uppercase tracking-wider text-gray-400 font-black mb-1">{label}</p>
                  <input
                    value={loja[key]}
                    readOnly={key === "razaoSocial" || key === "cnpj" || key === "email"}
                    onChange={e => setLoja(l => ({ ...l, [key]: e.target.value }))}
                    className={iCls + (key === "razaoSocial" || key === "cnpj" || key === "email" ? " opacity-60 cursor-not-allowed" : "")}
                  />
                </div>
              ))}
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => fetch("/api/user/profile").then(r => r.json()).then(d => {
                const u = d.user ?? {};
                setLoja({ razaoSocial: u.companyName ?? u.name ?? "", cnpj: u.cnpj ?? "", email: u.email ?? "", telefone: u.phone ?? "", cidade: u.city ? `${u.city}${u.state ? `, ${u.state}` : ""}` : "", responsavel: u.tradeName ?? u.name ?? "" });
              })} className="rounded-xl border border-black/10 px-4 py-2 text-sm font-black text-gray-600 hover:bg-gray-100 transition">
                Cancelar
              </button>
              <button onClick={salvarLoja} disabled={savingLoja} className="flex items-center gap-2 rounded-xl bg-gray-900 px-4 py-2 text-sm font-black text-white hover:opacity-90 transition disabled:opacity-50">
                {savingLoja && <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                Salvar alterações
              </button>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-xl border border-primary-container/40 bg-yellow-50 p-6">
              <div className="flex items-center gap-2 text-yellow-700 mb-3">
                <Icon name="workspace_premium" className="text-base" />
                <span className="text-xs font-black uppercase tracking-wider">Plano Pro</span>
              </div>
              <p className="text-2xl font-black text-gray-900">R$ 499<span className="text-sm font-normal text-gray-400">/mês</span></p>
              <ul className="mt-4 space-y-2">
                {PLAN_FEATURES.map(f => (
                  <li key={f} className="flex items-center gap-2 text-sm text-gray-600">
                    <Icon name="check" className="text-yellow-600 text-sm" /> {f}
                  </li>
                ))}
              </ul>
              <button onClick={() => fire("Fale com vendas para upgrade")} className="mt-5 w-full rounded-xl bg-primary-container py-2 text-sm font-black text-black hover:opacity-90 transition">
                Fazer upgrade para Elite
              </button>
            </div>

            <div className="rounded-xl border border-black/10 bg-white p-6 shadow-sm">
              <h3 className="font-black text-gray-900 flex items-center gap-2 mb-4">
                <Icon name="cable" className="text-base text-gray-400" /> Integrações
              </h3>
              <ul className="space-y-3 text-sm">
                <li className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-gray-700"><Icon name="chat" className="text-green-500 text-sm" /> WhatsApp Business</span>
                  <span className="rounded-full bg-green-100 text-green-700 px-2 py-0.5 text-[11px] font-black">Conectado</span>
                </li>
                {["Mercado Pago", "Webmotors API", "iCarros API"].map(s => (
                  <li key={s} className="flex items-center justify-between">
                    <span className="text-gray-500">{s}</span>
                    <button onClick={() => fire(`Conectando ${s}…`)} className="text-xs font-black text-yellow-700 hover:underline">Conectar</button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* ── Vendedores ── */}
        <div className="rounded-xl border border-black/10 bg-white shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-black/10 bg-gray-50">
            <div className="flex items-center gap-3">
              <Icon name="badge" className="text-lg text-gray-400" />
              <div>
                <h2 className="font-black text-gray-900">Vendedores</h2>
                <p className="text-xs text-gray-400">Equipe de vendas cadastrada</p>
              </div>
            </div>
            <button onClick={() => { setVendForm({ ...EMPTY_VEND }); setVendModal(true); }}
              className="flex items-center gap-2 bg-primary-container text-black px-4 py-2 rounded-xl font-black text-sm hover:opacity-90 transition">
              <Icon name="add" className="text-base" /> Novo vendedor
            </button>
          </div>
          {vendedores.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-10">Nenhum vendedor cadastrado.</p>
          ) : (
            <table className="w-full text-sm">
              <thead className="text-xs uppercase tracking-wider text-gray-400 border-b border-black/10">
                <tr>
                  {["Nome", "Loja", ""].map(h => <th key={h} className="px-6 py-3 text-left font-black">{h}</th>)}
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5">
                {vendedores.map(v => (
                  <tr key={v.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-black text-gray-900">{v.nome}</td>
                    <td className="px-6 py-4 text-gray-600">{v.loja}</td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => removeVendedor(v.id)} className="text-xs text-red-500 hover:text-red-700 font-black">Remover</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* ── Grupos e Permissões ── */}
        <div className="rounded-xl border border-black/10 bg-white shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-black/10 bg-gray-50">
            <div className="flex items-center gap-3">
              <Icon name="admin_panel_settings" className="text-lg text-gray-400" />
              <div>
                <h2 className="font-black text-gray-900">Grupos e Permissões</h2>
                <p className="text-xs text-gray-400">Defina quais módulos cada grupo pode acessar</p>
              </div>
            </div>
            <button onClick={() => { setGrupoForm({ ...EMPTY_GRUP }); setEditGrupoId(null); setGrupoModal(true); }}
              className="flex items-center gap-2 bg-primary-container text-black px-4 py-2 rounded-xl font-black text-sm hover:opacity-90 transition">
              <Icon name="add" className="text-base" /> Novo grupo
            </button>
          </div>
          {grupos.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-10">Nenhum grupo cadastrado.</p>
          ) : (
            <div className="divide-y divide-black/5">
              {grupos.map(g => {
                const ativos = MODULES.filter(m => g.modulos[m.key]);
                return (
                  <div key={g.id} className="px-6 py-4 flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <p className="font-black text-gray-900">{g.nome}</p>
                      {ativos.length === 0 ? (
                        <p className="text-xs text-gray-400 mt-1">Sem acesso a módulos</p>
                      ) : (
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {ativos.map(m => (
                            <span key={m.key} className="rounded-full bg-yellow-50 border border-yellow-200 text-yellow-800 text-[10px] font-black px-2 py-0.5">
                              {m.label}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button onClick={() => openEditGrupo(g)} className="rounded-lg border border-black/10 px-3 py-1.5 text-xs font-black text-gray-600 hover:bg-gray-50 transition">Editar</button>
                      <button onClick={() => removeGrupo(g.id)} className="text-xs text-red-500 hover:text-red-700 font-black">Remover</button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ── Usuários ── */}
        <div className="rounded-xl border border-black/10 bg-white shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-black/10 bg-gray-50">
            <div className="flex items-center gap-3">
              <Icon name="manage_accounts" className="text-lg text-gray-400" />
              <div>
                <h2 className="font-black text-gray-900">Usuários do Sistema</h2>
                <p className="text-xs text-gray-400">Colaboradores com acesso ao painel</p>
              </div>
            </div>
            <button onClick={() => { setUserForm({ ...EMPTY_USER }); setUserModal(true); }}
              className="flex items-center gap-2 bg-primary-container text-black px-4 py-2 rounded-xl font-black text-sm hover:opacity-90 transition">
              <Icon name="person_add" className="text-base" /> Novo usuário
            </button>
          </div>
          {usuarios.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-10">Nenhum usuário cadastrado.</p>
          ) : (
            <table className="w-full text-sm">
              <thead className="text-xs uppercase tracking-wider text-gray-400 border-b border-black/10">
                <tr>
                  {["Nome", "E-mail", "Grupo", ""].map(h => <th key={h} className="px-6 py-3 text-left font-black">{h}</th>)}
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5">
                {usuarios.map(u => (
                  <tr key={u.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-black text-gray-900">{u.nome}</td>
                    <td className="px-6 py-4 text-gray-600">{u.email}</td>
                    <td className="px-6 py-4">
                      <span className="rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-[10px] font-black px-2 py-0.5">
                        {u.grupo?.nome ?? "—"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => removeUsuario(u.id)} className="text-xs text-red-500 hover:text-red-700 font-black">Remover</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

      </div>
    </ErpLayout>
  );
}

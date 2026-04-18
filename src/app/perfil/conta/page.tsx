"use client";

import { useState, useEffect } from "react";
import Icon from "@/components/ui/Icon";
import { useAuth } from "@/context/AuthContext";

const UFS = ["AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG","PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO"];

interface ProfileData {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  avatarUrl: string | null;
  role: string;
  plan: string;
  cpf: string | null;
  zipCode: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  createdAt: string;
}

export default function ContaPage() {
  const { refresh } = useAuth();

  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const [showChangePassword, setShowChangePassword] = useState(false);
  const [pwForm, setPwForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });

  useEffect(() => {
    fetch("/api/user/profile")
      .then(r => r.json())
      .then(d => { setProfile(d.user); setLoading(false); });
  }, []);

  async function handleSaveProfile(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(""); setSuccess("");
    setSaving(true);

    const fd = new FormData(e.currentTarget);
    const body: Record<string, string> = Object.fromEntries(
      Array.from(fd.entries()).map(([k, v]) => [k, v as string])
    );

    const res = await fetch("/api/user/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    setSaving(false);

    if (!res.ok) { setError(data.error ?? "Erro ao salvar."); return; }
    setProfile(prev => prev ? { ...prev, ...data.user } : data.user);
    await refresh();
    setSuccess("Alterações salvas com sucesso!");
    setTimeout(() => setSuccess(""), 4000);
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    setError(""); setSuccess("");

    if (pwForm.newPassword !== pwForm.confirmPassword) {
      setError("As senhas não coincidem."); return;
    }

    setSaving(true);
    const res = await fetch("/api/user/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword }),
    });
    const data = await res.json();
    setSaving(false);

    if (!res.ok) { setError(data.error ?? "Erro ao alterar senha."); return; }
    setSuccess("Senha alterada com sucesso!");
    setShowChangePassword(false);
    setPwForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    setTimeout(() => setSuccess(""), 4000);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <span className="w-8 h-8 border-2 border-primary-container/30 border-t-primary-container rounded-full animate-spin" />
      </div>
    );
  }

  if (!profile) return null;

  const memberSince = new Date(profile.createdAt).toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
  const planLabel = profile.plan === "PREMIUM" ? "Vendedor Premium" : "Plano Grátis";

  return (
    <div className="max-w-3xl mx-auto space-y-8">

      <div>
        <h1 className="text-3xl font-black tracking-tighter text-on-surface uppercase">Minha Conta</h1>
        <p className="text-on-surface-variant text-sm mt-1">Gerencie seus dados pessoais e preferências.</p>
      </div>

      {/* Feedback */}
      {error && (
        <div className="flex items-center gap-2 bg-error/10 text-error rounded-xl px-4 py-3 text-sm font-medium">
          <Icon name="error" className="text-lg flex-shrink-0" />
          {error}
        </div>
      )}
      {success && (
        <div className="flex items-center gap-2 bg-green-50 text-green-700 rounded-xl px-4 py-3 text-sm font-medium">
          <Icon name="check_circle" className="text-lg flex-shrink-0" />
          {success}
        </div>
      )}

      {/* Avatar */}
      <div className="bg-surface-container-lowest p-8 rounded-2xl shadow-sm">
        <div className="flex items-center gap-6">
          <div className="relative">
            <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-primary-container flex items-center justify-center bg-surface-container">
              {profile.avatarUrl ? (
                <img src={profile.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <span className="text-3xl font-black text-on-surface-variant">
                  {profile.name.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <button
              type="button"
              aria-label="Trocar foto"
              className="absolute -bottom-1 -right-1 w-8 h-8 bg-primary-container rounded-full flex items-center justify-center shadow hover:scale-110 transition-transform"
            >
              <Icon name="photo_camera" className="text-sm text-on-primary-container" />
            </button>
          </div>
          <div>
            <h3 className="font-black text-xl text-on-surface">{profile.name}</h3>
            <p className="text-sm text-primary font-semibold">{planLabel}</p>
            <p className="text-xs text-on-surface-variant mt-1">Membro desde {memberSince}</p>
          </div>
        </div>
      </div>

      {/* Dados pessoais */}
      <form onSubmit={handleSaveProfile} className="space-y-8">
        <div className="bg-surface-container-lowest p-8 rounded-2xl shadow-sm space-y-6">
          <h2 className="text-base font-bold border-b border-neutral-100 pb-4">Dados Pessoais</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Field label="Nome completo" name="name" defaultValue={profile.name ?? ""} />
            <Field label="E-mail" name="email" type="email" defaultValue={profile.email} disabled />
            <Field label="Telefone / WhatsApp" name="phone" type="tel" defaultValue={profile.phone ?? ""} />
            <Field label="CPF" name="cpf" defaultValue={profile.cpf ?? ""} disabled />
          </div>
        </div>

        {/* Endereço */}
        <div className="bg-surface-container-lowest p-8 rounded-2xl shadow-sm space-y-6">
          <h2 className="text-base font-bold border-b border-neutral-100 pb-4">Endereço</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Field label="CEP" name="zipCode" defaultValue={profile.zipCode ?? ""} />
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">Estado</label>
              <select
                name="state"
                defaultValue={profile.state ?? ""}
                className="bg-surface-container-low border-0 rounded-xl p-3 text-sm focus:ring-2 focus:ring-primary-container outline-none"
              >
                <option value="">Selecione</option>
                {UFS.map(uf => <option key={uf} value={uf}>{uf}</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-1.5 md:col-span-2">
              <Field label="Endereço" name="address" defaultValue={profile.address ?? ""} />
            </div>
            <Field label="Cidade" name="city" defaultValue={profile.city ?? ""} />
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-4">
          <button type="reset" className="px-8 py-3 rounded-full font-bold text-neutral-500 hover:bg-surface-container transition-colors">
            Cancelar
          </button>
          <button
            type="submit"
            disabled={saving}
            className="bg-primary-container text-on-primary-container px-12 py-3 rounded-full font-black uppercase tracking-widest text-sm shadow-[0px_8px_24px_rgba(255,215,9,0.25)] hover:-translate-y-0.5 transition-all active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {saving && <span className="w-4 h-4 border-2 border-on-primary-container/30 border-t-on-primary-container rounded-full animate-spin" />}
            Salvar alterações
          </button>
        </div>
      </form>

      {/* Segurança */}
      <div className="bg-surface-container-lowest p-8 rounded-2xl shadow-sm space-y-4">
        <h2 className="text-base font-bold border-b border-neutral-100 pb-4">Segurança</h2>

        <div className="flex items-center justify-between py-3 border-b border-neutral-100">
          <div>
            <p className="font-semibold text-sm text-on-surface">Senha</p>
            <p className="text-xs text-on-surface-variant">Altere sua senha de acesso</p>
          </div>
          <button
            type="button"
            onClick={() => setShowChangePassword(p => !p)}
            className="text-sm font-bold text-primary hover:underline"
          >
            {showChangePassword ? "Cancelar" : "Alterar"}
          </button>
        </div>

        {showChangePassword && (
          <form onSubmit={handleChangePassword} className="space-y-4 pt-2">
            <PasswordField label="Senha atual" value={pwForm.currentPassword} onChange={v => setPwForm(p => ({ ...p, currentPassword: v }))} />
            <PasswordField label="Nova senha" value={pwForm.newPassword} onChange={v => setPwForm(p => ({ ...p, newPassword: v }))} />
            <PasswordField label="Confirmar nova senha" value={pwForm.confirmPassword} onChange={v => setPwForm(p => ({ ...p, confirmPassword: v }))} />
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="bg-primary-container text-on-primary-container px-8 py-2.5 rounded-full font-black uppercase tracking-widest text-xs disabled:opacity-60 flex items-center gap-2"
              >
                {saving && <span className="w-3 h-3 border-2 border-on-primary-container/30 border-t-on-primary-container rounded-full animate-spin" />}
                Salvar senha
              </button>
            </div>
          </form>
        )}

        <div className="flex items-center justify-between py-3 border-b border-neutral-100">
          <div>
            <p className="font-semibold text-sm text-on-surface">Verificação em 2 etapas</p>
            <p className="text-xs text-on-surface-variant">Adicione uma camada extra de segurança</p>
          </div>
          <button type="button" className="text-sm font-bold text-primary hover:underline">Ativar</button>
        </div>
      </div>

      {/* Zona de perigo */}
      <div className="bg-error/5 border border-error/20 p-8 rounded-2xl space-y-4">
        <h2 className="text-base font-bold text-error">Zona de Perigo</h2>
        <div className="flex items-center justify-between">
          <div>
            <p className="font-semibold text-sm text-on-surface">Excluir conta</p>
            <p className="text-xs text-on-surface-variant">Esta ação é irreversível. Todos os seus dados serão removidos.</p>
          </div>
          <button type="button" className="px-6 py-2 border border-error text-error font-bold text-sm rounded-full hover:bg-error hover:text-white transition-colors">
            Excluir conta
          </button>
        </div>
      </div>

    </div>
  );
}

function Field({ label, name, defaultValue = "", type = "text", disabled = false }: {
  label: string; name: string; defaultValue?: string; type?: string; disabled?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">{label}</label>
      <input
        name={name} type={type} defaultValue={defaultValue} disabled={disabled}
        className={`rounded-xl p-3 text-sm focus:ring-2 focus:ring-primary-container outline-none border-0 ${disabled ? "bg-surface-container text-outline cursor-not-allowed" : "bg-surface-container-low"}`}
      />
    </div>
  );
}

function PasswordField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  const [show, setShow] = useState(false);
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">{label}</label>
      <div className="relative">
        <input
          type={show ? "text" : "password"} value={value} onChange={e => onChange(e.target.value)} required
          className="w-full bg-surface-container-low border-0 rounded-xl p-3 pr-10 text-sm focus:ring-2 focus:ring-primary-container outline-none"
        />
        <button type="button" onClick={() => setShow(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface transition-colors">
          <Icon name={show ? "visibility_off" : "visibility"} className="text-lg" />
        </button>
      </div>
    </div>
  );
}

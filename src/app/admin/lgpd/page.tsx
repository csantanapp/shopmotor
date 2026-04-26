"use client";

import { useEffect, useState } from "react";
import Icon from "@/components/ui/Icon";

type Tab = "privacidade" | "termos";

interface Form {
  lgpd_privacidade: string;
  lgpd_privacidade_updated: string;
  lgpd_termos: string;
  lgpd_termos_updated: string;
}

function today() {
  return new Date().toLocaleDateString("pt-BR", { day: "numeric", month: "long", year: "numeric" });
}

// ── Conteúdo padrão — já preenchido para edição ──────────────────────────────

const DEFAULT_PRIVACIDADE = `<h2>1. Introdução</h2>
<p>A ShopMotor está comprometida com a proteção dos seus dados pessoais, em conformidade com a Lei Geral de Proteção de Dados (LGPD — Lei 13.709/2018). Esta Política descreve quais dados coletamos, como os utilizamos e quais são seus direitos.</p>

<h2>2. Dados que Coletamos</h2>
<p>Coletamos os seguintes dados ao longo do uso da plataforma:</p>
<table>
  <thead><tr><th>Categoria</th><th>Exemplos</th></tr></thead>
  <tbody>
    <tr><td>Dados de cadastro</td><td>Nome, e-mail, CPF/CNPJ, telefone, endereço</td></tr>
    <tr><td>Dados de anúncio</td><td>Fotos, descrição, preço, localização do veículo</td></tr>
    <tr><td>Dados de uso</td><td>Páginas visitadas, buscas realizadas, favoritos</td></tr>
    <tr><td>Dados técnicos</td><td>Endereço IP, tipo de navegador, dispositivo</td></tr>
  </tbody>
</table>

<h2>3. Como Usamos seus Dados</h2>
<ul>
  <li><strong>Prestação do serviço:</strong> criar e gerenciar sua conta, publicar anúncios e facilitar o contato entre compradores e vendedores.</li>
  <li><strong>Segurança:</strong> verificar identidade, prevenir fraudes e proteger a plataforma.</li>
  <li><strong>Comunicação:</strong> enviar notificações sobre anúncios, mensagens recebidas e atualizações da plataforma.</li>
  <li><strong>Melhoria do serviço:</strong> analisar comportamento de uso para aprimorar funcionalidades.</li>
  <li><strong>Obrigações legais:</strong> cumprir requisitos regulatórios e responder a solicitações de autoridades competentes.</li>
</ul>

<h2>4. Base Legal para o Tratamento</h2>
<p>Tratamos seus dados com fundamento nas seguintes bases legais da LGPD:</p>
<ul>
  <li><strong>Execução de contrato:</strong> para prestar os serviços contratados.</li>
  <li><strong>Legítimo interesse:</strong> para segurança e melhoria da plataforma.</li>
  <li><strong>Consentimento:</strong> para comunicações de marketing (você pode revogar a qualquer momento).</li>
  <li><strong>Obrigação legal:</strong> quando exigido por lei ou autoridade.</li>
</ul>

<h2>5. Compartilhamento de Dados</h2>
<p>Seus dados podem ser compartilhados com:</p>
<ul>
  <li><strong>Outros usuários:</strong> seu nome, cidade e telefone (se autorizado) são visíveis para compradores interessados em seus anúncios.</li>
  <li><strong>Prestadores de serviço:</strong> provedores de hospedagem, processamento de pagamentos e análise de dados que atuam sob nosso contrato.</li>
  <li><strong>Autoridades:</strong> quando exigido por lei, ordem judicial ou investigação legítima.</li>
</ul>
<p>Não vendemos nem alugamos seus dados pessoais a terceiros.</p>

<h2>6. Armazenamento e Segurança</h2>
<p>Seus dados são armazenados em servidores seguros localizados no Brasil. Adotamos medidas técnicas e organizacionais para proteger suas informações contra acesso não autorizado, perda ou destruição, incluindo criptografia de senhas e comunicações via HTTPS.</p>

<h2>7. Retenção de Dados</h2>
<p>Mantemos seus dados enquanto sua conta estiver ativa ou pelo tempo necessário para cumprir obrigações legais. Após o encerramento da conta, dados de identificação são anonimizados ou excluídos em até 90 dias, exceto quando a retenção for exigida por lei.</p>

<h2>8. Cookies</h2>
<p>Utilizamos cookies essenciais para manter sua sessão autenticada e cookies analíticos (de forma anonimizada) para entender como a plataforma é utilizada. Você pode desativar cookies não essenciais nas configurações do seu navegador, mas isso pode afetar algumas funcionalidades.</p>

<h2>9. Seus Direitos (LGPD)</h2>
<p>Como titular dos dados, você tem direito a:</p>
<ul>
  <li>Confirmar a existência de tratamento e acessar seus dados.</li>
  <li>Corrigir dados incompletos, inexatos ou desatualizados.</li>
  <li>Solicitar a anonimização, bloqueio ou eliminação de dados desnecessários.</li>
  <li>Solicitar a portabilidade dos seus dados.</li>
  <li>Revogar consentimentos concedidos.</li>
  <li>Obter informações sobre com quem seus dados foram compartilhados.</li>
</ul>
<p>Para exercer seus direitos, entre em contato: <strong>privacidade@shopmotor.com.br</strong></p>

<h2>10. Dados de Menores</h2>
<p>A ShopMotor não coleta intencionalmente dados de menores de 18 anos. Se identificarmos que um menor forneceu dados sem consentimento dos responsáveis, excluiremos essas informações imediatamente.</p>

<h2>11. Alterações desta Política</h2>
<p>Podemos atualizar esta Política periodicamente. A data de última atualização é sempre indicada no topo desta página. Recomendamos revisá-la regularmente.</p>

<h2>12. Encarregado de Dados (DPO)</h2>
<p>Nosso encarregado de proteção de dados pode ser contatado pelo e-mail: <strong>privacidade@shopmotor.com.br</strong></p>`;

const DEFAULT_TERMOS = `<h2>1. Aceitação dos Termos</h2>
<p>Ao acessar ou utilizar a plataforma ShopMotor, você concorda com estes Termos de Uso. Se não concordar com alguma das condições aqui descritas, não utilize nossos serviços.</p>

<h2>2. Descrição do Serviço</h2>
<p>A ShopMotor é uma plataforma de anúncios de veículos que conecta compradores e vendedores (pessoas físicas e jurídicas). Não somos parte nas negociações entre usuários e não garantimos a conclusão de nenhuma transação.</p>

<h2>3. Cadastro e Conta</h2>
<ul>
  <li>Você deve ter no mínimo 18 anos para criar uma conta.</li>
  <li>As informações fornecidas no cadastro devem ser verdadeiras e atualizadas.</li>
  <li>Você é responsável pela confidencialidade de sua senha e por todas as atividades realizadas em sua conta.</li>
  <li>Em caso de uso não autorizado da sua conta, notifique-nos imediatamente pelo e-mail contato@shopmotor.com.br.</li>
</ul>

<h2>4. Publicação de Anúncios</h2>
<ul>
  <li>Somente o proprietário legal do veículo, ou seu representante autorizado, pode publicar anúncios.</li>
  <li>As informações do anúncio (preço, quilometragem, ano, condição) devem ser precisas e verdadeiras.</li>
  <li>É proibido anunciar veículos roubados, adulterados ou com documentação irregular.</li>
  <li>A ShopMotor reserva-se o direito de remover anúncios que violem estes termos sem aviso prévio.</li>
  <li>Cada usuário pode publicar anúncios conforme os limites do seu plano contratado.</li>
</ul>

<h2>5. Conduta do Usuário</h2>
<p>É expressamente proibido:</p>
<ul>
  <li>Usar a plataforma para fins ilegais ou fraudulentos.</li>
  <li>Publicar informações falsas, enganosas ou spam.</li>
  <li>Assediar, ameaçar ou prejudicar outros usuários.</li>
  <li>Tentar acessar sistemas ou dados de outros usuários sem autorização.</li>
  <li>Utilizar bots, scrapers ou qualquer meio automatizado para extrair dados da plataforma.</li>
</ul>

<h2>6. Responsabilidades</h2>
<p>A ShopMotor atua apenas como intermediária e não se responsabiliza por:</p>
<ul>
  <li>Veracidade das informações fornecidas pelos anunciantes.</li>
  <li>Qualidade, estado ou legalidade dos veículos anunciados.</li>
  <li>Negociações, pagamentos ou entregas realizadas entre usuários.</li>
  <li>Perdas ou danos decorrentes do uso ou impossibilidade de uso da plataforma.</li>
</ul>

<h2>7. Propriedade Intelectual</h2>
<p>Todo o conteúdo da plataforma ShopMotor — incluindo marca, logo, layout, textos e código — é propriedade exclusiva da ShopMotor e protegido por leis de direitos autorais. As fotos publicadas nos anúncios são de responsabilidade do anunciante, que garante possuir os direitos sobre elas.</p>

<h2>8. Planos e Pagamentos</h2>
<p>Alguns recursos da plataforma são pagos (impulsionamento de anúncios, planos premium). Ao contratar um serviço pago, você concorda com os valores e condições exibidos no momento da contratação. Não há reembolso de créditos já utilizados.</p>

<h2>9. Encerramento de Conta</h2>
<p>Você pode encerrar sua conta a qualquer momento pela seção "Minha Conta". A ShopMotor também pode suspender ou encerrar contas que violem estes Termos de Uso, sem aviso prévio.</p>

<h2>10. Alterações dos Termos</h2>
<p>Podemos atualizar estes Termos periodicamente. Alterações significativas serão comunicadas por e-mail ou aviso na plataforma. O uso continuado após as alterações implica aceitação dos novos termos.</p>

<h2>11. Lei Aplicável</h2>
<p>Estes Termos são regidos pelas leis brasileiras. Fica eleito o foro da Comarca de Maringá/PR para dirimir eventuais disputas, com renúncia a qualquer outro, por mais privilegiado que seja.</p>

<h2>12. Contato</h2>
<p>Em caso de dúvidas sobre estes Termos, entre em contato: <strong>contato@shopmotor.com.br</strong></p>`;

// ─────────────────────────────────────────────────────────────────────────────

export default function AdminLGPD() {
  const [tab, setTab]         = useState<Tab>("privacidade");
  const [form, setForm]       = useState<Form>({
    lgpd_privacidade:         DEFAULT_PRIVACIDADE,
    lgpd_privacidade_updated: "21 de abril de 2026",
    lgpd_termos:              DEFAULT_TERMOS,
    lgpd_termos_updated:      "21 de abril de 2026",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);
  const [saved, setSaved]     = useState(false);
  const [preview, setPreview] = useState(false);

  useEffect(() => {
    fetch("/api/admin/lgpd")
      .then(r => r.json())
      .then(d => {
        setForm(prev => ({
          lgpd_privacidade:         d.lgpd_privacidade         || prev.lgpd_privacidade,
          lgpd_privacidade_updated: d.lgpd_privacidade_updated || prev.lgpd_privacidade_updated,
          lgpd_termos:              d.lgpd_termos              || prev.lgpd_termos,
          lgpd_termos_updated:      d.lgpd_termos_updated      || prev.lgpd_termos_updated,
        }));
        setLoading(false);
      });
  }, []);

  async function save() {
    setSaving(true);
    await fetch("/api/admin/lgpd", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  function set(key: keyof Form) {
    return (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) =>
      setForm(f => ({ ...f, [key]: e.target.value }));
  }

  const contentKey = tab === "privacidade" ? "lgpd_privacidade"         : "lgpd_termos";
  const updatedKey = tab === "privacidade" ? "lgpd_privacidade_updated" : "lgpd_termos_updated";
  const publicPath = tab === "privacidade" ? "/privacidade"             : "/termos";
  const docLabel   = tab === "privacidade" ? "Política de Privacidade"  : "Termos de Uso";

  return (
    <div className="p-8 max-w-5xl">

      {/* Header */}
      <div className="mb-8 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-black text-white">LGPD</h1>
          <p className="text-neutral-500 text-sm mt-1">Edite os documentos legais exibidos no site</p>
        </div>
        <div className="flex items-center gap-3">
          <a
            href={publicPath}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-white/10 text-neutral-400 hover:text-white hover:border-white/20 text-sm transition-all"
          >
            <Icon name="open_in_new" className="text-base" />
            Ver no site
          </a>
          <button
            onClick={() => setPreview(p => !p)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm transition-all ${
              preview
                ? "border-primary-container text-primary-container"
                : "border-white/10 text-neutral-400 hover:text-white hover:border-white/20"
            }`}
          >
            <Icon name={preview ? "edit" : "visibility"} className="text-base" />
            {preview ? "Editar" : "Prévia"}
          </button>
          <button
            onClick={save}
            disabled={saving || loading}
            className="flex items-center gap-2 bg-primary-container text-on-primary-container font-black px-6 py-2 rounded-xl text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {saving ? (
              <div className="w-4 h-4 border-2 border-on-primary-container/30 border-t-on-primary-container rounded-full animate-spin" />
            ) : (
              <Icon name={saved ? "check" : "save"} className="text-base" />
            )}
            {saved ? "Salvo!" : "Salvar"}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-[#111414] border border-white/5 rounded-2xl p-1 w-fit">
        {(["privacidade", "termos"] as Tab[]).map(t => (
          <button
            key={t}
            onClick={() => { setTab(t); setPreview(false); }}
            className={`px-5 py-2.5 rounded-xl text-sm font-black transition-all ${
              tab === t
                ? "bg-primary-container text-on-primary-container"
                : "text-neutral-400 hover:text-white"
            }`}
          >
            {t === "privacidade" ? "Política de Privacidade" : "Termos de Uso"}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center gap-3 text-neutral-500 text-sm">
          <div className="w-5 h-5 border-2 border-neutral-600 border-t-transparent rounded-full animate-spin" />
          Carregando...
        </div>
      ) : (
        <div className="space-y-4">

          {/* Data de atualização */}
          <div className="bg-[#111414] border border-white/5 rounded-2xl p-5">
            <label className="block text-xs font-black text-neutral-400 uppercase tracking-widest mb-2">
              Data da última atualização
            </label>
            <div className="flex items-center gap-3">
              <input
                value={form[updatedKey]}
                onChange={set(updatedKey)}
                className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-primary-container transition-colors w-72"
                placeholder="ex: 25 de abril de 2026"
              />
              <button
                onClick={() => setForm(f => ({ ...f, [updatedKey]: today() }))}
                className="px-4 py-2.5 rounded-xl border border-white/10 text-neutral-400 hover:text-white text-xs transition-all"
              >
                Usar hoje
              </button>
            </div>
          </div>

          {/* Editor / Preview */}
          <div className="bg-[#111414] border border-white/5 rounded-2xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3 border-b border-white/5">
              <p className="text-xs font-black text-neutral-400 uppercase tracking-widest">
                {docLabel}
              </p>
              <p className="text-xs text-neutral-600">
                {preview ? "Prévia do conteúdo" : "Suporta HTML — edite diretamente o trecho que deseja alterar"}
              </p>
            </div>

            {preview ? (
              <div
                className="p-8 min-h-[520px] text-neutral-300 leading-relaxed
                  [&_h2]:text-white [&_h2]:font-black [&_h2]:text-base [&_h2]:mt-6 [&_h2]:mb-2
                  [&_p]:text-neutral-400 [&_p]:text-sm [&_p]:leading-relaxed
                  [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1
                  [&_li]:text-neutral-400 [&_li]:text-sm
                  [&_strong]:text-white [&_strong]:font-black
                  [&_a]:text-primary-container [&_a]:underline
                  [&_table]:w-full [&_th]:text-left [&_th]:text-xs [&_th]:font-black [&_th]:text-neutral-300 [&_th]:py-2 [&_th]:border-b [&_th]:border-white/10
                  [&_td]:text-sm [&_td]:text-neutral-400 [&_td]:py-2 [&_td]:border-b [&_td]:border-white/5"
                dangerouslySetInnerHTML={{ __html: form[contentKey] }}
              />
            ) : (
              <textarea
                value={form[contentKey]}
                onChange={set(contentKey)}
                rows={32}
                className="w-full bg-transparent px-5 py-4 text-sm text-neutral-300 font-mono outline-none resize-none leading-relaxed"
              />
            )}
          </div>

          {/* Dica */}
          <div className="flex items-start gap-3 bg-primary-container/10 border border-primary-container/20 rounded-2xl p-4">
            <Icon name="info" className="text-primary-container text-lg flex-shrink-0 mt-0.5" />
            <p className="text-xs text-neutral-400 leading-relaxed">
              Edite apenas o trecho que precisa alterar — não é necessário colar o texto completo novamente. Use a <strong className="text-white">Prévia</strong> para conferir antes de salvar. O conteúdo salvo aqui substitui automaticamente as páginas <strong className="text-white">/privacidade</strong> e <strong className="text-white">/termos</strong>.
            </p>
          </div>

        </div>
      )}
    </div>
  );
}

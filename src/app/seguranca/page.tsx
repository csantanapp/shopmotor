import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Segurança — ShopMotor",
  description: "Dicas e práticas para usar a ShopMotor com segurança.",
};

export default function SegurancaPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12 space-y-10">

      <div className="space-y-2">
        <p className="text-xs font-black uppercase tracking-widest text-primary">Proteção</p>
        <h1 className="text-4xl font-black tracking-tighter text-on-surface">Segurança</h1>
        <p className="text-on-surface-variant text-sm">Compre e venda com tranquilidade. Conheça nossas práticas e dicas de segurança.</p>
      </div>

      {/* Alerta */}
      <div className="flex items-start gap-4 bg-yellow-50 border border-yellow-200 rounded-2xl p-5">
        <span className="material-symbols-outlined text-yellow-600 text-2xl flex-shrink-0">warning</span>
        <div>
          <p className="font-black text-yellow-900 text-sm">Atenção</p>
          <p className="text-sm text-yellow-800 mt-1">A ShopMotor nunca solicita pagamentos antecipados fora da plataforma, nem pede sua senha por e-mail ou WhatsApp. Desconfie de qualquer contato suspeito.</p>
        </div>
      </div>

      {/* Seções */}
      <div className="space-y-8">

        <Section icon="lock" title="Sua Conta">
          <Tips items={[
            "Use uma senha forte com letras maiúsculas, minúsculas, números e símbolos.",
            "Nunca compartilhe sua senha com ninguém, nem com funcionários da ShopMotor.",
            "Ative a verificação em 2 etapas em Minha Conta > Segurança.",
            "Desconecte-se após usar em dispositivos compartilhados.",
            "Se suspeitar de acesso não autorizado, altere sua senha imediatamente.",
          ]} />
        </Section>

        <Section icon="sell" title="Ao Anunciar">
          <Tips items={[
            "Informe apenas dados verdadeiros sobre o veículo.",
            "Não divulgue seu endereço residencial no anúncio.",
            "Use o sistema de mensagens interno da ShopMotor para se comunicar com compradores.",
            "Jamais aceite pagamentos por transferências internacionais ou métodos incomuns.",
            "Desconfie de compradores que oferecem valores acima do pedido sem motivo claro.",
          ]} />
        </Section>

        <Section icon="search" title="Ao Comprar">
          <Tips items={[
            "Pesquise o vendedor: veja avaliações, tempo de cadastro e outros anúncios.",
            "Nunca pague o veículo antes de vê-lo pessoalmente e verificar a documentação.",
            "Exija o documento do veículo, CNH do vendedor e comprovante de propriedade.",
            "Realize a transferência do veículo imediatamente após a compra no DETRAN.",
            "Prefira pagamentos seguros como TED, DOC ou financiamento via banco.",
            "Leve um mecânico de confiança para avaliar o veículo antes de fechar negócio.",
          ]} />
        </Section>

        <Section icon="handshake" title="No Encontro Presencial">
          <Tips items={[
            "Marque encontros em locais públicos e movimentados.",
            "Leve um acompanhante sempre que possível.",
            "Não realize test-drives com desconhecidos sem antes verificar documentos.",
            "Avise alguém de confiança sobre o local e horário do encontro.",
          ]} />
        </Section>

        <Section icon="phishing" title="Golpes Comuns">
          <div className="space-y-3 text-sm text-on-surface-variant">
            <GolpeItem titulo="Falso depósito" desc="Comprador envia comprovante falso e pede para entregar o veículo antes de confirmar o pagamento. Sempre aguarde a compensação bancária real." />
            <GolpeItem titulo="Anúncio clonado" desc="Golpistas copiam anúncios legítimos com preços abaixo do mercado para atrair vítimas. Sempre consulte o anunciante diretamente pela plataforma." />
            <GolpeItem titulo="Phishing" desc='E-mails e mensagens que imitam a ShopMotor pedindo login ou pagamento fora do site. Verifique sempre se o domínio é "shopmotor.com.br".' />
            <GolpeItem titulo="Carro com débitos" desc="Pesquise a placa do veículo no site do DETRAN de seu estado antes de comprar para verificar multas, recall e restrições." />
          </div>
        </Section>

      </div>

      <div className="bg-surface-container-lowest rounded-2xl p-6 flex flex-col md:flex-row items-center gap-4 justify-between shadow-sm">
        <div>
          <p className="font-black text-on-surface">Identificou alguma irregularidade?</p>
          <p className="text-sm text-on-surface-variant">Denuncie pelo nosso canal de segurança.</p>
        </div>
        <Link href="/contato" className="bg-primary-container text-on-primary-container font-black px-8 py-3 rounded-full text-sm uppercase tracking-widest hover:-translate-y-0.5 transition-all flex-shrink-0">
          Reportar problema
        </Link>
      </div>

    </div>
  );
}

function Section({ icon, title, children }: { icon: string; title: string; children: React.ReactNode }) {
  return (
    <div className="bg-surface-container-lowest rounded-2xl shadow-sm overflow-hidden">
      <div className="flex items-center gap-3 px-6 py-4 border-b border-outline-variant/30">
        <span className="material-symbols-outlined text-primary text-xl">{icon}</span>
        <h2 className="font-black text-on-surface">{title}</h2>
      </div>
      <div className="px-6 py-5">{children}</div>
    </div>
  );
}

function Tips({ items }: { items: string[] }) {
  return (
    <ul className="space-y-2">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-2 text-sm text-on-surface-variant">
          <span className="material-symbols-outlined text-green-600 text-base flex-shrink-0 mt-0.5">check_circle</span>
          {item}
        </li>
      ))}
    </ul>
  );
}

function GolpeItem({ titulo, desc }: { titulo: string; desc: string }) {
  return (
    <div className="flex items-start gap-3 bg-error/5 rounded-xl p-4">
      <span className="material-symbols-outlined text-error text-base flex-shrink-0 mt-0.5">dangerous</span>
      <div>
        <p className="font-bold text-on-surface">{titulo}</p>
        <p className="text-on-surface-variant mt-0.5">{desc}</p>
      </div>
    </div>
  );
}

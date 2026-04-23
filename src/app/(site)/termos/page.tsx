import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Termos de Uso — ShopMotor",
  description: "Leia os Termos de Uso da plataforma ShopMotor.",
};

const LAST_UPDATE = "21 de abril de 2026";

export default function TermosPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12 space-y-10">

      {/* Header */}
      <div className="space-y-2">
        <p className="text-xs font-black uppercase tracking-widest text-primary">ShopMotor</p>
        <h1 className="text-4xl font-black tracking-tighter text-on-surface">Termos de Uso</h1>
        <p className="text-sm text-on-surface-variant">Última atualização: {LAST_UPDATE}</p>
      </div>

      <div className="prose prose-neutral max-w-none space-y-8 text-on-surface-variant text-sm leading-relaxed">

        <Section title="1. Aceitação dos Termos">
          <p>
            Ao acessar ou utilizar a plataforma ShopMotor, você concorda com estes Termos de Uso. Se não concordar
            com alguma das condições aqui descritas, não utilize nossos serviços.
          </p>
        </Section>

        <Section title="2. Descrição do Serviço">
          <p>
            A ShopMotor é uma plataforma de anúncios de veículos que conecta compradores e vendedores (pessoas físicas
            e jurídicas). Não somos parte nas negociações entre usuários e não garantimos a conclusão de nenhuma transação.
          </p>
        </Section>

        <Section title="3. Cadastro e Conta">
          <ul>
            <li>Você deve ter no mínimo 18 anos para criar uma conta.</li>
            <li>As informações fornecidas no cadastro devem ser verdadeiras e atualizadas.</li>
            <li>Você é responsável pela confidencialidade de sua senha e por todas as atividades realizadas em sua conta.</li>
            <li>Em caso de uso não autorizado da sua conta, notifique-nos imediatamente pelo e-mail contato@shopmotor.com.br.</li>
          </ul>
        </Section>

        <Section title="4. Publicação de Anúncios">
          <ul>
            <li>Somente o proprietário legal do veículo, ou seu representante autorizado, pode publicar anúncios.</li>
            <li>As informações do anúncio (preço, quilometragem, ano, condição) devem ser precisas e verdadeiras.</li>
            <li>É proibido anunciar veículos roubados, adulterados ou com documentação irregular.</li>
            <li>A ShopMotor reserva-se o direito de remover anúncios que violem estes termos sem aviso prévio.</li>
            <li>Cada usuário pode publicar anúncios conforme os limites do seu plano contratado.</li>
          </ul>
        </Section>

        <Section title="5. Conduta do Usuário">
          <p>É expressamente proibido:</p>
          <ul>
            <li>Usar a plataforma para fins ilegais ou fraudulentos.</li>
            <li>Publicar informações falsas, enganosas ou spam.</li>
            <li>Assediar, ameaçar ou prejudicar outros usuários.</li>
            <li>Tentar acessar sistemas ou dados de outros usuários sem autorização.</li>
            <li>Utilizar bots, scrapers ou qualquer meio automatizado para extrair dados da plataforma.</li>
          </ul>
        </Section>

        <Section title="6. Responsabilidades">
          <p>
            A ShopMotor atua apenas como intermediária e não se responsabiliza por:
          </p>
          <ul>
            <li>Veracidade das informações fornecidas pelos anunciantes.</li>
            <li>Qualidade, estado ou legalidade dos veículos anunciados.</li>
            <li>Negociações, pagamentos ou entregas realizadas entre usuários.</li>
            <li>Perdas ou danos decorrentes do uso ou impossibilidade de uso da plataforma.</li>
          </ul>
        </Section>

        <Section title="7. Propriedade Intelectual">
          <p>
            Todo o conteúdo da plataforma ShopMotor — incluindo marca, logo, layout, textos e código — é propriedade
            exclusiva da ShopMotor e protegido por leis de direitos autorais. As fotos publicadas nos anúncios são de
            responsabilidade do anunciante, que garante possuir os direitos sobre elas.
          </p>
        </Section>

        <Section title="8. Planos e Pagamentos">
          <p>
            Alguns recursos da plataforma são pagos (impulsionamento de anúncios, planos premium). Ao contratar um
            serviço pago, você concorda com os valores e condições exibidos no momento da contratação. Não há reembolso
            de créditos já utilizados.
          </p>
        </Section>

        <Section title="9. Encerramento de Conta">
          <p>
            Você pode encerrar sua conta a qualquer momento pela seção "Minha Conta". A ShopMotor também pode suspender
            ou encerrar contas que violem estes Termos de Uso, sem aviso prévio.
          </p>
        </Section>

        <Section title="10. Alterações dos Termos">
          <p>
            Podemos atualizar estes Termos periodicamente. Alterações significativas serão comunicadas por e-mail ou
            aviso na plataforma. O uso continuado após as alterações implica aceitação dos novos termos.
          </p>
        </Section>

        <Section title="11. Lei Aplicável">
          <p>
            Estes Termos são regidos pelas leis brasileiras. Fica eleito o foro da Comarca de Maringá/PR para dirimir
            eventuais disputas, com renúncia a qualquer outro, por mais privilegiado que seja.
          </p>
        </Section>

        <Section title="12. Contato">
          <p>
            Em caso de dúvidas sobre estes Termos, entre em contato: <strong>contato@shopmotor.com.br</strong>
          </p>
        </Section>

      </div>

      <div className="pt-6 border-t border-outline-variant flex flex-wrap gap-4 text-sm">
        <Link href="/privacidade" className="text-primary font-semibold hover:underline">
          Política de Privacidade
        </Link>
        <Link href="/" className="text-on-surface-variant hover:underline">
          Voltar ao início
        </Link>
      </div>

    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-3">
      <h2 className="text-base font-black text-on-surface">{title}</h2>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

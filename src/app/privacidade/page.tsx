import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Política de Privacidade — ShopMotor",
  description: "Saiba como a ShopMotor coleta, usa e protege seus dados pessoais.",
};

const LAST_UPDATE = "21 de abril de 2026";

export default function PrivacidadePage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12 space-y-10">

      {/* Header */}
      <div className="space-y-2">
        <p className="text-xs font-black uppercase tracking-widest text-primary">ShopMotor</p>
        <h1 className="text-4xl font-black tracking-tighter text-on-surface">Política de Privacidade</h1>
        <p className="text-sm text-on-surface-variant">Última atualização: {LAST_UPDATE}</p>
      </div>

      <div className="space-y-8 text-on-surface-variant text-sm leading-relaxed">

        <Section title="1. Introdução">
          <p>
            A ShopMotor está comprometida com a proteção dos seus dados pessoais, em conformidade com a
            Lei Geral de Proteção de Dados (LGPD — Lei 13.709/2018). Esta Política descreve quais dados
            coletamos, como os utilizamos e quais são seus direitos.
          </p>
        </Section>

        <Section title="2. Dados que Coletamos">
          <p>Coletamos os seguintes dados ao longo do uso da plataforma:</p>
          <table>
            <thead>
              <tr>
                <th>Categoria</th>
                <th>Exemplos</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Dados de cadastro</td>
                <td>Nome, e-mail, CPF/CNPJ, telefone, endereço</td>
              </tr>
              <tr>
                <td>Dados de anúncio</td>
                <td>Fotos, descrição, preço, localização do veículo</td>
              </tr>
              <tr>
                <td>Dados de uso</td>
                <td>Páginas visitadas, buscas realizadas, favoritos</td>
              </tr>
              <tr>
                <td>Dados técnicos</td>
                <td>Endereço IP, tipo de navegador, dispositivo</td>
              </tr>
            </tbody>
          </table>
        </Section>

        <Section title="3. Como Usamos seus Dados">
          <ul>
            <li><strong>Prestação do serviço:</strong> criar e gerenciar sua conta, publicar anúncios e facilitar o contato entre compradores e vendedores.</li>
            <li><strong>Segurança:</strong> verificar identidade, prevenir fraudes e proteger a plataforma.</li>
            <li><strong>Comunicação:</strong> enviar notificações sobre anúncios, mensagens recebidas e atualizações da plataforma.</li>
            <li><strong>Melhoria do serviço:</strong> analisar comportamento de uso para aprimorar funcionalidades.</li>
            <li><strong>Obrigações legais:</strong> cumprir requisitos regulatórios e responder a solicitações de autoridades competentes.</li>
          </ul>
        </Section>

        <Section title="4. Base Legal para o Tratamento">
          <p>Tratamos seus dados com fundamento nas seguintes bases legais da LGPD:</p>
          <ul>
            <li><strong>Execução de contrato:</strong> para prestar os serviços contratados.</li>
            <li><strong>Legítimo interesse:</strong> para segurança e melhoria da plataforma.</li>
            <li><strong>Consentimento:</strong> para comunicações de marketing (você pode revogar a qualquer momento).</li>
            <li><strong>Obrigação legal:</strong> quando exigido por lei ou autoridade.</li>
          </ul>
        </Section>

        <Section title="5. Compartilhamento de Dados">
          <p>Seus dados podem ser compartilhados com:</p>
          <ul>
            <li><strong>Outros usuários:</strong> seu nome, cidade e telefone (se autorizado) são visíveis para compradores interessados em seus anúncios.</li>
            <li><strong>Prestadores de serviço:</strong> provedores de hospedagem, processamento de pagamentos e análise de dados que atuam sob nosso contrato.</li>
            <li><strong>Autoridades:</strong> quando exigido por lei, ordem judicial ou investigação legítima.</li>
          </ul>
          <p>Não vendemos nem alugamos seus dados pessoais a terceiros.</p>
        </Section>

        <Section title="6. Armazenamento e Segurança">
          <p>
            Seus dados são armazenados em servidores seguros localizados no Brasil. Adotamos medidas técnicas
            e organizacionais para proteger suas informações contra acesso não autorizado, perda ou destruição,
            incluindo criptografia de senhas e comunicações via HTTPS.
          </p>
        </Section>

        <Section title="7. Retenção de Dados">
          <p>
            Mantemos seus dados enquanto sua conta estiver ativa ou pelo tempo necessário para cumprir obrigações
            legais. Após o encerramento da conta, dados de identificação são anonimizados ou excluídos em até 90 dias,
            exceto quando a retenção for exigida por lei.
          </p>
        </Section>

        <Section title="8. Cookies">
          <p>
            Utilizamos cookies essenciais para manter sua sessão autenticada e cookies analíticos (de forma anonimizada)
            para entender como a plataforma é utilizada. Você pode desativar cookies não essenciais nas configurações
            do seu navegador, mas isso pode afetar algumas funcionalidades.
          </p>
        </Section>

        <Section title="9. Seus Direitos (LGPD)">
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
        </Section>

        <Section title="10. Dados de Menores">
          <p>
            A ShopMotor não coleta intencionalmente dados de menores de 18 anos. Se identificarmos que um menor
            forneceu dados sem consentimento dos responsáveis, excluiremos essas informações imediatamente.
          </p>
        </Section>

        <Section title="11. Alterações desta Política">
          <p>
            Podemos atualizar esta Política periodicamente. A data de última atualização é sempre indicada no topo
            desta página. Recomendamos revisá-la regularmente.
          </p>
        </Section>

        <Section title="12. Encarregado de Dados (DPO)">
          <p>
            Nosso encarregado de proteção de dados pode ser contatado pelo e-mail:{" "}
            <strong>privacidade@shopmotor.com.br</strong>
          </p>
        </Section>

      </div>

      <div className="pt-6 border-t border-outline-variant flex flex-wrap gap-4 text-sm">
        <Link href="/termos" className="text-primary font-semibold hover:underline">
          Termos de Uso
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

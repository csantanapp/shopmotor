import Link from "next/link";

export default function UnsubscribedPage() {
  return (
    <div className="min-h-screen bg-[#0a0c0c] flex items-center justify-center p-6">
      <div className="text-center max-w-sm">
        <div className="w-16 h-16 bg-green-500/10 border border-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="material-symbols-outlined text-green-400 text-3xl">check_circle</span>
        </div>
        <h1 className="text-2xl font-black text-white mb-2">Descadastrado com sucesso</h1>
        <p className="text-neutral-400 text-sm mb-8">
          Você não receberá mais e-mails de marketing da ShopMotor.<br />
          Notificações importantes sobre sua conta continuarão sendo enviadas.
        </p>
        <Link href="/" className="bg-yellow-500 hover:bg-yellow-400 text-black font-black px-6 py-3 rounded-xl text-sm transition-colors">
          Voltar ao site
        </Link>
      </div>
    </div>
  );
}

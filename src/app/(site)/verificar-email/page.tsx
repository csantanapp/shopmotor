"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";

function VerifyContent() {
  const params = useSearchParams();
  const status = params.get("status");

  if (status === "ok") {
    return (
      <div className="text-center">
        <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-2xl font-black text-white mb-3">E-mail confirmado!</h1>
        <p className="text-zinc-400 mb-8">Sua conta está verificada. Agora você tem acesso completo à plataforma.</p>
        <Link href="/perfil" className="bg-yellow-400 text-black font-bold px-8 py-3 rounded-full hover:bg-yellow-300 transition-colors">
          Ir para meu perfil
        </Link>
      </div>
    );
  }

  if (status === "expired") {
    return (
      <div className="text-center">
        <div className="w-16 h-16 bg-yellow-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h1 className="text-2xl font-black text-white mb-3">Link expirado</h1>
        <p className="text-zinc-400 mb-8">Este link de verificação expirou. Solicite um novo link na sua área de perfil.</p>
        <Link href="/perfil/conta" className="bg-yellow-400 text-black font-bold px-8 py-3 rounded-full hover:bg-yellow-300 transition-colors">
          Ir para minha conta
        </Link>
      </div>
    );
  }

  if (status === "invalid") {
    return (
      <div className="text-center">
        <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        <h1 className="text-2xl font-black text-white mb-3">Link inválido</h1>
        <p className="text-zinc-400 mb-8">Este link de verificação é inválido ou já foi utilizado.</p>
        <Link href="/" className="bg-yellow-400 text-black font-bold px-8 py-3 rounded-full hover:bg-yellow-300 transition-colors">
          Voltar ao início
        </Link>
      </div>
    );
  }

  return (
    <div className="text-center">
      <div className="w-16 h-16 bg-yellow-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
        <svg className="w-8 h-8 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      </div>
      <h1 className="text-2xl font-black text-white mb-3">Verifique seu e-mail</h1>
      <p className="text-zinc-400 mb-2">Enviamos um link de confirmação para o seu e-mail.</p>
      <p className="text-zinc-500 text-sm">Não recebeu? Verifique sua caixa de spam ou solicite um novo link na sua área de perfil.</p>
    </div>
  );
}

export default function VerificarEmailPage() {
  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-10 max-w-md w-full">
        <Suspense fallback={<div className="text-zinc-400 text-center">Carregando...</div>}>
          <VerifyContent />
        </Suspense>
      </div>
    </div>
  );
}

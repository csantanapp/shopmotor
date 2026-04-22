import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-zinc-100 border-t border-zinc-200">
      <div className="max-w-screen-2xl mx-auto px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div>
            <div className="text-lg font-bold text-zinc-900 mb-6 uppercase tracking-tighter">SHOPMOTOR</div>
            <p className="text-sm text-zinc-500 leading-relaxed mb-6">
              A plataforma definitiva para entusiastas e compradores de veículos de alta performance.
            </p>
            <div className="flex gap-3">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-zinc-200 flex items-center justify-center hover:bg-black hover:text-white transition-all">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M24 12.073C24 5.404 18.627 0 12 0S0 5.404 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.791-4.697 4.533-4.697 1.313 0 2.686.236 2.686.236v2.97h-1.513c-1.491 0-1.956.93-1.956 1.887v2.267h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z"/></svg>
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-zinc-200 flex items-center justify-center hover:bg-black hover:text-white transition-all">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
              </a>
              <a href="https://youtube.com" target="_blank" rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-zinc-200 flex items-center justify-center hover:bg-black hover:text-white transition-all">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
              </a>
              <a href="https://tiktok.com" target="_blank" rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-zinc-200 flex items-center justify-center hover:bg-black hover:text-white transition-all">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/></svg>
              </a>
            </div>
          </div>

          <div>
            <h5 className="text-zinc-900 font-bold mb-6 uppercase text-sm tracking-widest">Atendimento</h5>
            <ul className="space-y-4 text-sm text-zinc-500">
              <li><Link href="/ajuda" className="hover:text-yellow-600 transition-colors">Central de Ajuda</Link></li>
              <li><Link href="/seguranca" className="hover:text-yellow-600 transition-colors">Segurança</Link></li>
              <li><Link href="/faq" className="hover:text-yellow-600 transition-colors">Dúvidas Frequentes</Link></li>
              <li><Link href="/contato" className="hover:text-yellow-600 transition-colors">Contato</Link></li>
            </ul>
          </div>

          <div>
            <h5 className="text-zinc-900 font-bold mb-6 uppercase text-sm tracking-widest">Institucional</h5>
            <ul className="space-y-4 text-sm text-zinc-500">
              <li><Link href="/sobre" className="hover:text-yellow-600 transition-colors">Sobre Nós</Link></li>
              <li><Link href="/anuncie" className="hover:text-yellow-600 transition-colors">Anuncie conosco</Link></li>
              <li><Link href="/termos" className="hover:text-yellow-600 transition-colors">Termos de Uso</Link></li>
              <li><Link href="/privacidade" className="hover:text-yellow-600 transition-colors">Privacidade</Link></li>
            </ul>
          </div>

        </div>

        <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-zinc-200">
          <span className="text-sm text-zinc-600 mb-4 md:mb-0">© 2024 SHOPMOTOR. PRECISION ENGINEERED.</span>
          <div className="flex gap-6">
            <Link href="/termos" className="text-zinc-500 hover:text-yellow-600 text-sm">Termos</Link>
            <Link href="/privacidade" className="text-zinc-500 hover:text-yellow-600 text-sm">Privacidade</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

import Link from "next/link";
import Image from "next/image";
import Icon from "@/components/ui/Icon";

export default function Footer() {
  return (
    <footer className="bg-zinc-100 border-t border-zinc-200">
      <div className="max-w-screen-2xl mx-auto px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div>
            <div className="text-lg font-bold text-zinc-900 mb-6 uppercase tracking-tighter">KINETIC EDITORIAL</div>
            <p className="text-sm text-zinc-500 leading-relaxed mb-6">
              A plataforma definitiva para entusiastas e compradores de veículos de alta performance.
            </p>
            <div className="flex gap-4">
              <button className="w-10 h-10 rounded-full bg-zinc-200 flex items-center justify-center hover:bg-primary-container transition-all">
                <Icon name="public" className="text-sm" />
              </button>
              <button className="w-10 h-10 rounded-full bg-zinc-200 flex items-center justify-center hover:bg-primary-container transition-all">
                <Icon name="share" className="text-sm" />
              </button>
            </div>
          </div>

          <div>
            <h5 className="text-zinc-900 font-bold mb-6 uppercase text-sm tracking-widest">Atendimento</h5>
            <ul className="space-y-4 text-sm text-zinc-500">
              <li><Link href="#" className="hover:text-yellow-600 transition-colors">Central de Ajuda</Link></li>
              <li><Link href="#" className="hover:text-yellow-600 transition-colors">Segurança</Link></li>
              <li><Link href="#" className="hover:text-yellow-600 transition-colors">Dúvidas Frequentes</Link></li>
              <li><Link href="#" className="hover:text-yellow-600 transition-colors">Contato</Link></li>
            </ul>
          </div>

          <div>
            <h5 className="text-zinc-900 font-bold mb-6 uppercase text-sm tracking-widest">Institucional</h5>
            <ul className="space-y-4 text-sm text-zinc-500">
              <li><Link href="#" className="hover:text-yellow-600 transition-colors">Sobre Nós</Link></li>
              <li><Link href="#" className="hover:text-yellow-600 transition-colors">Carreiras</Link></li>
              <li><Link href="#" className="hover:text-yellow-600 transition-colors">Termos de Uso</Link></li>
              <li><Link href="#" className="hover:text-yellow-600 transition-colors">Privacidade</Link></li>
            </ul>
          </div>

          <div>
            <h5 className="text-zinc-900 font-bold mb-6 uppercase text-sm tracking-widest">Localização</h5>
            <div className="rounded-xl overflow-hidden grayscale hover:grayscale-0 transition-all">
              <Image
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAIxYWlMv14_hcMn9CENddYXKHDkSiS58MG6HTYcMbbRXJpckWc61v3i5yEPR6Re-8kO5_ns2yLbassPNzAzJB8VPO2gzigkpvn0v5Xn5_K8xgqlB9UKrkC9eukCRqJRAyX2NQWD2FVd53mLSzLHq7fHvo04jLVqKwF9RExEXKSmd-mbvZsMa4R0ZziapoX6jXRsD8nsqn3oMuFmv4D0fbX6adsyBZWK3LT_7QZ6YDS6YbtiaGfQMaQd6Gb1fGrGnKN2OmAqNsLg5c"
                alt="Mapa São Paulo"
                width={300}
                height={128}
                className="w-full h-32 object-cover"
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-zinc-200">
          <span className="text-sm text-zinc-600 mb-4 md:mb-0">© 2024 KINETIC EDITORIAL. PRECISION ENGINEERED.</span>
          <div className="flex gap-6">
            <Link href="#" className="text-zinc-500 hover:text-yellow-600 text-sm">Termos</Link>
            <Link href="#" className="text-zinc-500 hover:text-yellow-600 text-sm">Privacidade</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

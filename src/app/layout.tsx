import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Script from "next/script";
import Link from "next/link";
import MobileMenu from "@/components/MobileMenu";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Portal de Acompanhantes - Portugal",
  description: "Encontre a companhia perfeita em Portugal",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt">
      <head>
        <Script src="https://cdn.tailwindcss.com" strategy="beforeInteractive" />
        <Script src="https://cdn.jsdelivr.net/npm/alpinejs@3.x.x/dist/cdn.min.js" strategy="beforeInteractive" />
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
      </head>
      <body className={`${inter.className} font-sans antialiased bg-gray-50`}>
        {/* Navigation Bar */}
        <nav className="bg-white shadow-lg sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              {/* Logo */}
              <div className="flex-shrink-0">
                <Link href="/" className="text-2xl font-bold text-red-600">
                  Portal<span className="text-gray-800">Escorts</span>
                </Link>
              </div>
              
              {/* Navigation Links */}
              <div className="hidden md:block">
                <div className="ml-10 flex items-baseline space-x-4">
                  <Link href="/" className="text-gray-700 hover:text-red-600 px-3 py-2 rounded-md text-sm font-medium transition">Home</Link>
                  <Link href="/perfis" className="text-gray-700 hover:text-red-600 px-3 py-2 rounded-md text-sm font-medium transition">Perfis</Link>
                  <Link href="/cidades" className="text-gray-700 hover:text-red-600 px-3 py-2 rounded-md text-sm font-medium transition">Cidades</Link>
                  <Link href="/criar-perfil" className="bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-red-700 transition">Criar Perfil</Link>
                  <Link href="/login" className="text-gray-700 hover:text-red-600 px-3 py-2 rounded-md text-sm font-medium transition">Login</Link>
                </div>
              </div>
              
              {/* Mobile menu */}
              <MobileMenu />
            </div>
          </div>
        </nav>

        {children}

        {/* Footer */}
        <footer className="bg-gray-900 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              {/* Logo and description */}
              <div className="col-span-1 md:col-span-2">
                <div className="text-2xl font-bold text-red-600 mb-4">
                  acompanhantes<span className="text-white">.life</span>
                </div>
                <p className="text-gray-300 mb-4">
                  A plataforma líder em Portugal para entretenimento adulto, conectando pessoas de forma segura e discreta.
                </p>
                <div className="flex space-x-4">
                  <a href="#" className="text-gray-400 hover:text-red-600 transition">
                    <i className="fab fa-facebook-f text-xl"></i>
                  </a>
                  <a href="#" className="text-gray-400 hover:text-red-600 transition">
                    <i className="fab fa-twitter text-xl"></i>
                  </a>
                  <a href="#" className="text-gray-400 hover:text-red-600 transition">
                    <i className="fab fa-instagram text-xl"></i>
                  </a>
                </div>
              </div>
              
              {/* Legal Links */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Legal</h3>
                <ul className="space-y-2">
                  <li><a href="/termos" className="text-gray-300 hover:text-red-600 transition">Termos & Condições</a></li>
                  <li><a href="/privacidade" className="text-gray-300 hover:text-red-600 transition">Política de Privacidade</a></li>
                  <li><a href="/cookies" className="text-gray-300 hover:text-red-600 transition">Cookies</a></li>
                </ul>
              </div>
              
              {/* Support Links */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Informações</h3>
                <ul className="space-y-2">
                  <li><a href="/parceiros" className="text-gray-300 hover:text-red-600 transition">Parceiros</a></li>
                  <li><a href="/publicidade" className="text-gray-300 hover:text-red-600 transition">Publicidade</a></li>
                  <li><a href="/contactos" className="text-gray-300 hover:text-red-600 transition">Contactos</a></li>
                </ul>
              </div>
            </div>
            
            <div className="border-t border-gray-800 mt-8 pt-8 text-center">
              <p className="text-gray-400">
                © {new Date().getFullYear()} acompanhantes.life. Todos os direitos reservados. | Conteúdo destinado exclusivamente a maiores de 18 anos.
              </p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
} 
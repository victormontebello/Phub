import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Mail, Phone, MapPin } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900 dark:bg-gray-950 text-gray-300 dark:text-gray-400 transition-colors">
      <div className="px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <Link to="/" className="flex items-center space-x-2 mb-4">
              <div className="bg-primary-500 dark:bg-primary-500-dark p-2 rounded-lg">
                <Heart className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold text-white dark:text-white">PetHub</span>
            </Link>
            <p className="text-gray-400 dark:text-gray-500 mb-4 max-w-md">
              Seu marketplace de confiança para pets e serviços de animais. Conectando amantes de animais, criadores responsáveis e fornecedores de serviços profissionais em um único lugar.
            </p>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4" />
                <span className="text-sm">montebellovictor@gmail.com</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4" />
                <span className="text-sm">+55 (62) 98280-8116</span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4" />
                <span className="text-sm">Disponível em todo o Brasil</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white dark:text-white font-semibold mb-4">Links Rápidos</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/pets" className="hover:text-primary-400 dark:hover:text-primary-500-dark transition-colors">
                  Navegar Pets
                </Link>
              </li>
              <li>
                <Link to="/services" className="hover:text-primary-400 dark:hover:text-primary-500-dark transition-colors">
                  Serviços de Pets
                </Link>
              </li>
              <li>
                <Link to="/auth" className="hover:text-primary-400 dark:hover:text-primary-500-dark transition-colors">
                  Vender/Listar
                </Link>
              </li>
              <li>
                <a href="#" className="hover:text-primary-400 dark:hover:text-primary-500-dark transition-colors">
                  Dicas de Segurança
                </a>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-white dark:text-white font-semibold mb-4">Suporte</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="hover:text-primary-400 dark:hover:text-primary-500-dark transition-colors">
                  Centro de Ajuda
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary-400 dark:hover:text-primary-500-dark transition-colors">
                  Contate-nos
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary-400 dark:hover:text-primary-500-dark transition-colors">
                  Relatar Problema
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary-400 dark:hover:text-primary-500-dark transition-colors">
                  Diretrizes da Comunidade
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 dark:border-gray-700 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 dark:text-gray-500 text-sm">
            © 2025 PetHub. Todos os direitos reservados.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a href="#" className="text-gray-400 dark:text-gray-500 hover:text-primary-400 dark:hover:text-primary-500-dark text-sm transition-colors">
              Política de Privacidade
            </a>
            <a href="#" className="text-gray-400 dark:text-gray-500 hover:text-primary-400 dark:hover:text-primary-500-dark text-sm transition-colors">
              Termos de Serviço
            </a>
            <a href="#" className="text-gray-400 dark:text-gray-500 hover:text-primary-400 dark:hover:text-primary-500-dark text-sm transition-colors">
              Política de Cookies
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
import React from 'react';
import { Mail, Phone, User, X } from 'lucide-react';
import { useUserProfile } from '../hooks/useProfileQueries';

interface ContactCardProps {
  sellerId: string;
  onClose: () => void;
  petName?: string;
}

export const ContactCard: React.FC<ContactCardProps> = ({ sellerId, onClose, petName }) => {
  const { data: contactInfo, isLoading, error } = useUserProfile(sellerId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40" onClick={onClose}>
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 w-full max-w-md relative transition-colors" onClick={(e) => e.stopPropagation()}>
        <button
          className="absolute top-4 right-4 text-gray-400 dark:text-gray-500 hover:text-primary-500 dark:hover:text-primary-400 text-xl"
          onClick={onClose}
          aria-label="Fechar"
        >
          <X className="w-6 h-6" />
        </button>
        {isLoading && <p className="text-gray-600 dark:text-gray-300">Carregando...</p>}
        {error && <p className="text-red-600 dark:text-red-400">Erro ao carregar contato.</p>}
        {contactInfo && (
          <>
            <div className="flex items-center gap-3 mb-6">
              <User className="w-8 h-8 text-primary-500 dark:text-primary-400" />
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Contato do Dono {petName && `de ${petName}`}</h3>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <User className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                <span className="font-medium text-gray-700 dark:text-gray-300">{contactInfo.full_name || 'Não informado'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                <span className="text-gray-700 dark:text-gray-300">{contactInfo.email || 'Não informado'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                <span className="text-gray-700 dark:text-gray-300">{contactInfo.phone || 'Não informado'}</span>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}; 
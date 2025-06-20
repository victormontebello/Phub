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
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md relative" onClick={(e) => e.stopPropagation()}>
        <button
          className="absolute top-4 right-4 text-gray-400 hover:text-primary-500 text-xl"
          onClick={onClose}
          aria-label="Fechar"
        >
          <X className="w-6 h-6" />
        </button>
        {isLoading && <p>Carregando...</p>}
        {error && <p>Erro ao carregar contato.</p>}
        {contactInfo && (
          <>
            <div className="flex items-center gap-3 mb-6">
              <User className="w-8 h-8 text-primary-500" />
              <h3 className="text-2xl font-bold text-gray-900">Contato do Dono {petName && `de ${petName}`}</h3>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <User className="w-5 h-5 text-gray-500" />
                <span className="font-medium text-gray-700">{contactInfo.full_name || 'Não informado'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-5 h-5 text-gray-500" />
                <span className="text-gray-700">{contactInfo.email || 'Não informado'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-5 h-5 text-gray-500" />
                <span className="text-gray-700">{contactInfo.phone || 'Não informado'}</span>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}; 
import React, { useState } from 'react';
import { X, ChevronLeft, ChevronRight, MapPin, Heart, ShieldCheck, User as UserIcon, Mail, Phone, Scale } from 'lucide-react';
import { useUserProfile } from '../hooks/useProfileQueries';

// Ajuste a interface Pet conforme necessário, importando-a de seu arquivo de tipos
interface Pet {
  id: string;
  seller_id: string;
  name: string;
  breed: string;
  age: string;
  location: string;
  description: string;
  images?: { id: string; image_url: string }[];
  vaccines?: string[];
  image_url?: string;
  portage?: 'pequeno' | 'medio' | 'grande';
  // Adicione outros campos do pet aqui
}

interface PetDetailsModalProps {
  pet: Pet | null;
  onClose: () => void;
}

export const PetDetailsModal: React.FC<PetDetailsModalProps> = ({ pet, onClose }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const { data: sellerProfile, isLoading: isLoadingSeller } = useUserProfile(pet?.seller_id);

  if (!pet) return null;

  const images = pet.images && pet.images.length > 0 ? pet.images : [{ id: 'fallback', image_url: pet.image_url || '/placeholder.png' }];

  const nextImage = () => setCurrentImageIndex((prev) => (prev + 1) % images.length);
  const prevImage = () => setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center" 
      onClick={onClose}
    >
      <div 
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col md:flex-row overflow-hidden transition-colors"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Image Carousel */}
        <div className="w-full md:w-1/2 relative">
          <img 
            src={images[currentImageIndex].image_url} 
            alt={pet.name} 
            className="w-full h-64 md:h-full object-cover"
          />
          {images.length > 1 && (
            <>
              <button onClick={nextImage} className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/70 dark:bg-gray-800/70 p-2 rounded-full hover:bg-white dark:hover:bg-gray-800 transition">
                <ChevronLeft className="h-6 w-6" />
              </button>
              <button onClick={prevImage} className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/70 dark:bg-gray-800/70 p-2 rounded-full hover:bg-white dark:hover:bg-gray-800 transition">
                <ChevronRight className="h-6 w-6" />
              </button>
            </>
          )}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
            {images.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full ${index === currentImageIndex ? 'bg-white' : 'bg-white/50'}`}
              />
            ))}
          </div>
          <button onClick={onClose} className="absolute top-4 right-4 bg-white/70 dark:bg-gray-800/70 p-2 rounded-full hover:bg-white dark:hover:bg-gray-800 transition">
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Pet Details */}
        <div className="w-full md:w-1/2 p-6 overflow-y-auto">
          <div className="flex justify-between items-start">
            <h2 className="text-3xl font-bold text-gray-800 dark:text-white">{pet.name}</h2>
            <button className="text-gray-400 hover:text-red-500">
              <Heart className="h-7 w-7" />
            </button>
          </div>
          <p className="text-lg text-gray-500 dark:text-gray-400 mb-4">{pet.breed}</p>
          
          <div className="flex flex-wrap gap-x-4 gap-y-2 items-center text-gray-600 dark:text-gray-300 mb-6">
            <div className="flex items-center">
              <MapPin className="h-5 w-5 mr-2" />
              <span>{pet.location}</span>
            </div>
            <div className="flex items-center">
              <span className="font-bold text-lg mr-2">•</span>
              <span>{pet.age}</span>
            </div>
            {pet.portage && (
              <div className="flex items-center">
                <span className="font-bold text-lg mr-2">•</span>
                <Scale className="h-5 w-5 mr-2" />
                <span className="capitalize">{pet.portage}</span>
              </div>
            )}
          </div>
          
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-2">Sobre</h3>
            <p className="text-gray-600 dark:text-gray-300 whitespace-pre-wrap">{pet.description}</p>
          </div>

          {pet.vaccines && pet.vaccines.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-2">Vacinas</h3>
              <div className="flex flex-wrap gap-2">
                {pet.vaccines.map((vaccine, index) => (
                  <div key={index} className="flex items-center bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400 text-sm font-medium px-3 py-1 rounded-full">
                    <ShieldCheck className="h-4 w-4 mr-1.5" />
                    {vaccine}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Seller Contact Info */}
          <div className="border-t border-gray-200 dark:border-gray-700 mt-6 pt-6">
            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-4">Informações do Vendedor</h3>
            {isLoadingSeller ? (
              <p className="text-gray-500 dark:text-gray-400">Carregando contato...</p>
            ) : sellerProfile ? (
              <div className="space-y-3">
                <div className="flex items-center text-gray-600 dark:text-gray-300">
                  <UserIcon className="h-5 w-5 mr-3 text-gray-400 dark:text-gray-500 flex-shrink-0" />
                  <span>{sellerProfile.full_name || 'Nome não informado'}</span>
                </div>
                <div className="flex items-center text-gray-600 dark:text-gray-300">
                  <Mail className="h-5 w-5 mr-3 text-gray-400 dark:text-gray-500 flex-shrink-0" />
                  <span>{sellerProfile.email || 'Email não informado'}</span>
                </div>
                <div className="flex items-center text-gray-600 dark:text-gray-300">
                  <Phone className="h-5 w-5 mr-3 text-gray-400 dark:text-gray-500 flex-shrink-0" />
                  <span>{sellerProfile.phone || 'Telefone não informado'}</span>
                </div>
              </div>
            ) : (
              <p className="text-red-500 dark:text-red-400">Não foi possível carregar as informações do vendedor.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}; 
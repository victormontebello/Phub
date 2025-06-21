import React, { useState, useMemo } from 'react';
import { Search, Heart, MapPin, Camera, Shield, Gift } from 'lucide-react';
import { usePets, userFavoritesHook, addToFavoritesHook, removeFromFavoritesHook } from '../hooks/useProfileQueries';
import { useSearchParams } from 'react-router-dom';
import { PetDetailsModal } from '../components/PetDetailsModal';
import { ContactCard } from '../components/ContactCard';
import { useAuth } from '../contexts/AuthContext';
import { petCategories as allPetCategories } from '../data/categories';

export const PetsPage: React.FC = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const initialCategory = searchParams.get('category') || 'all';
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedPet, setSelectedPet] = useState<any | null>(null);
  const [showContactModal, setShowContactModal] = useState(false);
  const [contactSellerId, setContactSellerId] = useState<string | null>(null);
  const [contactPetName, setContactPetName] = useState<string | null>(null);

  const categories = [
    { id: 'all', name: 'Todos os Pets' },
    ...allPetCategories.map(c => ({ id: c.value, name: c.label }))
  ];

  const { data: pets = [], isLoading } = usePets();
  const { data: favoritesData } = userFavoritesHook(user?.id);
  const favoriteIds = useMemo(() => favoritesData?.pets?.map(p => p.id) || [], [favoritesData]);
  const addToFavoritesMutation = addToFavoritesHook();
  const removeFromFavoritesMutation = removeFromFavoritesHook();

  const filteredPets = useMemo(() => {
    return pets.filter(pet => {
      const matchesCategory = selectedCategory === 'all' || pet.category === selectedCategory;
      const matchesSearch = searchQuery === '' || pet.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [pets, selectedCategory, searchQuery]);

  const handleToggleFavorite = (petId: string) => {
    if (!user) {
      alert('Você precisa estar logado para favoritar pets.');
      return;
    }

    const isFavorite = favoriteIds.includes(petId);
    isFavorite ? removeFromFavoritesMutation.mutate({ itemId: petId, itemType: 'pet' }) : addToFavoritesMutation.mutate({ itemId: petId, itemType: 'pet' });
  };

  const handleShowContact = (event: React.MouseEvent, pet: any) => {
    event.stopPropagation();
    setContactSellerId(pet.seller_id);
    setContactPetName(pet.name);
    setShowContactModal(true);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 transition-colors">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm overflow-hidden animate-pulse transition-colors">
                <div className="w-full h-64 bg-gray-200 dark:bg-gray-700"></div>
                <div className="p-6">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
                  <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
                  <div className="flex justify-between">
                    <div className="h-8 w-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    <div className="h-8 w-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 transition-colors">
        <div className="px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Encontre Seu Amigo Pet Perfeito
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Adote um pet amoroso de doadores verificados e resgates
            </p>
          </div>

          {/* Search and Filters */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 mb-8 transition-colors">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Search */}
              <div className="md:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-gray-500" />
                  <input
                    type="text"
                    placeholder="Procurar por nome ou raça..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-500-dark focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                  />
                </div>
              </div>

              {/* Category Filter */}
              <div>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full py-3 px-4 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-500-dark focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Results */}
          <div className="mb-6">
            <p className="text-gray-600 dark:text-gray-300">
              Mostrando {filteredPets.length} pets disponíveis para adoção
            </p>
          </div>

          {/* Pet Grid */}
          {filteredPets.length === 0 ? (
            <div className="text-center py-12">
              <Camera className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Nenhum pet encontrado</h3>
              <p className="text-gray-500 dark:text-gray-400">Tente ajustar seus critérios de busca</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPets.map((pet) => (
                <div key={pet.id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden group transition-colors" onClick={() => setSelectedPet(pet)}>
                  <div className="relative">
                    <img
                      src={pet.image_url || 'https://images.pexels.com/photos/1805164/pexels-photo-1805164.jpeg?auto=compress&cs=tinysrgb&w=400'}
                      alt={pet.name}
                      className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleFavorite(pet.id);
                      }}
                      className="absolute top-4 right-4 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm p-2 rounded-full hover:bg-white dark:hover:bg-gray-700 transition-colors"
                    >
                      <Heart className={`h-5 w-5 transition-colors ${
                        favoriteIds.includes(pet.id) 
                          ? 'text-red-500 fill-current' 
                          : 'text-gray-600 dark:text-gray-400 hover:text-red-500'
                      }`} />
                    </button>
                    <div className="absolute bottom-4 left-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-1">
                      <Gift className="h-4 w-4" />
                      <span>Doação</span>
                    </div>
                    {pet.health_checked && (
                      <div className="absolute top-4 left-4 bg-green-500 text-white p-1.5 rounded-full">
                        <Shield className="h-3 w-3" />
                      </div>
                    )}
                  </div>

                  <div className="p-6">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">{pet.name}</h3>
                        <p className="text-gray-600 dark:text-gray-300 text-sm">{pet.breed} • {pet.age}</p>
                      </div>
                      {pet.portage && (
                        <div className="bg-primary-100 dark:bg-primary-100-dark text-primary-800 dark:text-primary-200 text-xs font-medium px-3 py-1 rounded-full capitalize">
                          {pet.portage}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center space-x-2 text-gray-500 dark:text-gray-400 mb-4">
                      <MapPin className="h-4 w-4" />
                      <span className="text-sm">{pet.location}</span>
                    </div>

                    {pet.description && (
                      <p className="text-gray-700 dark:text-gray-300 text-sm mb-4 line-clamp-2">{pet.description}</p>
                    )}

                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Doador</p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {pet.profiles?.full_name || 'Anônimo'}
                        </p>
                      </div>
                      <button
                        onClick={(e) => handleShowContact(e, pet)}
                        className="ml-2 px-5 py-2 bg-primary-500 dark:bg-primary-500-dark text-white rounded hover:bg-primary-600 dark:hover:bg-primary-600-dark text-sm font-medium transition-colors"
                      >
                        Contato
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Load More */}
          {filteredPets.length > 0 && (
            <div className="text-center mt-12">
              <button className="bg-primary-500 dark:bg-primary-500-dark text-white px-8 py-3 rounded-lg hover:bg-primary-600 dark:hover:bg-primary-600-dark transition-colors font-medium">
                Carregar mais pets
              </button>
            </div>
          )}
        </div>
      </div>

      {selectedPet && (
        <PetDetailsModal
          pet={selectedPet}
          onClose={() => setSelectedPet(null)}
        />
      )}

      {showContactModal && contactSellerId && (
        <ContactCard
          sellerId={contactSellerId}
          petName={contactPetName || undefined}
          onClose={() => setShowContactModal(false)}
        />
      )}
    </>
  );
};
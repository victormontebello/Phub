import React, { useState, useMemo } from 'react';
import { Search, MapPin, Star, Sparkles, Heart, Shield, Users } from 'lucide-react';
import {
  useServices,
  useProviderProfiles,
  userFavoritesHook,
  addToFavoritesHook,
  removeFromFavoritesHook
} from '../hooks/useServicesQueries';
import { ContactCard } from '../components/ContactCard';
import { serviceCategories } from '../data/categories';

export const ServicesPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedService, setSelectedService] = useState('all');
  const [showContactModal, setShowContactModal] = useState(false);
  const [selectedProviderId, setSelectedProviderId] = useState<string | null>(null);

  const serviceTypes = [
    { value: 'all', label: 'Todos os Serviços' },
    ...serviceCategories
  ];

  const getServiceIcon = (category: string) => {
    switch (category) {
      case 'grooming':
        return Sparkles;
      case 'sitting':
      case 'boarding':
        return Heart;
      case 'walking':
        return Users;
      case 'training':
      case 'veterinary':
        return Shield;
      default:
        return Heart;
    }
  };

  const filters = {
    category: selectedService !== 'all' ? selectedService : undefined,
    search: searchQuery.trim() || undefined
  };

  const { data: services = [], isLoading, error } = useServices(filters);
  const { data: favorites = [] } = userFavoritesHook();
  const addToFavoritesMutation = addToFavoritesHook({
    onError: (error: any) => alert(error.message)
  });
  const removeFromFavoritesMutation = removeFromFavoritesHook({
    onError: (error: any) => alert(error.message)
  });

  const providerIds = useMemo(() => {
    return services.map(service => service.provider_id).filter(Boolean);
  }, [services]);

  const { data: providerProfiles = {} } = useProviderProfiles(providerIds);

  const handleToggleFavorite = async (serviceId: string) => {
    const isFavorite = favorites.includes(serviceId);
    isFavorite 
      ? await removeFromFavoritesMutation.mutateAsync({ itemId: serviceId, itemType: 'service' })
      : await addToFavoritesMutation.mutateAsync({ itemId: serviceId, itemType: 'service' });
  };

  const handleShowContact = (providerId: string) => {
    setSelectedProviderId(providerId);
    setShowContactModal(true);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 transition-colors">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 animate-pulse transition-colors">
                <div className="flex items-start space-x-4">
                  <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
                    <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
                    <div className="flex space-x-2">
                      <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded flex-1"></div>
                      <div className="h-8 w-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    </div>
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 transition-colors">
      <div className="px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Serviços de Pets Profissionais
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Conecte-se com profissionais confiáveis em sua área
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 mb-8 transition-colors">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Search */}
            <div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-gray-500" />
                <input
                  type="text"
                  placeholder="Procurar por serviços ou fornecedores..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-500-dark focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                />
              </div>
            </div>

            {/* Service Type Filter */}
            <div>
              <select
                value={selectedService}
                onChange={(e) => setSelectedService(e.target.value)}
                className="w-full py-3 px-4 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-500-dark focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                {serviceTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg mb-6 transition-colors">
            {error.message}
          </div>
        )}

        {/* Results */}
        <div className="mb-6">
          <p className="text-gray-600 dark:text-gray-300">
            Mostrando {services.length} serviços
          </p>
        </div>

        {/* Services Grid */}
        {services.length === 0 ? (
          <div className="text-center py-12">
            <Sparkles className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Nenhum serviço encontrado</h3>
            <p className="text-gray-500 dark:text-gray-400">Tente ajustar seus critérios de busca</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {services.map((service) => {
              const ServiceIcon = getServiceIcon(service.category);
              return (
                <div key={service.id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden transition-colors">
                  <div className="p-6">
                    <div className="flex items-start space-x-4">
                      {/* Provider Image/Icon */}
                      <div className="relative">
                        {service.image_url ? (
                          <img
                            src={service.image_url}
                            alt={service.title}
                            className="w-16 h-16 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-16 h-16 rounded-full bg-primary-100 dark:bg-primary-100-dark flex items-center justify-center">
                            <ServiceIcon className="h-8 w-8 text-primary-600 dark:text-primary-500-dark" />
                          </div>
                        )}
                        <div className="absolute -bottom-1 -right-1 bg-primary-500 dark:bg-primary-500-dark p-1.5 rounded-full">
                          <ServiceIcon className="h-3 w-3 text-white" />
                        </div>
                      </div>

                      {/* Service Info */}
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{service.title}</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-300">
                              por {providerProfiles[service.provider_id]?.full_name || 'Fornecedor'}
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold text-primary-600 dark:text-primary-500-dark">
                              ${service.price_from}
                              {service.price_to && service.price_to !== service.price_from && ` - $${service.price_to}`}
                            </div>
                            {providerProfiles[service.provider_id] && providerProfiles[service.provider_id].rating > 0 && (
                              <div className="flex items-center space-x-1">
                                <Star className="h-4 w-4 text-yellow-400 fill-current" />
                                <span className="text-sm text-gray-600 dark:text-gray-300">{providerProfiles[service.provider_id].rating.toFixed(1)}</span>
                                <span className="text-sm text-gray-400 dark:text-gray-500">({providerProfiles[service.provider_id].total_reviews})</span>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center space-x-2 text-gray-500 dark:text-gray-400 mb-3">
                          <MapPin className="h-4 w-4" />
                          <span className="text-sm">{service.location}</span>
                        </div>

                        <p className="text-gray-700 dark:text-gray-300 text-sm mb-4 line-clamp-2">{service.description}</p>

                        {/* Category Badge */}
                        <div className="mb-4">
                          <span className="bg-primary-50 dark:bg-primary-50-dark text-primary-700 dark:text-primary-300 px-3 py-1 rounded-full text-xs font-medium capitalize">
                            {serviceCategories.find(cat => cat.value === service.category)?.label || service.category}
                          </span>
                        </div>

                        {/* Actions */}
                        <div className="flex space-x-3">
                          <button 
                            className="flex-1 bg-primary-500 dark:bg-primary-500-dark text-white py-2 px-4 rounded-lg hover:bg-primary-600 dark:hover:bg-primary-600-dark transition-colors font-medium" 
                            onClick={() => handleShowContact(service.provider_id)}
                          >
                            Contato Fornecedor
                          </button>
                          <button 
                            onClick={() => handleToggleFavorite(service.id)}
                            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                          >
                            <Heart className={`h-5 w-5 transition-colors ${
                              favorites.includes(service.id) 
                                ? 'text-red-500 fill-current' 
                                : 'text-gray-600 dark:text-gray-400'
                            }`} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Load More */}
        {services.length > 0 && (
          <div className="text-center mt-12">
            <button className="bg-primary-500 dark:bg-primary-500-dark text-white px-8 py-3 rounded-lg hover:bg-primary-600 dark:hover:bg-primary-600-dark transition-colors font-medium">
              Carregar mais serviços
            </button>
          </div>
        )}

        {showContactModal && selectedProviderId && (
          <ContactCard sellerId={selectedProviderId} onClose={() => setShowContactModal(false)} />
        )}
      </div>
    </div>
  );
};
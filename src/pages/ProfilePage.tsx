import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  User, 
  Heart, 
  Settings, 
  Plus, 
  Edit3, 
  Trash2, 
  MapPin, 
  Star,
  PawPrint,
  Sparkles,
  Camera,
  X
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { ContactCard } from '../components/ContactCard';
import {
  useUserProfile,
  useUserPets,
  useUserServices,
  userFavoritesHook,
  useUpdateProfile,
  useDeletePet,
  useDeleteService,
  useAddPet,
  useAddService,
  useUpdateProfileImage,
  useRemoveProfileImage,
  useVaccines,
} from '../hooks/useProfileQueries';
import { MESSAGES } from '../messages';
import { PetDetailsModal } from '../components/PetDetailsModal';
import { PetPortage } from '../models';
import { VaccineSelectionModal } from '../components/VaccineSelectionModal';
import Select, { StylesConfig, components, MenuListProps } from 'react-select';
import { useBrazilianMunicipalities } from '../hooks/useLocations';
import { FixedSizeList as List } from 'react-window';
import { petCategories, serviceCategories } from '../data/categories';

const string_vazio = '';

interface LocationOption {
  value: string;
  label: string;
}

export const ProfilePage: React.FC = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'overview' | 'pets' | 'services' | 'favorites' | 'settings'>('overview');
  const [isEditing, setIsEditing] = useState(false);
  const [showAddPetForm, setShowAddPetForm] = useState(false);
  const [newPet, setNewPet] = useState({
    name: string_vazio,
    breed: string_vazio,
    age: string_vazio,
    description: string_vazio,
    category: string_vazio,
    location: string_vazio,
    portage: undefined as PetPortage | undefined,
    status: 'available',
    is_donation: true
  });
  const [petImageFiles, setPetImageFiles] = useState<File[]>([]);
  const [selectedVaccines, setSelectedVaccines] = useState<string[]>([]);
  const [contactInfo] = useState<any | null>(null);
  const [showContactModal, setShowContactModal] = useState(false);
  const [showAddServiceForm, setShowAddServiceForm] = useState(false);
  const [newService, setNewService] = useState({
    title: string_vazio,
    description: string_vazio,
    price_from: string_vazio,
    price_to: string_vazio,
    category: string_vazio,
    location: string_vazio,
    status: 'active',
    availability: string_vazio,
  });
  const [serviceImageFile, setServiceImageFile] = useState<File | null>(null);
  const [showProfileImageModal, setShowProfileImageModal] = useState(false);
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null);
  const [selectedPet, setSelectedPet] = useState<any | null>(null);
  
  // Estado local para edição do perfil
  const [editingProfileData, setEditingProfileData] = useState({
    full_name: string_vazio,
    phone: string_vazio,
    location: string_vazio,
    bio: string_vazio,
    avatar_url: string_vazio,
    user_type: 'consumer'
  });

  const [isVaccineModalOpen, setIsVaccineModalOpen] = useState(false);
  const { data: vaccines = [] } = useVaccines();
  const { data: municipalities, isLoading: isLoadingMunicipalities } = useBrazilianMunicipalities();

  // React Query hooks
  const { data: profileData = {
    full_name: string_vazio,
    phone: string_vazio,
    location: string_vazio,
    bio: string_vazio,
    avatar_url: string_vazio,
    user_type: 'consumer'
  } } = useUserProfile(user?.id);

  const { data: userPets = [], isLoading: isLoadingUserPets } = useUserPets(user?.id);
  const { data: userServices = [] } = useUserServices(user?.id);
  const { data: favoritesData = { pets: [], services: [] }, error: favoritesError } = userFavoritesHook(user?.id);
  if (favoritesError) alert(MESSAGES.ERROR_GENERIC);

  // Mutations
  const updateProfileMutation = useUpdateProfile();
  const deletePetMutation = useDeletePet();
  const deleteServiceMutation = useDeleteService();
  const addPetMutation = useAddPet();
  const addServiceMutation = useAddService();
  const updateProfileImageMutation = useUpdateProfileImage();
  const removeProfileImageMutation = useRemoveProfileImage();
  const favoritePets = favoritesData.pets;
  const favoriteServices = favoritesData.services;

  useEffect(() => {
    if (profileData) {
      setEditingProfileData(profileData);
    }
  }, [profileData]);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) {
      supabase.from('profiles').upsert({
        id: user.id,
        full_name: user.user_metadata?.full_name || user.email || string_vazio
      });
    }
  }, [user]);

  const updateProfile = async () => {
    if (!user) return;
    
    try {
      await updateProfileMutation.mutateAsync({
        userId: user.id,
        profileData: {
          ...editingProfileData,
          updated_at: new Date().toISOString()
        }
      });
      setIsEditing(false);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const deletePet = async (petId: string) => {
    if (!confirm(MESSAGES.CONFIRM_DELETE_PET)) return;
    try {
      await deletePetMutation.mutateAsync(petId);
    } catch (error) {
      alert(MESSAGES.ERROR_DELETE_PET);
      console.error('Error:', error);
    }
  };

  const deleteService = async (serviceId: string) => {
    if (!confirm(MESSAGES.CONFIRM_DELETE_SERVICE)) return;
    try {
      await deleteServiceMutation.mutateAsync(serviceId);
    } catch (error) {
      alert(MESSAGES.ERROR_DELETE_SERVICE);
      console.error('Error:', error);
    }
  };

  const handlePetImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setPetImageFiles(prevFiles => [...prevFiles, ...filesArray]);
    }
  };

  const removePetImage = (indexToRemove: number) => {
    setPetImageFiles(prevFiles => prevFiles.filter((_, index) => index !== indexToRemove));
  };
  
  const handleAddPet = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || petImageFiles.length === 0) {
      alert(MESSAGES.ERROR_MISSING_PET_IMAGE);
      return;
    }

    await addPetMutation.mutateAsync({
      petData: {
        ...newPet,
        seller_id: user.id,
        portage: newPet.portage || null,
      },
      imageFiles: petImageFiles,
      selectedVaccines,
    });

    clearPetForm();
  };

  const handleAddService = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;

    await addServiceMutation.mutateAsync({
      serviceData: {
        ...newService,
        provider_id: user.id,
        price_from: Number(newService.price_from),
        price_to: Number(newService.price_to),
      },
      imageFile: serviceImageFile,
    });

    clearServiceForm();
  };

  function clearServiceForm() {
    setShowAddServiceForm(false);
    setNewService({
      title: string_vazio,
      description: string_vazio,
      price_from: string_vazio,
      price_to: string_vazio,
      category: string_vazio,
      location: string_vazio,
      status: 'active',
      availability: string_vazio,
    });
    setServiceImageFile(null);
  }

  function clearPetForm() {
    setShowAddPetForm(false);
    setNewPet({
      name: string_vazio,
      breed: string_vazio,
      age: string_vazio,
      description: string_vazio,
      category: string_vazio,
      location: string_vazio,
      portage: undefined,
      status: 'available',
      is_donation: true,
    });
    setPetImageFiles([]);
    setSelectedVaccines([]);
  }

  const handleProfileImageClick = () => {
    setShowProfileImageModal(true);
  };

  const handleProfileImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!['image/jpeg', 'image/png', 'image/jpg'].includes(file.type)) {
        alert('Apenas imagens JPEG ou PNG são permitidas.');
        return;
      }
      if (file.size > 2 * 1024 * 1024) { // 2MB
        alert('O arquivo deve ter no máximo 2MB.');
        return;
      }
      setProfileImageFile(file);
    }
  };

  const handleProfileImageUpload = async () => {
    if (!profileImageFile || !user) return;
    
    try {
      await updateProfileImageMutation.mutateAsync({
        userId: user.id,
        imageFile: profileImageFile
      });
      
      setShowProfileImageModal(false);
      setProfileImageFile(null);
    } catch (err) {
      alert('Erro ao atualizar foto de perfil!');
    }
  };

  const handleProfileImageRemove = async () => {
    if (!user) return;
    
    try {
      await removeProfileImageMutation.mutateAsync(user.id);
      setShowProfileImageModal(false);
      setProfileImageFile(null);
    } catch (err) {
      alert('Erro ao remover foto de perfil!');
    }
  };

  // Função para lidar com a confirmação do modal
  const handleVaccineConfirm = (newSelection: string[]) => {
    setSelectedVaccines(newSelection);
  };
  
  // Cria um mapa para busca rápida do nome da vacina pelo ID
  const vaccineNameMap = new Map(vaccines.map(v => [v.id, v.name]));

  // Estilos para o componente Select
  const selectStyles: StylesConfig<LocationOption, false> = {
    control: (base, state) => ({
      ...base,
      borderColor: state.isFocused ? '#a5b4fc' : '#d1d5db',
      borderRadius: '0.375rem',
      minHeight: '42px',
      boxShadow: 'none',
      backgroundColor: '#ffffff',
      '&:hover': {
        borderColor: '#a5b4fc',
      },
      '.dark &': {
        backgroundColor: '#1f2937',
        borderColor: state.isFocused ? '#6366f1' : '#4b5563',
        color: '#ffffff',
        '&:hover': {
          borderColor: '#6366f1',
        }
      }
    }),
    input: (base) => ({
      ...base,
      'input:focus': {
        boxShadow: 'none',
      },
      '.dark &': {
        color: '#ffffff',
      }
    }),
    menu: (base) => ({
      ...base,
      backgroundColor: '#ffffff',
      '.dark &': {
        backgroundColor: '#1f2937',
      }
    }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isSelected ? '#e0e7ff' : state.isFocused ? '#f3f4f6' : 'transparent',
      color: state.isSelected ? '#3730a3' : '#374151',
      '.dark &': {
        backgroundColor: state.isSelected ? '#3730a3' : state.isFocused ? '#374151' : 'transparent',
        color: state.isSelected ? '#ffffff' : '#d1d5db',
      }
    }),
    singleValue: (base) => ({
      ...base,
      color: '#374151',
      '.dark &': {
        color: '#d1d5db',
      }
    }),
    placeholder: (base) => ({
      ...base,
      color: '#9ca3af',
      '.dark &': {
        color: '#6b7280',
      }
    }),
  };

  // virtualization of the menu list
  const MenuList = (props: MenuListProps<LocationOption, false>) => {
    const itemHeight = 35;
    const { options, children, maxHeight, getValue } = props;
    
    if (!children || !Array.isArray(children) || !children.length) {
      return <components.MenuList {...props}>{children}</components.MenuList>;
    }

    const [value] = getValue();
    const initialOffset = value ? options.indexOf(value) * itemHeight : 0;

    return (
      <List
        width="100%"
        height={Math.min(maxHeight, children.length * itemHeight)}
        itemCount={children.length}
        itemSize={itemHeight}
        initialScrollOffset={initialOffset}
      >
        {({ index, style }) => <div style={style}>{children[index]}</div>}
      </List>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 transition-colors">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Meu Perfil</h1>
              <button
                onClick={() => navigate('/create-listing')}
                className="px-4 py-2 bg-primary-500 dark:bg-primary-500-dark text-white rounded-lg hover:bg-primary-600 dark:hover:bg-primary-600-dark flex items-center gap-2 transition-colors"
              >
                <Plus className="h-5 w-5" />
                Criar Novo Anúncio
              </button>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-lg overflow-hidden mb-12 transition-colors">
            <div className="bg-gradient-to-r from-primary-500 dark:from-primary-500-dark to-primary-600 dark:to-primary-600-dark px-10 py-14">
              <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
                <div className="w-32 h-32 bg-white dark:bg-gray-700 rounded-full flex items-center justify-center shadow-lg">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 dark:border-primary-400"></div>
                </div>
                <div className="text-white flex-1">
                  <h1 className="text-4xl font-extrabold mb-3">
                    Carregando...
                  </h1>
                  <p className="text-primary-100 dark:text-primary-200 mb-2 text-lg">
                    Aguarde um momento, estamos carregando suas informações.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const tabs = [
    { id: 'overview', name: 'Visão Geral', icon: User },
    { id: 'pets', name: 'Meus Pets', icon: PawPrint },
    { id: 'services', name: 'Meus Serviços', icon: Sparkles },
    { id: 'favorites', name: 'Favoritos', icon: Heart },
    { id: 'settings', name: 'Configurações', icon: Settings }
  ];

  return (
    <>
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 transition-colors">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Meu Perfil</h1>
              <button
                onClick={() => navigate('/create-listing')}
                className="px-4 py-2 bg-primary-500 dark:bg-primary-500-dark text-white rounded-lg hover:bg-primary-600 dark:hover:bg-primary-600-dark flex items-center gap-2 transition-colors"
              >
                <Plus className="h-5 w-5" />
                Criar Novo Anúncio
              </button>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-lg overflow-hidden mb-12 transition-colors">
            <div className="bg-gradient-to-r from-primary-500 dark:from-primary-500-dark to-primary-600 dark:to-primary-600-dark px-10 py-14">
              <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
                <div className="w-32 h-32 bg-white dark:bg-gray-700 rounded-full flex items-center justify-center shadow-lg cursor-pointer" onClick={handleProfileImageClick} title="Alterar foto de perfil">
                  {profileData.avatar_url ? (
                    <img 
                      src={profileData.avatar_url} 
                      alt={profileData.full_name} 
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center">
                      <User className="w-12 h-12 text-gray-400 dark:text-gray-500" />
                    </div>
                  )}
                </div>
                <div className="text-white flex-1">
                  <h1 className="text-4xl font-extrabold mb-3">
                    {profileData.full_name || user.email}
                  </h1>
                  <p className="text-primary-100 dark:text-primary-200 mb-2 text-lg">
                    Membro desde {new Date(user.created_at).toLocaleDateString('pt-BR')}
                  </p>
                  {profileData.location && (
                    <div className="flex items-center space-x-2 mt-2">
                      <MapPin className="h-5 w-5" />
                      <span className="text-primary-100 dark:text-primary-200 text-base">{profileData.location}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="px-10 py-8 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 transition-colors">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="bg-primary-50 dark:bg-primary-50-dark rounded-2xl shadow flex flex-col items-center py-6 transition-colors">
                  <div className="text-3xl font-extrabold text-primary-600 dark:text-primary-500-dark mb-1">{userPets.length}</div>
                  <div className="text-gray-700 dark:text-gray-300 text-lg">Pets Listados</div>
                </div>
                <div className="bg-secondary-50 dark:bg-secondary-50-dark rounded-2xl shadow flex flex-col items-center py-6 transition-colors">
                  <div className="text-3xl font-extrabold text-secondary-600 dark:text-secondary-500-dark mb-1">{userServices.length}</div>
                  <div className="text-gray-700 dark:text-gray-300 text-lg">Serviços Oferecidos</div>
                </div>
                <div className="bg-white dark:bg-gray-700 rounded-2xl shadow flex flex-col items-center py-6 border border-yellow-100 dark:border-yellow-900/20 transition-colors">
                  <div className="flex items-center justify-center space-x-2 mb-1">
                    <Star className="h-6 w-6 text-yellow-400 fill-current" />
                    <span className="text-3xl font-extrabold text-gray-900 dark:text-white">4.8</span>
                  </div>
                  <div className="text-gray-700 dark:text-gray-300 text-lg">Avaliação Média</div>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow mb-12 transition-colors">
            <div className="border-b border-gray-200 dark:border-gray-700">
              <nav className="flex space-x-10 px-10">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`py-5 px-2 border-b-4 font-semibold text-base flex items-center space-x-2 transition-colors ${
                      activeTab === tab.id
                        ? 'border-primary-500 dark:border-primary-500-dark text-primary-600 dark:text-primary-500-dark'
                        : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                    }`}
                  >
                    <tab.icon className="h-6 w-6" />
                    <span>{tab.name}</span>
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Tab Content */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-10 transition-colors">
            {activeTab === 'overview' && (
              <div className="space-y-8">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Visão Geral do Perfil</h2>
                  
                  {profileData.bio ? (
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 mb-6 transition-colors">
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Sobre Mim</h3>
                      <p className="text-gray-700 dark:text-gray-300">{profileData.bio}</p>
                    </div>
                  ) : (
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 mb-6 text-center transition-colors">
                      <p className="text-gray-500 dark:text-gray-400 mb-4">Complete seu perfil para construir confiança com potenciais compradores e clientes.</p>
                      <button
                        onClick={() => setActiveTab('settings')}
                        className="bg-primary-500 dark:bg-primary-500-dark text-white px-4 py-2 rounded-lg hover:bg-primary-600 dark:hover:bg-primary-600-dark transition-colors"
                      >
                        Completar Perfil
                      </button>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-primary-50 dark:bg-primary-50-dark rounded-lg p-6 transition-colors">
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Pets Listados Recentemente</h3>
                      {userPets.slice(0, 3).map((pet) => (
                        <div key={pet.id} className="flex items-center space-x-3 mb-3 last:mb-0">
                          <img 
                            src={pet.image_url} 
                            alt={pet.name}
                            className="w-12 h-12 rounded-lg object-cover"
                          />
                          <div className="flex-1">
                            <div className="flex justify-between items-start mb-2">
                              <h3 className="font-semibold text-gray-900 dark:text-white">{pet.name}</h3>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                pet.status === 'available' ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' :
                                pet.status === 'adopted' ? 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300' :
                                'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300'
                              }`}>
                                {pet.status === 'available' ? 'Disponível' : pet.status === 'adopted' ? 'Adotado' : 'Pendente'}
                              </span>
                              <span className="text-xs text-green-600 dark:text-green-400 font-semibold">Doação</span>
                            </div>
                          </div>
                          {pet.vaccines && pet.vaccines.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-2">
                              {pet.vaccines.map((vac: string) => (
                                <span key={vac} className="bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 px-2 py-1 rounded text-xs font-medium">{vac}</span>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    <div className="bg-white dark:bg-gray-700 rounded-lg p-6 transition-colors">
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Serviços Recentes</h3>
                      {userServices.slice(0, 3).map((service) => (
                        <div key={service.id} className="flex items-center space-x-3 mb-3 last:mb-0">
                          <img 
                            src={service.image_url || 'https://images.pexels.com/photos/2607544/pexels-photo-2607544.jpeg?auto=compress&cs=tinysrgb&w=400'} 
                            alt={service.title}
                            className="w-12 h-12 rounded-lg object-cover"
                          />
                          <div className="flex-1">
                            <div className="flex justify-between items-start mb-2">
                              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{service.title}</h3>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                service.status === 'active' ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' : 'bg-gray-100 dark:bg-gray-600 text-gray-800 dark:text-gray-300'
                              }`}>
                                {service.status === 'active' ? 'Ativo' : 'Inativo'}
                              </span>
                            </div>
                            <p className="text-gray-600 dark:text-gray-400 mb-2">{service.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'pets' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Meus Pets Listados</h2>
                  {!showAddPetForm && (
                    <button onClick={() => setShowAddPetForm(true)} className="bg-primary-500 dark:bg-primary-500-dark text-white px-4 py-2 rounded-lg hover:bg-primary-600 dark:hover:bg-primary-600-dark transition-colors flex items-center space-x-2">
                      <Plus className="h-5 w-5" />
                      <span>Adicionar Novo Pet</span>
                    </button>
                  )}
                </div>

                {showAddPetForm ? (
                  <div className="mt-8 bg-gray-50 dark:bg-gray-700 p-6 rounded-lg shadow-inner transition-colors">
                    <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-6">Adicionar Novo Pet</h3>
                    <form onSubmit={handleAddPet} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nome</label>
                        <input type="text" value={newPet.name} onChange={(e) => setNewPet({ ...newPet, name: e.target.value })} className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 dark:focus:ring-primary-500-dark focus:border-primary-500 dark:focus:border-primary-500-dark bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-colors" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Raça</label>
                        <input type="text" value={newPet.breed} onChange={(e) => setNewPet({ ...newPet, breed: e.target.value })} className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 dark:focus:ring-primary-500-dark focus:border-primary-500 dark:focus:border-primary-500-dark bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-colors" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Idade</label>
                        <input type="text" value={newPet.age} onChange={(e) => setNewPet({ ...newPet, age: e.target.value })} className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 dark:focus:ring-primary-500-dark focus:border-primary-500 dark:focus:border-primary-500-dark bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-colors" />
                      </div>
                      <div className="col-span-1">
                        <label htmlFor="petCategory" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Categoria</label>
                        <select id="petCategory" name="category" value={newPet.category} onChange={(e) => setNewPet({ ...newPet, category: e.target.value })} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-indigo-500 dark:focus:ring-indigo-500-dark focus:border-indigo-500 dark:focus:border-indigo-500-dark sm:text-sm rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-colors">
                          <option value="">Selecione</option>
                          {petCategories.map(cat => <option key={cat.value} value={cat.value}>{cat.label}</option>)}
                        </select>
                      </div>
                      <div className="col-span-1">
                        <label htmlFor="petPortage" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Porte (Opcional)</label>
                        <select id="petPortage" name="portage" value={newPet.portage} onChange={(e) => setNewPet({ ...newPet, portage: e.target.value as PetPortage })} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-indigo-500 dark:focus:ring-indigo-500-dark focus:border-indigo-500 dark:focus:border-indigo-500-dark sm:text-sm rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-colors">
                          <option value="">Não especificado</option>
                          <option value="pequeno">Pequeno</option>
                          <option value="medio">Médio</option>
                          <option value="grande">Grande</option>
                        </select>
                      </div>
                      <div className="col-span-1">
                        <label htmlFor="petLocation" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Localização</label>
                        <Select
                          id="petLocation"
                          name="location"
                          options={municipalities || []}
                          isLoading={isLoadingMunicipalities}
                          isClearable
                          isSearchable
                          placeholder="Selecione ou digite a cidade..."
                          value={municipalities?.find((m) => m.value === newPet.location) || null}
                          onChange={(option) => setNewPet({ ...newPet, location: option ? option.value : string_vazio })}
                          noOptionsMessage={() => 'Nenhuma cidade encontrada'}
                          loadingMessage={() => 'Carregando cidades...'}
                          styles={selectStyles}
                          components={{ MenuList }}
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Descrição</label>
                        <textarea value={newPet.description} onChange={(e) => setNewPet({ ...newPet, description: e.target.value })} className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 dark:focus:ring-primary-500-dark focus:border-primary-500 dark:focus:border-primary-500-dark bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-colors" rows={4} placeholder="Descrição do pet" />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Vacinas</label>
                        <div 
                          onClick={() => setIsVaccineModalOpen(true)}
                          className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 dark:focus:ring-primary-500-dark focus:border-primary-500 dark:focus:border-primary-500-dark min-h-[42px] cursor-pointer bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-colors"
                        >
                          {selectedVaccines.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                              {selectedVaccines.map(id => (
                                <span key={id} className="bg-primary-100 dark:bg-primary-900/30 text-primary-800 dark:text-primary-300 text-sm font-medium px-2.5 py-0.5 rounded-full">
                                  {vaccineNameMap.get(id) || 'Carregando...'}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span className="text-gray-500 dark:text-gray-400">Selecione as vacinas...</span>
                          )}
                        </div>
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Imagens do Pet</label>
                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
                          {petImageFiles.map((file, index) => (
                            <div key={index} className="relative aspect-square">
                              <img
                                src={URL.createObjectURL(file)}
                                alt={`Preview ${index}`}
                                className="w-full h-full object-cover rounded-lg"
                                onLoad={e => URL.revokeObjectURL(e.currentTarget.src)}
                              />
                              <button
                                type="button"
                                onClick={() => removePetImage(index)}
                                className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full shadow-md hover:bg-red-600 transition-colors"
                                aria-label="Remover imagem"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </div>
                          ))}
                          <label htmlFor="pet-image-upload" className="cursor-pointer flex items-center justify-center aspect-square border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-primary-500 dark:hover:border-primary-500-dark hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors">
                            <div className="text-center">
                              <Camera className="mx-auto h-8 w-8 text-gray-400 dark:text-gray-500" />
                              <span className="mt-2 text-xs text-gray-500 dark:text-gray-400">Adicionar</span>
                            </div>
                            <input
                              id="pet-image-upload"
                              name="pet-image-upload"
                              type="file"
                              accept="image/*"
                              multiple
                              className="sr-only"
                              onChange={handlePetImageChange}
                            />
                          </label>
                        </div>
                        {petImageFiles.length === 0 && <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Adicione pelo menos uma imagem. A primeira será a capa.</p>}
                      </div>
                      <div className="md:col-span-2 flex justify-end space-x-3">
                        <button type="button" onClick={() => setShowAddPetForm(false)} className="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors">Cancelar</button>
                        <button type="submit" className="px-4 py-2 bg-primary-600 dark:bg-primary-600-dark text-white rounded-md hover:bg-primary-700 dark:hover:bg-primary-700-dark transition-colors" disabled={addPetMutation.isPending}>
                          {addPetMutation.isPending ? 'Adicionando...' : 'Adicionar Pet'}
                        </button>
                      </div>
                    </form>
                  </div>
                ) : (
                  userPets.length === 0 ? (
                    <div className="text-center py-12">
                      <PawPrint className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Nenhum pet listado ainda</h3>
                      <p className="text-gray-500 dark:text-gray-400 mb-6">Comece adicionando seu primeiro pet listado</p>
                      <button className="bg-primary-500 dark:bg-primary-500-dark text-white px-6 py-3 rounded-lg hover:bg-primary-600 dark:hover:bg-primary-600-dark transition-colors">
                        Listar Seu Primeiro Pet
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {isLoadingUserPets ? (
                        <p className="text-gray-700 dark:text-gray-300">Carregando seus pets...</p>
                      ) : (
                        userPets.map((pet) => (
                          <div key={pet.id} className="bg-white dark:bg-gray-700 rounded-lg shadow overflow-hidden cursor-pointer transition-colors" onClick={() => setSelectedPet(pet)}>
                            <img src={pet.image_url} alt={pet.name} className="w-full h-48 object-cover" />
                            <div className="p-4">
                              <h3 className="font-bold text-lg text-gray-900 dark:text-white">{pet.name}</h3>
                              <p className="text-sm text-gray-500 dark:text-gray-400">{pet.breed}</p>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  )
                )}
              </div>
            )}

            {activeTab === 'services' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Meus Serviços</h2>
                  {!showAddServiceForm && (
                    <button onClick={() => setShowAddServiceForm(true)} className="bg-primary-500 dark:bg-primary-500-dark text-white px-4 py-2 rounded-lg hover:bg-primary-600 dark:hover:bg-primary-600-dark transition-colors flex items-center space-x-2">
                      <Plus className="h-5 w-5" />
                      <span>Adicionar Novo Serviço</span>
                    </button>
                  )}
                </div>
                {showAddServiceForm ? (
                  <form onSubmit={handleAddService} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Título do Serviço</label>
                      <input required className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg mb-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-colors" value={newService.title} onChange={e => setNewService({ ...newService, title: e.target.value })} />
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Preço Inicial</label>
                      <input required type="number" min="0" className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg mb-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-colors" value={newService.price_from} onChange={e => setNewService({ ...newService, price_from: e.target.value })} />
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Preço Final</label>
                      <input required type="number" min="0" className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg mb-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-colors" value={newService.price_to} onChange={e => setNewService({ ...newService, price_to: e.target.value })} />
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Disponibilidade (JSON opcional)</label>
                      <input className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg mb-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-colors" value={newService.availability} onChange={e => setNewService({ ...newService, availability: e.target.value })} placeholder='Ex: {"dias": ["seg", "ter"]}' />
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Descrição</label>
                      <textarea required className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg mb-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-colors" value={newService.description} onChange={e => setNewService({ ...newService, description: e.target.value })} />
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Categoria</label>
                      <select required className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg mb-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-colors" value={newService.category} onChange={e => setNewService({ ...newService, category: e.target.value })}>
                        <option value="">Selecione uma categoria</option>
                        {serviceCategories.map(category => (
                          <option key={category.value} value={category.value}>{category.label}</option>
                        ))}
                      </select>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Localização</label>
                      <input required className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg mb-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-colors" value={newService.location} onChange={e => setNewService({ ...newService, location: e.target.value })} />
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Imagem (Opcional)</label>
                      <input type="file" accept="image/*" onChange={e => setServiceImageFile(e.target.files ? e.target.files[0] : null)} />
                      <div className="flex space-x-2 mt-2">
                        <button type="submit" className="bg-primary-500 dark:bg-primary-500-dark text-white px-4 py-2 rounded-lg hover:bg-primary-600 dark:hover:bg-primary-600-dark transition-colors">Salvar</button>
                        <button type="button" onClick={() => setShowAddServiceForm(false)} className="bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors">Cancelar</button>
                      </div>
                    </div>
                  </form>
                ) : (
                  userServices.length === 0 ? (
                    <div className="text-center py-12">
                      <Sparkles className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Nenhum serviço oferecido ainda</h3>
                      <p className="text-gray-500 dark:text-gray-400 mb-6">Comece adicionando seu primeiro serviço</p>
                      <button className="bg-primary-500 dark:bg-primary-500-dark text-white px-6 py-3 rounded-lg hover:bg-primary-600 dark:hover:bg-primary-600-dark transition-colors">
                        Oferecer Seu Primeiro Serviço
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {userServices.map((service) => (
                        <div key={service.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 hover:shadow-lg transition-shadow bg-white dark:bg-gray-700">
                          <div className="flex items-start space-x-4">
                            <img 
                              src={service.image_url || 'https://images.pexels.com/photos/2607544/pexels-photo-2607544.jpeg?auto=compress&cs=tinysrgb&w=400'} 
                              alt={service.title}
                              className="w-16 h-16 rounded-lg object-cover"
                            />
                            <div className="flex-1">
                              <div className="flex justify-between items-start mb-2">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{service.title}</h3>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${service.status === 'active' ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' : 'bg-gray-100 dark:bg-gray-600 text-gray-800 dark:text-gray-300'}`}>
                                  {service.status === 'active' ? 'Ativo' : 'Inativo'}
                                </span>
                              </div>
                              <p className="text-gray-600 dark:text-gray-400 mb-2">{service.description}</p>
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-4">
                                  <span className="text-lg font-bold text-primary-600 dark:text-primary-500-dark">
                                    R${service.price_from} - R${service.price_to}
                                  </span>
                                  <span className="text-sm text-gray-500 dark:text-gray-400">
                                    {serviceCategories.find(cat => cat.value === service.category)?.label || service.category}
                                  </span>
                                </div>
                                <div className="flex space-x-2">
                                  <button className="bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 py-2 px-3 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-500 transition-colors flex items-center space-x-1">
                                    <Edit3 className="h-4 w-4" />
                                    <span>Editar</span>
                                  </button>
                                  <button 
                                    onClick={() => deleteService(service.id)}
                                    className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 py-2 px-3 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )
                )}
              </div>
            )}

            {activeTab === 'favorites' && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Meus Favoritos</h2>
                {favoritePets.length === 0 && favoriteServices.length === 0 ? (
                  <div className="text-center py-12">
                    <Heart className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Nenhum favorito ainda</h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-6">Marque pets ou serviços como favoritos para vê-los aqui.</p>
                  </div>
                ) : (
                  <>
                    {favoritePets.length > 0 && (
                      <div className="mb-8">
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Pets Favoritos</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                          {favoritePets.map((pet: any) => (
                            <div key={pet.id} className="bg-white dark:bg-gray-700 rounded-lg shadow-sm overflow-hidden transition-colors">
                              <img src={pet.image_url} alt={pet.name} className="w-full h-40 object-cover" />
                              <div className="p-4">
                                <h4 className="font-semibold text-gray-900 dark:text-white mb-1">{pet.name}</h4>
                                <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">{pet.breed} • {pet.age}</p>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${pet.status === 'available' ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' : pet.status === 'adopted' ? 'bg-gray-100 dark:bg-gray-600 text-gray-800 dark:text-gray-300' : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300'}`}>{pet.status === 'available' ? 'Disponível' : pet.status === 'adopted' ? 'Adotado' : 'Pendente'}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {favoriteServices.length > 0 && (
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Serviços Favoritos</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                          {favoriteServices.map((service: any) => (
                            <div key={service.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 hover:shadow-lg transition-shadow bg-white dark:bg-gray-700">
                              <div className="flex items-start space-x-4">
                                <img 
                                  src={service.image_url || 'https://images.pexels.com/photos/2607544/pexels-photo-2607544.jpeg?auto=compress&cs=tinysrgb&w=400'} 
                                  alt={service.title}
                                  className="w-16 h-16 rounded-lg object-cover"
                                />
                                <div className="flex-1">
                                  <h4 className="font-semibold text-gray-900 dark:text-white mb-1">{service.title}</h4>
                                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">{service.description}</p>
                                  <div className="flex items-center justify-between">
                                    <span className="text-lg font-bold text-primary-600 dark:text-primary-500-dark">
                                      R${service.price_from} - R${service.price_to}
                                    </span>
                                    <span className="text-sm text-gray-500 dark:text-gray-400">
                                      {serviceCategories.find(cat => cat.value === service.category)?.label || service.category}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            {activeTab === 'settings' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Configurações do Perfil</h2>
                  {!isEditing ? (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="bg-primary-500 dark:bg-primary-500-dark text-white px-4 py-2 rounded-lg hover:bg-primary-600 dark:hover:bg-primary-600-dark transition-colors flex items-center space-x-2"
                    >
                      <Edit3 className="h-4 w-4" />
                      <span>Editar Perfil</span>
                    </button>
                  ) : (
                    <div className="flex space-x-3">
                      <button
                        onClick={() => setIsEditing(false)}
                        className="bg-gray-500 dark:bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-600 dark:hover:bg-gray-700 transition-colors"
                      >
                        Cancelar
                      </button>
                      <button
                        onClick={updateProfile}
                        className="bg-primary-500 dark:bg-primary-500-dark text-white px-4 py-2 rounded-lg hover:bg-primary-600 dark:hover:bg-primary-600-dark transition-colors"
                      >
                        Salvar Alterações
                      </button>
                    </div>
                  )}
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Nome Completo
                    </label>
                    <input
                      type="text"
                      value={editingProfileData.full_name}
                      onChange={(e) => setEditingProfileData({...editingProfileData, full_name: e.target.value})}
                      disabled={!isEditing}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-500-dark focus:border-transparent disabled:bg-gray-50 dark:disabled:bg-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Tipo de Usuário
                    </label>
                    <select
                      value={editingProfileData.user_type}
                      onChange={(e) => setEditingProfileData({ ...editingProfileData, user_type: e.target.value })}
                      disabled={!isEditing}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-500-dark focus:border-transparent disabled:bg-gray-50 dark:disabled:bg-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-colors"
                    >
                      <option value="consumer">Consumidor</option>
                      <option value="veterinarian">Veterinário</option>
                      <option value="seller">Vendedor</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Endereço de Email
                    </label>
                    <input
                      type="email"
                      value={user.email}
                      disabled
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Número de Telefone
                    </label>
                    <input
                      type="tel"
                      value={editingProfileData.phone}
                      onChange={(e) => setEditingProfileData({...editingProfileData, phone: e.target.value})}
                      disabled={!isEditing}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-500-dark focus:border-transparent disabled:bg-gray-50 dark:disabled:bg-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Localização
                    </label>
                    <input
                      type="text"
                      value={editingProfileData.location}
                      onChange={(e) => setEditingProfileData({...editingProfileData, location: e.target.value})}
                      disabled={!isEditing}
                      placeholder="Cidade, Estado"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-500-dark focus:border-transparent disabled:bg-gray-50 dark:disabled:bg-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Biografia (Opcional)
                    </label>
                    <textarea
                      value={editingProfileData.bio}
                      onChange={(e) => setEditingProfileData({...editingProfileData, bio: e.target.value})}
                      disabled={!isEditing}
                      rows={4}
                      placeholder="Diga aos potenciais compradores e clientes sobre você e sua experiência com pets..."
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-500-dark focus:border-transparent disabled:bg-gray-50 dark:disabled:bg-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-colors"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modal de Contato */}
        {showContactModal && contactInfo && (
          <ContactCard 
            sellerId={contactInfo.sellerId} 
            petName={contactInfo.petName} 
            onClose={() => setShowContactModal(false)} 
          />
        )}

        {/* Modal de edição de imagem de perfil */}
        {showProfileImageModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 w-full max-w-sm transition-colors">
              <h3 className="text-lg font-bold mb-4 text-gray-900 dark:text-white">Alterar foto de perfil</h3>
              <div className="flex flex-col items-center mb-4">
                {profileImageFile ? (
                  <img src={URL.createObjectURL(profileImageFile)} alt="Preview" className="w-24 h-24 rounded-full object-cover mb-2" />
                ) : editingProfileData.avatar_url ? (
                  <img src={editingProfileData.avatar_url} alt="Atual" className="w-24 h-24 rounded-full object-cover mb-2" />
                ) : (
                  <User className="w-24 h-24 text-gray-300 dark:text-gray-600 mb-2" />
                )}
                <input type="file" accept="image/*" onChange={handleProfileImageFileChange} className="mb-2" />
              </div>
              <div className="flex justify-between">
                <button onClick={handleProfileImageRemove} className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 px-4 py-2 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors">Remover</button>
                <button onClick={() => setShowProfileImageModal(false)} className="bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors">Cancelar</button>
                <button onClick={handleProfileImageUpload} className="bg-primary-500 dark:bg-primary-500-dark text-white px-4 py-2 rounded-lg hover:bg-primary-600 dark:hover:bg-primary-600-dark transition-colors">Salvar</button>
              </div>
            </div>
          </div>
        )}

        {selectedPet && (
          <PetDetailsModal
            pet={selectedPet}
            onClose={() => setSelectedPet(null)}
          />
        )}

        <VaccineSelectionModal
          isOpen={isVaccineModalOpen}
          onClose={() => setIsVaccineModalOpen(false)}
          onConfirm={handleVaccineConfirm}
          vaccines={vaccines}
          initialSelectedIds={selectedVaccines}
        />
      </div>
    </>
  );
};
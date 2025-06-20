import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { v4 as uuidv4 } from 'uuid';
import { useAuth } from '../contexts/AuthContext';

// Tipos
interface Pet {
  id?: string;
  name: string;
  breed: string;
  age: string;
  description: string;
  category: string;
  location: string;
  status: 'available' | 'adopted';
  is_donation: boolean;
  seller_id?: string;
  image_url?: string;
  images?: { id: string; image_url: string }[];
  vaccines?: string[];
}

// Hooks de busca de dados
export const useUserProfile = (userId: string | undefined) => {
  return useQuery({
    queryKey: ['profile', userId],
    queryFn: async () => {
      if (!userId) return null;
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      if (error) throw new Error(error.message);
      return data;
    },
    enabled: !!userId,
  });
};

const fetchPetsWithDetails = async (queryBuilder: any) => {
  const { data: pets, error } = await queryBuilder;
  if (error) throw error;

  if (!pets) return [];

  // Para cada pet, buscar suas imagens e vacinas
  const detailedPets = await Promise.all(
    pets.map(async (pet: Pet) => {
      // Buscar imagens
      const { data: images, error: imageError } = await supabase
        .from('pet_images')
        .select('id, image_url')
        .eq('pet_id', pet.id);
      
      if (imageError) console.error('Error fetching images for pet:', pet.id, imageError);

      // Buscar vacinas
      const { data: vaccines, error: vaccineError } = await supabase
        .from('pet_vaccines')
        .select('vaccines(name)')
        .eq('pet_id', pet.id!);

      if (vaccineError) console.error('Error fetching vaccines for pet:', pet.id, vaccineError);
      
      return {
        ...pet,
        images: images || [],
        vaccines: (vaccines as any)?.map((v: any) => v.vaccines.name) || [],
      };
    })
  );

  return detailedPets;
};

export const useUserPets = (userId: string | undefined) => {
  return useQuery({
    queryKey: ['userPets', userId],
    queryFn: () => {
      if (!userId) return [];
      const query = supabase.from('pets').select('*').eq('seller_id', userId);
      return fetchPetsWithDetails(query);
    },
    enabled: !!userId,
  });
};

export const useUserServices = (userId: string | undefined) => {
  return useQuery({
    queryKey: ['userServices', userId],
    queryFn: async () => {
      if (!userId) return [];

      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('provider_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      return data || [];
    },
    enabled: !!userId,
  });
};

export const userFavoritesHook = (userId: string | undefined) => {
  return useQuery({
    queryKey: ['userFavoritesDetails', userId],
    queryFn: async () => {
      if (!userId) return { pets: [], services: [] };

      // 1. Get favorite relations
      const { data: favorites, error: favError } = await supabase
        .from('favorites')
        .select('item_id, item_type')
        .eq('user_id', userId);

      if (favError) {
        console.error('Error fetching favorites:', favError);
        return { pets: [], services: [] };
      }

      const petIds = favorites.filter(f => f.item_type === 'pet').map(f => f.item_id);
      const serviceIds = favorites.filter(f => f.item_type === 'service').map(f => f.item_id);

      // 2. Fetch details for pets and services in parallel
      const [petRes, serviceRes] = await Promise.all([
        petIds.length > 0 
          ? supabase.from('pets').select('*').in('id', petIds)
          : Promise.resolve({ data: [], error: null }),
        serviceIds.length > 0
          ? supabase.from('services').select('*').in('id', serviceIds)
          : Promise.resolve({ data: [], error: null }),
      ]);

      if (petRes.error) console.error('Error fetching favorite pets:', petRes.error);
      if (serviceRes.error) console.error('Error fetching favorite services:', serviceRes.error);

      return {
        pets: petRes.data || [],
        services: serviceRes.data || [],
      };
    },
    enabled: !!userId,
  });
};

export const addToFavoritesHook = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async ({ itemId, itemType }: { itemId: string; itemType: 'pet' | 'service' }) => {
      if (!user) throw new Error('User not authenticated');
      const { error } = await supabase.from('favorites').insert({
        user_id: user.id,
        item_id: itemId,
        item_type: itemType,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userFavoritesDetails'] });
    },
  });
};

export const removeFromFavoritesHook = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async ({ itemId, itemType }: { itemId: string; itemType: 'pet' | 'service' }) => {
      if (!user) throw new Error('User not authenticated');
      const { error } = await supabase.from('favorites').delete()
        .eq('user_id', user.id)
        .eq('item_id', itemId)
        .eq('item_type', itemType);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userFavoritesDetails'] });
    },
  });
};

export const useVaccines = () => {
  return useQuery({
    queryKey: ['vaccines'],
    queryFn: async () => {
      const { data, error } = await supabase.from('vaccines').select('*');
      if (error) throw new Error(error.message);
      return data;
    },
  });
};

// Hooks de mutação (ações)
export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ userId, profileData }: { userId: string, profileData: any }) => {
      const { error } = await supabase.from('profiles').update(profileData).eq('id', userId);
      if (error) throw new Error(error.message);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['profile', variables.userId] });
    },
  });
};

// Hook para adicionar pet
export const useAddPet = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ petData, imageFiles, selectedVaccines }: {
      petData: any;
      imageFiles: File[];
      selectedVaccines: string[];
    }) => {
      // 1. Upload all images to the 'pets' bucket
      const uploadPromises = imageFiles.map(file => {
        const fileExt = file.name.split('.').pop();
        const fileName = `${uuidv4()}.${fileExt}`;
        return supabase.storage.from('pets').upload(fileName, file);
      });

      const uploadResults = await Promise.all(uploadPromises);
      
      const imageUrls: string[] = [];
      for (const result of uploadResults) {
        if (result.error) throw result.error;
        const { data: publicUrlData } = supabase.storage.from('pets').getPublicUrl(result.data.path);
        imageUrls.push(publicUrlData.publicUrl);
      }

      // 2. Insert pet with the first image as the cover
      const { data: petDataResult, error: petError } = await supabase.from('pets').insert({
        ...petData,
        image_url: imageUrls[0] || null, // Use a primeira imagem como capa
      }).select().single();

      if (petError || !petDataResult) {
        throw new Error(petError?.message || 'Erro ao adicionar pet!');
      }

      const petId = petDataResult.id;

      // 3. Insert into pet_vaccines
      if (selectedVaccines.length > 0) {
        const vaccinesToInsert = selectedVaccines.map(vaccineId => ({
          pet_id: petId,
          vaccine_id: vaccineId,
        }));
        const { error: vaccineError } = await supabase.from('pet_vaccines').insert(vaccinesToInsert);
        if (vaccineError) throw vaccineError;
      }

      // 4. Insert into pet_images
      if (imageUrls.length > 0) {
        const imagesToInsert = imageUrls.map(url => ({
          pet_id: petId,
          image_url: url,
        }));
        const { error: imagesError } = await supabase.from('pet_images').insert(imagesToInsert);
        if (imagesError) throw imagesError;
      }

      return petDataResult;
    },
    onSuccess: (data) => {
      // Invalidate and refetch user's pets list
      queryClient.invalidateQueries({ queryKey: ['userPets', data.seller_id] });
    },
  });
};

export const useDeletePet = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (petId: string) => {
      const { error } = await supabase
        .from('pets')
        .delete()
        .eq('id', petId);

      if (error) throw error;
      return petId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userPets'] });
    },
  });
};

// Hook para deletar serviço
export const useDeleteService = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (serviceId: string) => {
      const { error } = await supabase
        .from('services')
        .delete()
        .eq('id', serviceId);

      if (error) throw error;
      return serviceId;
    },
    onSuccess: () => {
      // Invalida e refetch dos serviços
      queryClient.invalidateQueries({ queryKey: ['userServices'] });
    },
  });
};

// Hook para adicionar serviço
export const useAddService = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ serviceData, imageFile }: {
      serviceData: any;
      imageFile: File | null;
    }) => {
      let imageUrl = '';
      
      if (imageFile) {
        const { v4: uuidv4 } = await import('uuid');
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${uuidv4()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage.from('services').upload(fileName, imageFile);
        if (uploadError) throw uploadError;
        const { data: publicUrlData } = supabase.storage.from('services').getPublicUrl(fileName);
        imageUrl = publicUrlData.publicUrl;
      }

      const { data, error } = await supabase.from('services').insert({
        ...serviceData,
        image_url: imageUrl, // Será string vazia se não houver imagem
        created_at: new Date().toISOString(),
      }).select().single();

      if (error || !data) {
        throw new Error('Erro ao adicionar serviço!');
      }

      return data;
    },
    onSuccess: () => {
      // Invalida e refetch dos serviços
      queryClient.invalidateQueries({ queryKey: ['userServices'] });
    },
  });
};

// Hook para atualizar foto de perfil
export const useUpdateProfileImage = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ userId, imageFile }: { userId: string; imageFile: File }) => {
      const fileExt = imageFile.name.split('.').pop();
      const fileName = `${userId}.${fileExt}`;
      
      // Remove imagem antiga se existir
      await supabase.storage.from('profiles').remove([`${userId}`]);
      
      // Faz upload da nova imagem
      const { error: uploadError } = await supabase.storage
        .from('profiles')
        .upload(fileName, imageFile, { upsert: true });
      
      if (uploadError) throw uploadError;
      
      // Pega a URL pública
      const { data: publicUrlData } = supabase.storage.from('profiles').getPublicUrl(fileName);
      
      // Atualiza o perfil no banco
      const { error } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrlData.publicUrl })
        .eq('id', userId);
      
      if (error) throw error;
      
      return publicUrlData.publicUrl;
    },
    onSuccess: (_data, variables) => {
      // Invalida e refetch do perfil
      queryClient.invalidateQueries({ queryKey: ['userProfile', variables.userId] });
    },
  });
};

// Hook para remover foto de perfil
export const useRemoveProfileImage = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (userId: string) => {
      // Remove do storage
      await supabase.storage.from('profiles').remove([
        `${userId}.png`, 
        `${userId}.jpg`, 
        `${userId}.jpeg`, 
        `${userId}`
      ]);
      
      // Remove do banco
      const { error } = await supabase
        .from('profiles')
        .update({ avatar_url: '' })
        .eq('id', userId);
      
      if (error) throw error;
      
      return '';
    },
    onSuccess: (_data, variables) => {
      // Invalida e refetch do perfil
      queryClient.invalidateQueries({ queryKey: ['userProfile', variables] });
    },
  });
};

export const usePets = () => {
  return useQuery({
    queryKey: ['pets'],
    queryFn: () => {
      const query = supabase.from('pets').select('*').eq('status', 'available');
      return fetchPetsWithDetails(query);
    },
  });
};
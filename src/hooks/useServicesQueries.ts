import { useQuery, useMutation, useQueryClient, UseMutationOptions } from '@tanstack/react-query';
import { getServices, addToFavorites, removeFromFavorites, getUserFavorites } from '../lib/database';
import { supabase } from '../lib/supabase';

export const useServices = (filters: { category?: string; search?: string }) => {
  return useQuery({
    queryKey: ['services', filters],
    queryFn: async () => {
      const data = await getServices(filters);
      return data;
    },
  });
};

export const useProviderProfiles = (providerIds: string[]) => {
  return useQuery({
    queryKey: ['providerProfiles', providerIds],
    queryFn: async () => {
      if (providerIds.length === 0) return {};
      
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url')
        .in('id', providerIds);

      if (error) throw error;

      const profilesMap: Record<string, any> = {};
      data?.forEach(profile => {
        profilesMap[profile.id] = profile;
      });

      return profilesMap;
    },
    enabled: providerIds.length > 0,
  });
};

export const userFavoritesHook = () => {
  return useQuery({
    queryKey: ['userFavorites'],
    queryFn: async () => {
      const favorites = await getUserFavorites();
      return favorites.map((fav: any) => fav.item_id);
    },
  });
};

export const addToFavoritesHook = (options?: Partial<UseMutationOptions<{ itemId: string; itemType: "pet" | "service" }, Error, { itemId: string; itemType: "pet" | "service" }>>) => {
  const queryClient = useQueryClient();
  return useMutation<{ itemId: string; itemType: "pet" | "service" }, Error, { itemId: string; itemType: "pet" | "service" }>({
    mutationFn: async ({ itemId, itemType }) => {
      await addToFavorites(itemId, itemType);
      return { itemId, itemType };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userFavorites'] });
    },
    ...(options || {})
  });
};

export const removeFromFavoritesHook = (options?: Partial<UseMutationOptions<{ itemId: string; itemType: "pet" | "service" }, Error, { itemId: string; itemType: "pet" | "service" }>>) => {
  const queryClient = useQueryClient();
  return useMutation<{ itemId: string; itemType: "pet" | "service" }, Error, { itemId: string; itemType: "pet" | "service" }>({
    mutationFn: async ({ itemId, itemType }) => {
      await removeFromFavorites(itemId, itemType);
      return { itemId, itemType };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userFavorites'] });
    },
    ...(options || {})
  });
}; 
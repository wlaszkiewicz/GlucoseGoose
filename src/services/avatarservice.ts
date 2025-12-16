import { storage } from '../../firebaseConfig';
import { ref, getDownloadURL, uploadBytes } from 'firebase/storage';

export const AVATAR_OPTIONS = [
  { id: 'classic_goose', name: 'Classic Goose', storagePath: 'avatars/pp1.png' },
  { id: 'cowboy_goose', name: 'Cowboy Goose', storagePath: 'avatars/pp2.png' },
  { id: 'party_goose', name: 'Party Goose', storagePath: 'avatars/pp3.png' },
  { id: 'floral_goose', name: 'Floral Goose', storagePath: 'avatars/pp4.png' },
  { id: 'blossom_goose', name: 'Blossom Goose', storagePath: 'avatars/pp5.png' },
  { id: 'vintage_goose', name: 'Vintage Goose', storagePath: 'avatars/pp6.png' },
] as const;

export type AvatarId = typeof AVATAR_OPTIONS[number]['id'];

export const getAvatarUrl = async (avatarId: AvatarId): Promise<string> => {

  try {
    const avatarOption = AVATAR_OPTIONS.find(option => option.id === avatarId);
    if (!avatarOption) {
      throw new Error(`Avatar ${avatarId} not found`);
    }
    
    const storageRef = ref(storage, avatarOption.storagePath);
    const url = await getDownloadURL(storageRef);
    return url;
  } catch (error) {
    console.error('Error getting avatar URL:', error);
    const defaultRef = ref(storage, 'avatars/goose1.png');
    return await getDownloadURL(defaultRef);
  }
};

export const getAllAvatarUrls = async (): Promise<Array<{id: AvatarId, url: string, name: string}>> => {
  try {
    const promises = AVATAR_OPTIONS.map(async (option) => {
      const storageRef = ref(storage, option.storagePath);
      const url = await getDownloadURL(storageRef);
      return { id: option.id, url, name: option.name };
    });
    
    const avatars = await Promise.all(promises);
    return avatars;
  } catch (error) {
    console.error('Error getting all avatar URLs:', error);
    return [];
  }
};

export const uploadCustomAvatar = async (userId: string, fileUri: string): Promise<string> => {
  try {
    const response = await fetch(fileUri);
    const blob = await response.blob();
    
    const storageRef = ref(storage, `user-avatars/${userId}/${Date.now()}.jpg`);
    await uploadBytes(storageRef, blob);
    
    const downloadUrl = await getDownloadURL(storageRef);
    return downloadUrl;
  } catch (error) {
    console.error('Error uploading custom avatar:', error);
    throw error;
  }
};

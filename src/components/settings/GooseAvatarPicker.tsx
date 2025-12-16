import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { VintageColors } from '../../themes/vintage/colors';
import { getAllAvatarUrls, AVATAR_OPTIONS } from '../../services/avatarservice';

interface GooseAvatarPickerProps {
  visible: boolean;
  onClose: () => void;
  onAvatarSelect: (avatarId: string) => void;
  currentAvatar: string;
}

const GooseAvatarPicker: React.FC<GooseAvatarPickerProps> = ({
  visible,
  onClose,
  onAvatarSelect,
  currentAvatar,
}) => {
  const [selectedAvatarId, setSelectedAvatarId] = useState<string>(currentAvatar || 'goose1');
  const [avatarData, setAvatarData] = useState<Array<{id: string, url: string, name: string}>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (visible) {
      loadAvatars();
    }
  }, [visible]);

  const loadAvatars = async () => {
    setLoading(true);
    try {
      const avatars = await getAllAvatarUrls();
      setAvatarData(avatars);
    } catch (error) {
      console.error('Error loading avatars:', error);
      const fallbackAvatars = AVATAR_OPTIONS.map(option => ({
        id: option.id,
        url: '',
        name: option.name
      }));
      setAvatarData(fallbackAvatars);
    }
    setLoading(false);
  };

  const handleAvatarSelect = (avatarId: string) => {
    setSelectedAvatarId(avatarId);
  };

  const handleConfirm = () => {
    onAvatarSelect(selectedAvatarId);
    onClose();
  };

  const getAvatarSource = (avatar: {id: string, url: string}) => {
    if (avatar.url) {
      return { uri: avatar.url };
    }
    
    switch(avatar.id) {
      case 'classic_goose': return require('../../../assets/profilePictures/pp1.png');
      case 'cowboy_goose': return require('../../../assets/profilePictures/pp2.png');
      case 'party_goose': return require('../../../assets/profilePictures/pp3.png');
      case 'floral_goose': return require('../../../assets/profilePictures/pp4.png');
      case 'blossom_goose': return require('../../../assets/profilePictures/pp5.png');
      case 'vintage_goose': return require('../../../assets/profilePictures/pp6.png');
      default: return require('../../../assets/profilePictures/pp1.png');
    }
  };

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <Text style={styles.title}>Choose Your Goose Avatar</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Feather name="x" size={24} color={VintageColors.primaryText} />
            </TouchableOpacity>
          </View>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={VintageColors.iconPink} />
              <Text style={styles.loadingText}>Loading avatars...</Text>
            </View>
          ) : (
            <ScrollView 
              contentContainerStyle={styles.avatarsContainer}
              showsVerticalScrollIndicator={false}
            >
              {avatarData.map((avatar) => (
                <TouchableOpacity
                  key={avatar.id}
                  style={[
                    styles.avatarItem,
                    selectedAvatarId === avatar.id && styles.avatarItemSelected,
                  ]}
                  onPress={() => handleAvatarSelect(avatar.id)}
                >
                  <View style={styles.avatarImageContainer}>
                    <Image
                      source={getAvatarSource(avatar)}
                      style={styles.avatarImage}
                      resizeMode="cover"
                      onError={(e) => console.log('Error loading avatar:', avatar.id, e.nativeEvent.error)}
                    />
                    {selectedAvatarId === avatar.id && (
                      <View style={styles.selectedIndicator}>
                        <Feather name="check" size={20} color="#FFFFFF" />
                      </View>
                    )}
                  </View>
                  <Text style={styles.avatarName}>{avatar.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}

          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={onClose}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.confirmButton}
              onPress={handleConfirm}
              disabled={loading}
            >
              <Text style={styles.confirmButtonText}>Select Avatar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalContent: {
    backgroundColor: VintageColors.lightBackground,
    borderRadius: 20,
    width: '100%',
    maxHeight: '80%',
    borderWidth: 3,
    borderColor: VintageColors.cardBackground,
    shadowColor: VintageColors.lightBorder,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: VintageColors.border,
  },
  title: {
    fontSize: 20,
    fontWeight: '300',
    color: VintageColors.primaryText,
    letterSpacing: 1,
    flex: 1,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: VintageColors.cardBackground,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: VintageColors.border,
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: VintageColors.secondaryText,
  },
  avatarsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    padding: 20,
  },
  avatarItem: {
    width: '48%',
    alignItems: 'center',
    marginBottom: 20,
    padding: 15,
    borderRadius: 12,
    backgroundColor: VintageColors.cardBackground,
    borderWidth: 1,
    borderColor: VintageColors.border,
  },
  avatarItemSelected: {
    borderColor: VintageColors.iconPink,
    borderWidth: 2,
    backgroundColor: 'rgba(236, 72, 153, 0.1)',
  },
  avatarImageContainer: {
    position: 'relative',
    marginBottom: 10,
  },
  avatarImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: VintageColors.border,
  },
  selectedIndicator: {
    position: 'absolute',
    top: 5,
    right: 5,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: VintageColors.signOutButton,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  avatarName: {
    fontSize: 14,
    fontWeight: '400',
    color: VintageColors.primaryText,
    textAlign: 'center',
    marginTop: 5,
  },
  footer: {
    flexDirection: 'row',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: VintageColors.border,
    justifyContent: 'space-between',
  },
  cancelButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginRight: 10,
    backgroundColor: VintageColors.cardBackground,
    borderWidth: 1,
    borderColor: VintageColors.border,
  },
  confirmButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginLeft: 10,
    backgroundColor: VintageColors.signOutButton,
    borderWidth: 1,
    borderColor: VintageColors.iconPink,
  },
  confirmButtonDisabled: {
    opacity: 0.5,
  },
  cancelButtonText: {
    color: VintageColors.primaryText,
    fontSize: 16,
    fontWeight: '400',
    letterSpacing: 0.5,
  },
  confirmButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '400',
    letterSpacing: 0.5,
  },
});

export default GooseAvatarPicker;
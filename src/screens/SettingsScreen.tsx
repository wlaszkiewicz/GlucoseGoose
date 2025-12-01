import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image } from 'react-native';
import { Feather, MaterialIcons, Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { VintageStyles } from '../themes/vintage/styles_vintage';
import { VintageColors } from '../themes/vintage/colors_vintage';
import { useNavigation } from '@react-navigation/native';
import { logoutUser } from '../services/authService';
import { useNightscout } from '../context/NightscoutContext';
import { useAuth } from '../context/AuthContext';

const gooseImage = require('../../assets/goose1.png');

const SettingsScreen = () => {
  const navigation = useNavigation();
  const { reset } = useNightscout();
  const { userData } = useAuth();

  const handleLogout = async () => {
    const result = await logoutUser();

    if (result.success) {
      reset(); // wyczyszczenie danych Nightscout
      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' as never }],
      });
    } else {
      console.error("Logout failed:", result.error);
    }
  };

  return (
    <ScrollView style={VintageStyles.container} showsVerticalScrollIndicator={false}>
      
      {/* Header */}
      <View style={VintageStyles.header}>
        <View style={VintageStyles.headerDecoration}>
          <View style={VintageStyles.headerLine} />
          <Text style={VintageStyles.headerTitle}>My Profile</Text>
          <View style={VintageStyles.headerLine} />
        </View>
      </View>

      {/* Profile */}
      <View style={VintageStyles.profileSection}>
        <View style={VintageStyles.avatarContainer}>
          <View style={VintageStyles.gooseAvatarCircle}>
            <Image 
              source={gooseImage} 
              style={VintageStyles.gooseAvatarImage} 
              resizeMode="cover" 
            />
          </View>
        </View>
        
        <Text style={VintageStyles.profileName}>Goose</Text>

        <View style={VintageStyles.spacing10} />
        
        {/* Stats */}
        <View style={VintageStyles.vintageStats}>
          <View style={VintageStyles.statItem}>
            <View style={VintageStyles.statIconContainer}>
              <Feather name="droplet" size={18} color={VintageColors.statIcon} />
            </View>
            <Text style={VintageStyles.statValue}>5.8</Text>
            <Text style={VintageStyles.statLabel}>glucose</Text>
          </View>
          
          <View style={VintageStyles.statDivider} />
          
          <View style={VintageStyles.statItem}>
            <View style={VintageStyles.statIconContainer}>
              <Ionicons name="flower" size={18} color={VintageColors.statIcon} />
            </View>
            <Text style={VintageStyles.statValue}>85%</Text>
            <Text style={VintageStyles.statLabel}>in range</Text>
          </View>
          
          <View style={VintageStyles.statDivider} />
          
          <View style={VintageStyles.statItem}>
            <View style={VintageStyles.statIconContainer}>
              <Feather name="sun" size={18} color={VintageColors.statIcon} />
            </View>
            <Text style={VintageStyles.statValue}>28</Text>
            <Text style={VintageStyles.statLabel}>days</Text>
          </View>
        </View>
      </View>

      {/* Cards */}
      <View style={VintageStyles.settingsList}>
        <View style={VintageStyles.sectionHeader}>
          <Text style={VintageStyles.sectionTitle}>Settings & Preferences</Text>
          <View style={VintageStyles.featherAccent}>
            <FontAwesome5 name="feather-alt" size={16} color={VintageColors.primaryText} />
          </View>
        </View>
        
        <TouchableOpacity style={VintageStyles.vintageCard}>
          <View style={[VintageStyles.settingIcon, { backgroundColor: VintageColors.iconGreen }]}>
            <Feather name="user" size={22} color={VintageColors.primaryText} />
          </View>
          <View style={VintageStyles.settingTextContainer}>
            <Text style={VintageStyles.settingText}>Account & Profile</Text>
            <Text style={VintageStyles.settingSubtext}>Update personal information</Text>
          </View>
          <View style={VintageStyles.vintageArrow}>
            <Feather name="chevron-right" size={20} color={VintageColors.secondaryText} />
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={VintageStyles.vintageCard}>
          <View style={[VintageStyles.settingIcon, { backgroundColor: VintageColors.iconYellow }]}>
            <Ionicons name="notifications-outline" size={22} color={VintageColors.primaryText} />
          </View>
          <View style={VintageStyles.settingTextContainer}>
            <Text style={VintageStyles.settingText}>Reminders & Alerts</Text>
            <Text style={VintageStyles.settingSubtext}>Glucose checks, medication</Text>
          </View>
          <View style={VintageStyles.vintageArrow}>
            <Feather name="chevron-right" size={20} color={VintageColors.secondaryText} />
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={VintageStyles.vintageCard}>
          <View style={[VintageStyles.settingIcon, { backgroundColor: VintageColors.iconBlue }]}>
            <Feather name="activity" size={22} color={VintageColors.primaryText} />
          </View>
          <View style={VintageStyles.settingTextContainer}>
            <Text style={VintageStyles.settingText}>Health Data</Text>
            <Text style={VintageStyles.settingSubtext}>Connect devices & apps</Text>
          </View>
          <View style={VintageStyles.vintageArrow}>
            <Feather name="chevron-right" size={20} color={VintageColors.secondaryText} />
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={VintageStyles.vintageCard}>
          <View style={[VintageStyles.settingIcon, { backgroundColor: VintageColors.iconPink }]}>
            <MaterialIcons name="support-agent" size={22} color={VintageColors.primaryText} />
          </View>
          <View style={VintageStyles.settingTextContainer}>
            <Text style={VintageStyles.settingText}>Goose Support</Text>
            <Text style={VintageStyles.settingSubtext}>Help, FAQ & community</Text>
          </View>
          <View style={VintageStyles.vintageArrow}>
            <Feather name="chevron-right" size={20} color={VintageColors.secondaryText} />
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={VintageStyles.vintageCard}>
          <View style={[VintageStyles.settingIcon, { backgroundColor: VintageColors.iconPurple }]}>
            <Feather name="feather" size={22} color={VintageColors.primaryText} />
          </View>
          <View style={VintageStyles.settingTextContainer}>
            <Text style={VintageStyles.settingText}>Goose Features</Text>
            <Text style={VintageStyles.settingSubtext}>Themes & customization</Text>
          </View>
          <View style={VintageStyles.vintageArrow}>
            <Feather name="chevron-right" size={20} color={VintageColors.secondaryText} />
          </View>
        </TouchableOpacity>
      </View>

      {/* Sign out */}
      <TouchableOpacity style={VintageStyles.signOutButton} onPress={handleLogout}>
        <View style={VintageStyles.signOutIconContainer}>
          <Feather name="log-out" size={18} color={VintageColors.signOutText} />
        </View>
        <Text style={VintageStyles.signOutText}>Sign Out</Text>
      </TouchableOpacity>

      <View style={VintageStyles.spacing60} />
    </ScrollView>
  );
};

export default SettingsScreen;
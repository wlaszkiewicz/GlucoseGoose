import { VintageColors } from './colors_vintage';
import { VintageStyles } from './styles_vintage';

export const VintageNavBarConfig = {
  screenOptions: {
    headerShown: false,
    tabBarStyle: VintageStyles.tabBarContainer,
    tabBarActiveTintColor: VintageColors.tabBarTextColor, 
    tabBarInactiveTintColor: VintageColors.tabBarTextColor,
    tabBarLabelStyle: {
      fontSize: 11,
      letterSpacing: 0.5,
      marginTop: 0,
      marginBottom: 2,
      fontFamily: 'System',
      color: VintageColors.tabBarTextColor,
    },
    tabBarIconStyle: {
      marginTop: -2,
      marginBottom: 2,
    },
  },

  icons: {
    home: {
      active: "home",
      inactive: "home-outline",
      component: "Ionicons",
      sizeIncrement: 3,
    },
    journal: {
      active: "book-open",
      inactive: "book",
      component: "Feather",
      sizeIncrement: 3,
    },
    trends: {
      active: "chart-line",
      inactive: "chart-line", 
      component: "FontAwesome5",
      sizeIncrement: 1, 
      sizeDecrement: 1, 
    },
    profile: {
      active: "user",
      inactive: "user", 
      component: "Feather",
      sizeIncrement: 3,
    },
  },

  labels: {
    home: "Home",
    journal: "Journal",
    trends: "Trends",
    profile: "Profile",
  },

  getIconConfig: (routeName: string) => {
    return VintageNavBarConfig.icons[routeName.toLowerCase() as keyof typeof VintageNavBarConfig.icons];
  },

  getLabel: (routeName: string) => {
    return VintageNavBarConfig.labels[routeName.toLowerCase() as keyof typeof VintageNavBarConfig.labels] || routeName;
  },

  getIconSize: (focused: boolean, baseSize: number, routeName: string) => {
    const config = VintageNavBarConfig.getIconConfig(routeName);
    
    if (focused) {
      return baseSize + (config.sizeIncrement || 0);
    } else {
      if (routeName.toLowerCase() === 'trends' && config.sizeIncrement) {
        return baseSize - config.sizeIncrement;
      }
      return baseSize;
    }
  },

  getIconName: (focused: boolean, routeName: string) => {
    const config = VintageNavBarConfig.getIconConfig(routeName);
    return focused ? config.active : config.inactive;
  },

  getIconComponent: (routeName: string) => {
    const config = VintageNavBarConfig.getIconConfig(routeName);
    return config.component;
  },

  getLabelStyle: (focused: boolean) => ({
    ...VintageNavBarConfig.screenOptions.tabBarLabelStyle,
    fontWeight: focused ? '700' : '400',
  }),

  getIconColor: () => VintageColors.tabBarTextColor, 
};
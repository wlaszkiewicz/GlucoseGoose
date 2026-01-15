import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { JournalStackParamList } from "../../JournalStackNavigator";

type JournalNavigationProp = NativeStackNavigationProp<JournalStackParamList>;

export const useJournalNavigation = () => {
  const navigation = useNavigation<JournalNavigationProp>();

  const navigateToCategory = (category: string) => {
    switch (category.toLowerCase()) {
      case "food":
        navigation.navigate("Food");
        break;
      case "activities":
        navigation.navigate("Activities");
        break;
      case "notes":
        navigation.navigate("Notes");
        break;
      default:
        console.warn(`Unknown category: ${category}`);
    }
  };

  return {
    navigateToCategory,
  };
};

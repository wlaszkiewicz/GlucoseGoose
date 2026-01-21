import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { JournalStackParamList } from "../../navigation/JournalStackNavigator";

type JournalNavigationProp = NativeStackNavigationProp<JournalStackParamList>;

export const useJournalNavigation = () => {
  const navigation = useNavigation<JournalNavigationProp>();

  const navigateToCategory = (category: string, selectedDate: Date) => {
    switch (category.toLowerCase()) {
      case "food":
        navigation.navigate("Food", {
          selectedDate: selectedDate.toISOString(),
        });
        break;
      case "sports":
        navigation.navigate("Sports", {
          selectedDate: selectedDate.toISOString(),
        });
        break;
      case "other":
        navigation.navigate("Other", {
          selectedDate: selectedDate.toISOString(),
        });
        break;
      default:
        console.warn(`Unknown category: ${category}`);
    }
  };

  return {
    navigateToCategory,
  };
};

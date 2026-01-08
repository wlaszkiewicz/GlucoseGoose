import React, { useState, useRef, useEffect } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Dimensions,
  Keyboard,
  TouchableWithoutFeedback,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { VintageColors } from "../../themes/vintage/colors";

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get("window");

interface NumberPickerProps {
  visible: boolean;
  onClose: () => void;
  onValueSelect: (value: number) => void;
  selectedValue: number;
  title: string;
  unit: string;
  min: number;
  max: number;
  step?: number;
}

const NumberPicker: React.FC<NumberPickerProps> = ({
  visible,
  onClose,
  onValueSelect,
  selectedValue,
  title,
  unit,
  min,
  max,
  step = 1,
}) => {
  const [tempSelectedValue, setTempSelectedValue] = useState<number>(selectedValue);
  const [manualInput, setManualInput] = useState<string>(selectedValue.toString());
  const [isManualMode, setIsManualMode] = useState<boolean>(false);
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    if (visible) {
      setTempSelectedValue(selectedValue);
      setManualInput(selectedValue.toString());
      setIsManualMode(false);
    }
  }, [visible, selectedValue]);

  const handleValueSelect = (value: number) => {
    setTempSelectedValue(value);
    setManualInput(value.toString());
    setIsManualMode(false);
    Keyboard.dismiss();
  };

  const handleManualInput = (text: string) => {
    const numericValue = text.replace(/[^0-9]/g, '');
    setManualInput(numericValue);
    
    if (numericValue) {
      const num = parseInt(numericValue, 10);
      if (!isNaN(num)) {
        const clampedValue = Math.min(Math.max(num, min), max);
        setTempSelectedValue(clampedValue);
      }
    }
  };

  const handleManualSubmit = () => {
    if (manualInput) {
      const num = parseInt(manualInput, 10);
      if (!isNaN(num)) {
        const clampedValue = Math.min(Math.max(num, min), max);
        setTempSelectedValue(clampedValue);
        setManualInput(clampedValue.toString());
      }
    }
    setIsManualMode(false);
    Keyboard.dismiss();
  };

  const handleConfirm = () => {
    onValueSelect(tempSelectedValue);
    onClose();
  };

  const generateNumbers = () => {
    const numbers = [];
    for (let i = min; i <= max; i += step) {
      numbers.push(i);
    }
    return numbers;
  };

  const numbers = generateNumbers();

  const toggleManualMode = () => {
    setIsManualMode(!isManualMode);
    if (!isManualMode && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    } else {
      Keyboard.dismiss();
    }
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={() => {
        if (isManualMode) {
          handleManualSubmit();
        }
      }}>
        <View style={styles.overlay}>
          <View style={styles.container}>
            {/* Header */}
            <View style={[styles.header, { backgroundColor: VintageColors.lightBackground }]}>
              <View style={styles.headerContent}>
                <View style={styles.headerIcon}>
                  <Feather
                    name="sliders"
                    size={18}
                    color={VintageColors.primaryText}
                  />
                </View>
                <Text style={styles.title}>{title}</Text>
              </View>
            </View>

            {/* Current Value Display */}
            <View style={[styles.valueDisplayContainer, { backgroundColor: VintageColors.lightBackground }]}>
              {isManualMode ? (
                <View style={styles.manualInputContainer}>
                  <TextInput
                    ref={inputRef}
                    style={styles.manualInput}
                    value={manualInput}
                    onChangeText={handleManualInput}
                    keyboardType="number-pad"
                    maxLength={4}
                    onSubmitEditing={handleManualSubmit}
                    selectTextOnFocus
                    autoFocus
                  />
                  <Text style={styles.unitText}> {unit}</Text>
                </View>
              ) : (
                <TouchableOpacity 
                  style={styles.valueDisplayTouchable}
                  onPress={toggleManualMode}
                  activeOpacity={0.7}
                >
                  <Text style={styles.valueDisplayText}>
                    {tempSelectedValue}
                    <Text style={styles.unitText}> {unit}</Text>
                  </Text>
                  <Feather
                    name="edit-2"
                    size={18}
                    color={VintageColors.secondaryText}
                    style={styles.editIcon}
                  />
                </TouchableOpacity>
              )}
              
              <View style={styles.valueDisplaySubtext}>
                <Feather
                  name="info"
                  size={14}
                  color={VintageColors.secondaryText}
                />
                <Text style={styles.valueDisplaySubtextText}>
                  {isManualMode ? "Type value and press OK" : "Tap value to edit or scroll to select"}
                </Text>
              </View>
            </View>

            {/* Number Selector */}
            <View style={[styles.selectorContainer, { backgroundColor: VintageColors.cardBackground }]}>
              <View style={styles.scrollWrapper}>
                <ScrollView
                  style={styles.scrollContainer}
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={styles.scrollContent}
                  bounces={false}
                >
                  {numbers.map((number) => (
                    <TouchableOpacity
                      key={`number-${number}`}
                      style={[
                        styles.numberItem,
                        tempSelectedValue === number && styles.numberItemSelected,
                      ]}
                      onPress={() => handleValueSelect(number)}
                    >
                      <Text
                        style={[
                          styles.numberItemText,
                          tempSelectedValue === number && styles.numberItemTextSelected,
                        ]}
                      >
                        {number}
                      </Text>
                      <Text
                        style={[
                          styles.unitSmallText,
                          tempSelectedValue === number && styles.unitSmallTextSelected,
                        ]}
                      >
                        {unit}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
              
              
            </View>

            {/* Actions */}
            <View style={[styles.actions, { backgroundColor: VintageColors.lightBackground }]}>
              <TouchableOpacity
                onPress={onClose}
                style={[styles.actionButton, { backgroundColor: VintageColors.primaryText }]}
              >
                <Text style={[styles.actionButtonText, { color: '#FFFFFF' }]}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleConfirm}
                style={[styles.actionButton, styles.actionButtonPrimary, { backgroundColor: VintageColors.primaryText }]}
              >
                <Text style={[styles.actionButtonText, styles.actionButtonTextPrimary, { color: '#FFFFFF' }]}>
                  Select
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-start",
    alignItems: "center",
    paddingTop: SCREEN_HEIGHT * 0.2,
  },
  container: {
    backgroundColor: VintageColors.lightBackground,
    borderRadius: 20,
    width: SCREEN_WIDTH * 0.85,
    maxWidth: 400,
    maxHeight: SCREEN_HEIGHT * 0.7,
    borderWidth: 1,
    borderColor: VintageColors.border,
    shadowColor: VintageColors.lightBorder,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: VintageColors.border,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  headerIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: VintageColors.cardBackground,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: VintageColors.border,
    marginRight: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: "300",
    color: VintageColors.primaryText,
    letterSpacing: 1,
  },
  valueDisplayContainer: {
    paddingVertical: 20,
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: VintageColors.border,
    maxHeight: 140,
  },
  valueDisplayTouchable: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  valueDisplayText: {
    fontSize: 36,
    fontWeight: "600",
    color: VintageColors.primaryText,
    letterSpacing: 1,
  },
  editIcon: {
    marginLeft: 10,
  },
  manualInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  manualInput: {
    fontSize: 36,
    fontWeight: "600",
    color: VintageColors.primaryText,
    letterSpacing: 1,
    textAlign: "center",
    minWidth: 100,
    paddingHorizontal: 10,
    backgroundColor: VintageColors.cardBackground,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: VintageColors.primaryText,
  },
  unitText: {
    fontSize: 20,
    color: VintageColors.secondaryText,
    fontWeight: "400",
  },
  valueDisplaySubtext: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: VintageColors.cardBackground,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: VintageColors.border,
  },
  valueDisplaySubtextText: {
    fontSize: 11,
    color: VintageColors.secondaryText,
    fontWeight: "500",
    marginLeft: 6,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  selectorContainer: {
    padding: 16,
    minHeight: 200,
    backgroundColor: VintageColors.cardBackground,
  },
  scrollWrapper: {
    flex: 1,
    maxHeight: 180,
  },
  scrollContainer: {
    flex: 1,
    width: "100%",
  },
  scrollContent: {
    paddingVertical: 8,
    alignItems: "center",
  },
  numberItem: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 4,
    borderWidth: 1,
    borderColor: "transparent",
    backgroundColor: VintageColors.lightBackground,
  },
  numberItemSelected: {
    backgroundColor: VintageColors.signOutButton,
    borderColor: VintageColors.signOutBorder,
    transform: [{ scale: 1.1 }],
    zIndex: 2,
  },
  numberItemText: {
    fontSize: 16,
    color: VintageColors.primaryText,
    fontWeight: "400",
    marginRight: 6,
  },
  numberItemTextSelected: {
    color: VintageColors.signOutText,
    fontWeight: "600",
  },
  unitSmallText: {
    fontSize: 16,
    color: VintageColors.secondaryText,
    fontWeight: "400",
  },
  unitSmallTextSelected: {
    color: VintageColors.signOutText,
    fontWeight: "600",
  },
  manualButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 16,
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: VintageColors.lightBackground,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: VintageColors.border,
  },
  manualButtonText: {
    fontSize: 14,
    color: VintageColors.secondaryText,
    fontWeight: "500",
    marginLeft: 8,
  },
  manualButtonTextActive: {
    color: VintageColors.primaryText,
    fontWeight: "600",
  },
  actions: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: VintageColors.border,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  actionButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: VintageColors.border,
  },
  actionButtonPrimary: {
    marginLeft: 12,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: "500",
    letterSpacing: 0.5,
  },
  actionButtonTextPrimary: {
  },
});

export default NumberPicker;
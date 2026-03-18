import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  ActivityIndicator,
  Modal,
  FlatList,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import DateTimePicker from "react-native-modal-datetime-picker";

export default function RegisterScreen({ navigation }) {
  const [firstName, setFirstName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [lastName, setLastName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [gender, setGender] = useState("");
  const [email, setEmail] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [genderModalVisible, setGenderModalVisible] = useState(false);
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());

  const insets = useSafeAreaInsets();

  const showDatePicker = () => {
    setDatePickerVisibility(true);
  };

  const hideDatePicker = () => {
    setDatePickerVisibility(false);
  };

  const handleConfirm = (date) => {
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();
    const formattedDate = `${day}.${month}.${year}`;

    setBirthDate(formattedDate);
    setSelectedDate(date);
    hideDatePicker();
  };

  // Опции для пола
  const genderOptions = [
    { label: "Мужской", value: "male" },
    { label: "Женский", value: "female" },
  ];

  // Функция для получения отображаемого текста пола
  const getGenderLabel = (value) => {
    const option = genderOptions.find((opt) => opt.value === value);
    return option ? option.label : "Пол";
  };

  const isFormValid = (
    firstName.trim() !== "" &&
    middleName.trim() !== "" &&
    lastName.trim() !== "" &&
    birthDate.trim().length >= 10 &&
    gender.trim() !== "" &&
    email.trim() !== ""
  );

  const buttonColor = isFormValid ? "#1A6FEE" : "#C9D4FB";

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleRegister = async () => {
    if (
      !firstName ||
      !middleName ||
      !lastName ||
      !birthDate ||
      !gender ||
      !email
    ) {
      Alert.alert("Ошибка", "Заполните все поля");
      return;
    }

    if (!validateEmail(email)) {
      Alert.alert("Ошибка", "Введите корректный email");
      return;
    }

    setIsLoading(true);

    try {
      
      const formattedDate = birthDate.slice(6, 10) + "-" + birthDate.slice(3, 5) + "-" + birthDate.slice(0, 2)

      console.log("Регистрация:", {
        firstName,
        middleName,
        lastName,
        formattedDate,
        gender,
        email,
      });

      await AsyncStorage.setItem("firstName", firstName);
      await AsyncStorage.setItem("middleName", middleName);
      await AsyncStorage.setItem("lastName", lastName);
      await AsyncStorage.setItem("birthday", formattedDate);
      await AsyncStorage.setItem("gender", gender);
      await AsyncStorage.setItem("email", email);

      navigation.navigate("CreateTextPassword");
    } catch (error) {
      console.error("Ошибка регистрации:", error);
      Alert.alert("Ошибка", "Не удалось зарегистрироваться");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: insets.top,
          paddingBottom: insets.bottom,
          paddingLeft: insets.left,
          paddingRight: insets.right,
        },
      ]}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <View style={styles.contentContainer}>
          <View style={styles.textWithLogo}>
            <Text style={styles.title}>Создание профиля</Text>
            <Text style={styles.description}>
              Без профиля вы не сможете создавать проекты.
            </Text>
            <Text style={styles.description}>
              В профиле будут храниться результаты проектов и ваши описания.
            </Text>
          </View>

          <View style={styles.inputContainer}>
            {/* Имя */}
            <TextInput
              style={styles.input}
              placeholder="Имя"
              value={firstName}
              onChangeText={setFirstName}
              autoCapitalize="words"
              placeholderTextColor="#9ca3af"
              editable={!isLoading}
            />

            {/* Отчество */}
            <TextInput
              style={styles.input}
              placeholder="Отчество"
              value={middleName}
              onChangeText={setMiddleName}
              autoCapitalize="words"
              placeholderTextColor="#9ca3af"
              editable={!isLoading}
            />

            {/* Фамилия */}
            <TextInput
              style={styles.input}
              placeholder="Фамилия"
              value={lastName}
              onChangeText={setLastName}
              autoCapitalize="words"
              placeholderTextColor="#9ca3af"
              editable={!isLoading}
            />

            {/* Дата рождения */}
            <TouchableOpacity
              style={styles.input}
              onPress={showDatePicker}
              disabled={isLoading}
            >
              <Text
                style={[
                  styles.inputText,
                  !birthDate && styles.placeholderText,
                ]}
              >
                {birthDate || "Дата рождения"}
              </Text>
            </TouchableOpacity>

            {/* Модальный DatePicker */}
            <DateTimePicker
              isVisible={isDatePickerVisible}
              mode="date"
              onConfirm={handleConfirm}
              onCancel={hideDatePicker}
              maximumDate={new Date()}
              confirmTextIOS="Выбрать"
              cancelTextIOS="Отмена"
              headerTextIOS="Выберите дату рождения"
            />

            {/* Пол - кастомный дропдаун */}
            <TouchableOpacity
              style={styles.genderInput}
              onPress={() => setGenderModalVisible(true)}
              activeOpacity={1}
              disabled={isLoading}
            >
              <Text
                style={[
                  styles.genderInputText,
                  !gender && styles.genderPlaceholder,
                ]}
              >
                {getGenderLabel(gender)}
              </Text>
              <Image
                source={require("../../assets/Image/chevron-down.png")}
                style={styles.dropdownIcon}
              />
            </TouchableOpacity>

            {/* Модальное окно для выбора пола */}
            <Modal
              animationType="fade"
              transparent={true}
              visible={genderModalVisible}
              onRequestClose={() => setGenderModalVisible(false)}
            >
              <TouchableOpacity
                style={styles.modalOverlay}
                activeOpacity={1}
                onPress={() => setGenderModalVisible(false)}
              >
                <View style={styles.modalContent}>
                  <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>Пол</Text>
                    <TouchableOpacity
                      onPress={() => setGenderModalVisible(false)}
                    >
                      <Text style={styles.closeButton}>✕</Text>
                    </TouchableOpacity>
                  </View>

                  <FlatList
                    data={genderOptions}
                    keyExtractor={(item) => item.value}
                    renderItem={({ item }) => (
                      <TouchableOpacity
                        style={[
                          styles.optionItem,
                          gender === item.value && styles.optionItemActive,
                        ]}
                        onPress={() => {
                          setGender(item.value);
                          setGenderModalVisible(false);
                        }}
                      >
                        <Text
                          style={[
                            styles.optionText,
                            gender === item.value && styles.optionTextActive,
                          ]}
                        >
                          {item.label}
                        </Text>
                        {gender === item.value && (
                          <Text style={styles.checkmark}>✓</Text>
                        )}
                      </TouchableOpacity>
                    )}
                  />
                </View>
              </TouchableOpacity>
            </Modal>

            {/* Email */}
            <TextInput
              style={styles.input}
              placeholder="Почта"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              placeholderTextColor="#9ca3af"
              editable={!isLoading}
            />

            <TouchableOpacity
              style={[styles.registerButton, { backgroundColor: buttonColor }]}
              onPress={handleRegister}
              disabled={!isFormValid || isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.registerButtonText}>Далее</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.loginLink}
              onPress={() => navigation.navigate("Login")}
              disabled={isLoading}
            >
              <Text style={styles.loginLinkText}>Уже есть аккаунт? Войти</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  keyboardView: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  textWithLogo: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: "#939396",
    lineHeight: 20,
  },
  inputContainer: {
    gap: 12,
  },
  // Общий стиль для всех полей ввода
  input: {
    borderWidth: 1,
    borderColor: "#EBEBEB",
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    backgroundColor: "#F5F5F9",
    color: "#1f2937",
    justifyContent: "center",
  },
  inputText: {
    fontSize: 15,
    color: "#1f2937",
  },
  placeholderText: {
    color: "#9ca3af",
  },
  // Стили для поля пола (выглядит как input)
  genderInput: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "#EBEBEB",
    borderRadius: 12,
    padding: 14,
    backgroundColor: "#F5F5F9",
  },
  genderInputText: {
    fontSize: 15,
    color: "#1f2937",
    flex: 1,
  },
  genderPlaceholder: {
    color: "#9ca3af",
  },
  dropdownIcon: {
    width: 20,
    height: 20,
    tintColor: "#6b7280",
  },
  // Стили для модального окна выбора пола
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 20,
    maxHeight: "50%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1f2937",
  },
  closeButton: {
    fontSize: 20,
    color: "#6b7280",
    padding: 4,
  },
  optionItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  optionItemActive: {
    backgroundColor: "#f0f9ff",
  },
  optionText: {
    fontSize: 16,
    color: "#374151",
  },
  optionTextActive: {
    color: "#1A6FEE",
    fontWeight: "500",
  },
  checkmark: {
    color: "#1A6FEE",
    fontSize: 18,
    fontWeight: "bold",
  },
  // Стили для кнопки регистрации
  registerButton: {
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    minHeight: 56,
    justifyContent: "center",
  },
  registerButtonText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 17,
  },
  loginLink: {
    marginTop: 12,
    marginBottom: 20,
  },
  loginLinkText: {
    color: "#2074F2",
    textAlign: "center",
    fontSize: 15,
  },
});
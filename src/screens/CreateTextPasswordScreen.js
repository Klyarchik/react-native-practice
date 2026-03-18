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
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function CreateTextPasswordScreen({ navigation }) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const insets = useSafeAreaInsets();

  const isFormValid = password.trim() !== "" && confirmPassword.trim() !== "";

  const buttonColor = isFormValid ? "#1A6FEE" : "#C9D4FB";

  const validatePassword = (password) => {
    const errors = [];

    if (password.length < 8) {
      errors.push("минимум 8 символов");
    }
    if (!/[A-Z]/.test(password)) {
      errors.push("хотя бы одну заглавную букву");
    }
    if (!/[a-z]/.test(password)) {
      errors.push("хотя бы одну строчную букву");
    }
    if (!/[0-9]/.test(password)) {
      errors.push("хотя бы одну цифру");
    }

    return errors;
  };

  const handleRegister = async () => {
    const passwordErrors = validatePassword(password);
    if (passwordErrors.length > 0) {
      Alert.alert(
        "Ошибка",
        `Пароль должен содержать:\n• ${passwordErrors.join("\n• ")}`,
      );
      return;
    }

    if (!password || !confirmPassword) {
      Alert.alert("Ошибка", "Заполните все поля");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Ошибка", "Пароли не совпадают");
      return;
    }

    setIsLoading(true);

    try {
      const email = await AsyncStorage.getItem("email");
      const firstName = await AsyncStorage.getItem("firstName");
      const middleName = await AsyncStorage.getItem("middleName");
      const lastName = await AsyncStorage.getItem("lastName");
      const birthday = await AsyncStorage.getItem("birthday");
      const gender = await AsyncStorage.getItem("gender");

      console.log("Регистрация:", {
        firstName,
        middleName,
        lastName,
        birthday,
        gender,
        email,
      });

      // РЕГИСТРАЦИЯ
      let userId;

      const responseReg = await fetch(
        "http://2.nntc.nnov.ru:8900/api/collections/users/records",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email,
            password: password,
            passwordConfirm: confirmPassword,
          }),
        },
      );

      const dataReg = await responseReg.json();

      if (responseReg.ok) {
        // Успешная авторизация
        console.log("Успешная регистрация:", dataReg);
        userId = dataReg.id;
      } else {
        let dataError
        if(dataReg.data?.email?.code){
          dataError = "Такой email уже используется"
        }
        return Alert.alert(
          "Ошибка",
          dataError || dataReg.message || "Неверный email или пароль",
        );
      }

      

      // АВТОРИЗАЦИЯ ДЛЯ ПОЛУЧЕНИЯ ТОКЕНА
      const responseAuth = await fetch(
        "http://2.nntc.nnov.ru:8900/api/collections/users/auth-with-password",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            identity: email,
            password: password,
          }),
        },
      );

      const dataA = await responseAuth.json();
      let token

      if (responseAuth.ok) {
        // Успешная авторизация
        console.log("Успешная регистрация:", dataA);
        token = dataA.token
        await AsyncStorage.setItem("userToken", dataA.token);
        await AsyncStorage.setItem("userId", userId)
      } else {
        return Alert.alert("Ошибка", dataA.message || "Ошибка авторизации");
      }



      // ОБНОВЛЕНИЕ ДАННЫХ ПОЛЬЗОВАТЕЛЯ
      const responseUserUpdate = await fetch(
        `http://2.nntc.nnov.ru:8900/api/collections/users/records/${userId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({
            first_name: firstName,
            last_name: lastName,
            patronymic: middleName,
            birthday: birthday,
            gender: gender,
          }),
        },
      );

      const dataUU = await responseUserUpdate.json();

      if (responseUserUpdate.ok) {
        // Успешная авторизация
        console.log("Успешная регистрация:", dataUU);
      } else {
        return Alert.alert(
          "Ошибка",
          dataUU.message || "Не удалось обновить данные пользователя",
        );
      }

      // Переход на следующий экран после успешной регистрации, обновлении профиля, авторизации и получения токена
      navigation.navigate("CreatePassword"); // или другой экран
    } catch (error) {
      console.error("Ошибка сохранения пароля:", error);
      Alert.alert("Ошибка", "Не удалось сохранить пароль");
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
            <View>
              <Image
                source={require("../../assets/Image/hello.png")}
                style={styles.logo}
              />
              <Text style={styles.title}>Создание пароля</Text>
            </View>

            <Text style={styles.description}>Введите новый пароль</Text>
          </View>

          <View style={styles.inputContainer}>
            {/* Пароль */}
            <View>
              <Text style={styles.label}>Новый пароль</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={styles.passwordInput}
                  placeholder="Введите пароль"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  placeholderTextColor="#9ca3af"
                  editable={!isLoading}
                />
                <TouchableOpacity
                  style={styles.eyeButton}
                  onPress={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                >
                  <Image
                    style={styles.eyeIcon}
                    source={
                      showPassword
                        ? require("../../assets/Image/openEye.png")
                        : require("../../assets/Image/closeEye.png")
                    }
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Подтверждение пароля */}
            <View>
              <Text style={styles.label}>Повторите пароль</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={styles.passwordInput}
                  placeholder="Повторите пароль"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showPasswordConfirm}
                  placeholderTextColor="#9ca3af"
                  editable={!isLoading}
                />
                <TouchableOpacity
                  style={styles.eyeButton}
                  onPress={() => setShowPasswordConfirm(!showPasswordConfirm)}
                  disabled={isLoading}
                >
                  <Image
                    style={styles.eyeIcon}
                    source={
                      showPasswordConfirm
                        ? require("../../assets/Image/openEye.png")
                        : require("../../assets/Image/closeEye.png")
                    }
                  />
                </TouchableOpacity>
              </View>
            </View>

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
  logo: {
    height: 32,
    width: 32,
    marginBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: "#000000",
    lineHeight: 20,
  },
  label: {
    fontSize: 14,
    color: "#7E7E9A",
    marginBottom: 4,
  },
  inputContainer: {
    gap: 16,
  },
  // Стили для обычного input (подтверждение пароля)
  input: {
    borderWidth: 1,
    borderColor: "#EBEBEB",
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    backgroundColor: "#F5F5F9",
    color: "#1f2937",
  },
  // Стили для контейнера пароля с иконкой глаза
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#EBEBEB",
    borderRadius: 12,
    backgroundColor: "#F5F5F9",
  },
  passwordInput: {
    flex: 1,
    padding: 14,
    fontSize: 15,
    color: "#1f2937",
  },
  eyeButton: {
    padding: 14,
  },
  eyeIcon: {
    width: 24,
    height: 24,
    resizeMode: "contain",
    tintColor: "#6b7280",
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
});

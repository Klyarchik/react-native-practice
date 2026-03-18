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

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false); // Состояние для видимости пароля
  const [isLoading, setIsLoading] = useState(false);
  const insets = useSafeAreaInsets();

  const isFormValid = email.trim() !== "" && password.trim() !== "";
  const buttonColor = isFormValid ? "#1A6FEE" : "#C9D4FB";

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Ошибка", "Заполните все поля");
      return;
    }

    setIsLoading(true); // Показываем индикатор загрузки

    try {
      // Отправляем запрос на сервер
      const response = await fetch(
        "http://2.nntc.nnov.ru:8900/api/collections/users/auth-with-password",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            identity: email.trim(),
            password: password.trim(),
          }),
        },
      );

      const data = await response.json();
      let token

      if (response.ok) {
        // Успешная авторизация
        console.log("Успешная регистрация:", data);
        token = data.token
        await AsyncStorage.setItem("userToken", data.token);
        await AsyncStorage.setItem("userId", data.record.id)

        navigation.replace("CreatePassword");
      } else {
        Alert.alert("Ошибка", "Неверный email или пароль");
      }
    } catch (error) {
      console.error("Ошибка авторизации:", error);
      Alert.alert(
        "Ошибка соединения",
        "Не удалось подключиться к серверу. Проверьте интернет-соединение.",
      );
    } finally {
      setIsLoading(false); // Скрываем индикатор загрузки
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
            <Image
              source={require("../../assets/Image/hello.png")}
              style={styles.logo}
            />
            <Text style={styles.title}>Добро пожаловать!</Text>
            <Text>Войдите, чтобы воспользоваться функциями приложения</Text>
          </View>

          <View style={styles.inputContainer}>
            <View>
              <Text style={styles.label}>Вход по E-mail</Text>
              <TextInput
                style={styles.input}
                placeholder="example@mail.com"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                placeholderTextColor="#9ca3af"
                editable={!isLoading}
              />
            </View>

            <View>
              <Text style={styles.label}>Пароль</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={styles.passwordInput}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword} // Используем состояние для скрытия/показа
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

            <TouchableOpacity
              style={[styles.loginButton, { backgroundColor: buttonColor }]}
              onPress={handleLogin}
              disabled={!isFormValid || isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" /> // Показываем индикатор загрузки
              ) : (
                <Text style={styles.loginButtonText}>Далее</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.registerLink}
              onPress={() => navigation.navigate("Register")}
              disabled={isLoading}
            >
              <Text style={styles.registerLinkText}>Зарегистрироваться</Text>
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
    display: "flex",
  },
  logo: {
    height: 32,
    width: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 32,
    color: "#1f2937",
  },
  label: {
    fontSize: 14,
    color: "#7E7E9A",
    lineHeight: 20,
  },
  inputContainer: {
    gap: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: "#EBEBEB",
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    backgroundColor: "#F5F5F9",
  },
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
    padding: 16,
    fontSize: 16,
  },
  eyeButton: {
    padding: 16,
  },
  eyeIcon: {
    width: 24,
    height: 24,
    resizeMode: "contain",
  },
  loginButton: {
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    minHeight: 56, // Фиксированная высота для кнопки
    justifyContent: "center", // Центрируем содержимое
  },
  loginButtonText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 17,
  },
  registerLink: {
    marginTop: 16,
  },
  registerLinkText: {
    color: "#2074F2",
    textAlign: "center",
    fontSize: 15,
  },
});

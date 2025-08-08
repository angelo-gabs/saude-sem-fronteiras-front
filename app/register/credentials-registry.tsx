import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Animated,
  View,
  SafeAreaView,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { router } from "expo-router";
import { colors } from "../../constants/colors";
import Input from "../../components/Input";
import Button from "../../components/Button";
import HeaderPage from "../../components/HeaderPage";
import SelectionModal from "../../components/CustomModal";
import SimpleModal from "../../components/Modal";
import { apiGet, apiPost } from "../../utils/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { STORAGE_CREDENTIALS, STORAGE_USER } from "../../constants/storage";
import { Credentials } from "../../domain/Credentials/credentials";
import {
  ERROR_CREDENTIALS,
  FAIL_CREDENTIALS,
  PASSWORD_INCORRECT,
} from "../../utils/messages";
import InputPassword from "../../components/Input/inputPassword";

const CredentialsRegistryPage: React.FC = () => {
  const [isModalVisible, setModalVisible] = useState(false);
  const [isErrorModalVisible, setErrorModalVisible] = useState(false);
  const [offset] = useState(new Animated.ValueXY({ x: 0, y: 95 }));
  const [opacity] = useState(new Animated.Value(0));
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");

  const handleBackPress = () => {
    router.replace("/");
  };

  const handleAuxiliaryModalPress = () => {
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
  };

  const handleSelectLabels = (labels: string[]) => {
    console.log("Labels selecionadas:", labels);
  };

  const handleRegistry = async () => {
    try {
      if (password === passwordConfirmation) {
        setLoading(true);
        await apiPost("/Credentials", { email, password });

        const response = await apiGet<Credentials>(
          `/Credentials/${email}/${password}`
        );
        AsyncStorage.setItem(
          STORAGE_CREDENTIALS,
          JSON.stringify(response.data)
        ).then(() => router.push("/register"));
      } else {
        setMessage(PASSWORD_INCORRECT);
        setErrorModalVisible(true);
      }
    } catch (err: any) {
      setMessage(ERROR_CREDENTIALS);
      setErrorModalVisible(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    try {
      AsyncStorage.removeItem(STORAGE_USER);
    } catch (error) {
      setMessage(FAIL_CREDENTIALS);
      setErrorModalVisible(true);
    }
  });

  useEffect(() => {
    Animated.parallel([
      Animated.spring(offset.y, {
        toValue: 0,
        speed: 4,
        useNativeDriver: true,
        bounciness: 20,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <HeaderPage
        title="Cadastro das Credenciais"
        onBackPress={handleBackPress}
        auxiliaryModalPress={handleAuxiliaryModalPress}
      />
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}
      >
        <ScrollView contentContainerStyle={styles.scrollViewContent}>
          <Animated.View
            style={[
              styles.formContainer,
              { opacity: opacity, transform: [{ translateY: offset.y }] },
            ]}
          >
            <View style={styles.formContainer}>
              <Input
                label="E-mail"
                autoCorrect={false}
                placeholder="exemplo@exemplo.com"
                value={email}
                onChangeText={(value) => setEmail(value)}
                style={styles.input}
              />
              <InputPassword
                label="Senha"
                placeholder="*****"
                autoCorrect={false}
                value={password}
                onChangeText={(value) => {
                  setPassword(value);
                }}
                textContentType="password"
                secureTextEntry
                isPassword={true}
              />
              <InputPassword
                label="Confirmação de senha"
                placeholder="*****"
                autoCorrect={false}
                value={passwordConfirmation}
                onChangeText={(value) => {
                  setPasswordConfirmation(value);
                }}
                textContentType="password"
                secureTextEntry
                isPassword={true}
              />
              <Button onPress={handleRegistry} style={styles.button}>
                PRÓXIMO
              </Button>
            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
      <SelectionModal
        visible={isModalVisible}
        onClose={handleCloseModal}
        onSelect={handleSelectLabels}
      />
      <SimpleModal
        visible={isErrorModalVisible}
        onClose={() => setErrorModalVisible(false)}
        message={message}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.black,
  },
  scrollViewContent: {
    paddingVertical: 20,
    alignItems: "center",
  },
  formContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  input: {
    width: 320,
    marginBottom: 20,
  },
  button: {
    marginTop: 20,
    width: 250,
  },
});

export default CredentialsRegistryPage;

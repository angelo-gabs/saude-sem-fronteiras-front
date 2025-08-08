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
import AsyncStorage from "@react-native-async-storage/async-storage";
import { STORAGE_USER } from "../../constants/storage";
import { User } from "../../domain/User/user";
import { apiPost } from "../../utils/api";
import SimpleModal from "../../components/Modal";
import {
  ERROR_PATIENT_REGISTRY,
  ERROR_PHONE,
  ERROR_USER,
  FAIL_USER,
} from "../../utils/messages";

const PatientRegistryPage: React.FC = () => {
  const [isModalVisible, setModalVisible] = useState(false);
  const [isErrorModalVisible, setErrorModalVisible] = useState(false);
  const [selectedLabels, setSelectedLabels] = useState<string[]>([]);
  const [offset] = useState(new Animated.ValueXY({ x: 0, y: 95 }));
  const [opacity] = useState(new Animated.Value(0));
  const [message, setMessage] = useState("");
  const [bloodType, setBloodType] = useState("");
  const [allergies, setAllergies] = useState("");
  const [medicalCondition, setMedicalCondition] = useState("");
  const [previousSurgeries, setPreviousSurgeries] = useState("");
  const [medicines, setMedicines] = useState("");
  const [emergencyNumber, setEmergencyNumber] = useState("");
  const [userId, setUserId] = useState<number>(0);
  const [name, setName] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const handleBackPress = () => {
    router.back();
  };

  async function handlePatientRegistry() {
    try {
      setLoading(true);
      await apiPost("/Patient", {
        bloodType,
        allergies,
        medicalCondition,
        previousSurgeries,
        medicines,
        emergencyNumber,
        userId,
      });
      router.replace("/home-patient");
    } catch (err: any) {
      setMessage(ERROR_PATIENT_REGISTRY);
      setErrorModalVisible(true);
    } finally {
      setLoading(false);
    }
  }

  const handleAuxiliaryModalPress = () => {
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
  };

  const handleSelectLabels = (labels: string[]) => {
    setSelectedLabels(labels);
    console.log("Labels selecionadas:", labels);
  };

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const value = await AsyncStorage.getItem(STORAGE_USER);
        if (value) {
          const user: User = JSON.parse(value);
          setUserId(user.id);
          setName(user.name);
        } else {
          setMessage(ERROR_USER);
          setErrorModalVisible(true);
        }
      } catch (error) {
        setMessage(FAIL_USER);
        setErrorModalVisible(true);
      }
    };

    fetchUser();
  }, []);

  const validatePhone = (value: string) => {
    const cleanPhone = value.replace(/\D/g, "");
    if (cleanPhone.length < 12 || cleanPhone.length > 13) return false;
    if (!cleanPhone.startsWith("55")) return false;

    return true;
  };

  const formatPhone = (value: string) => {
    const cleanPhone = value.replace(/\D/g, "");
    if (cleanPhone.length < 12 || cleanPhone.length > 13) return value;

    if (cleanPhone.length === 13) {
      return cleanPhone.replace(
        /(\d{2})(\d{2})(\d{5})(\d{4})/,
        "($1) $2 $3-$4"
      );
    } else {
      return cleanPhone.replace(
        /(\d{2})(\d{2})(\d{4})(\d{4})/,
        "($1) $2 $3-$4"
      );
    }
  };

  const handlePhoneInput = (
    value: string,
    setTime: React.Dispatch<React.SetStateAction<string>>
  ) => {
    // Valida o telefone
    if (validatePhone(value)) {
      const formattedPhone = formatPhone(value);
      setEmergencyNumber(formattedPhone);
    } else {
      setMessage(ERROR_PHONE);
      setErrorModalVisible(true);
      setEmergencyNumber("");
    }
  };

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
        title="Cadastro do Paciente"
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
                label=""
                autoCorrect={false}
                value={name}
                onChangeText={(value) => {
                  setBloodType(value);
                }}
                style={styles.inputPrincipal}
                autoCapitalize="none"
              />
              <Input
                label="Tipo Sanguíneo"
                autoCorrect={false}
                placeholder="O+"
                value={bloodType}
                onChangeText={(value) => {
                  setBloodType(value);
                }}
                style={styles.input}
              />
              <Input
                label="Alergias"
                autoCorrect={false}
                placeholder="Abelha, Gato"
                value={allergies}
                onChangeText={(value) => {
                  setAllergies(value);
                }}
                style={styles.input}
              />
              <Input
                label="Condição Médica"
                autoCorrect={false}
                placeholder="Saudável"
                value={medicalCondition}
                onChangeText={(value) => {
                  setMedicalCondition(value);
                }}
                style={styles.input}
              />
              <Input
                label="Cirurgias Anteriores"
                autoCorrect={false}
                placeholder="Apêndice"
                value={previousSurgeries}
                onChangeText={(value) => {
                  setPreviousSurgeries(value);
                }}
                style={styles.input}
              />
              <Input
                label="Medicamentos"
                autoCorrect={false}
                placeholder="Rivotril"
                value={medicines}
                onChangeText={(value) => {
                  setMedicines(value);
                }}
                style={styles.input}
              />
              <Input
                label="Número de emergencia"
                autoCorrect={false}
                placeholder="54997020294"
                value={emergencyNumber}
                onBlur={() =>
                  handlePhoneInput(emergencyNumber, setEmergencyNumber)
                }
                onChangeText={(value) => {
                  setEmergencyNumber(value);
                }}
                style={styles.input}
              />
              <Button onPress={handlePatientRegistry} style={styles.button}>
                CADASTRAR
              </Button>
            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
      <SimpleModal
        visible={isErrorModalVisible}
        onClose={() => setErrorModalVisible(false)}
        message={message}
      />
      <SelectionModal
        visible={isModalVisible}
        onClose={handleCloseModal}
        onSelect={handleSelectLabels}
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
    paddingVertical: 20, // Adicione espaçamento vertical
    alignItems: "center", // Centraliza o conteúdo horizontalmente
  },
  formContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  input: {
    width: 320,
    marginBottom: 20,
  },
  inputPrincipal: {
    width: 320,
    height: 50,
    fontSize: 15,
    marginBottom: 20,
    backgroundColor: colors.black,
  },
  button: {
    marginTop: 20,
    width: 250,
  },
});

export default PatientRegistryPage;

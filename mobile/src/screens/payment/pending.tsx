import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { NavigationProp, useNavigation } from "@react-navigation/native";
import { RootStackParamList } from "../../../App";
import { StackNavigationProp } from "@react-navigation/stack";

const PaymentPendingScreen = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [countdown, setCountdown] = useState(15);

  // Simular uma verificação automática de status
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Atualizar status
  const checkStatus = () => {
    // Aqui você implementaria uma chamada API real para verificar o status
    // Por enquanto, apenas simulamos um redirecionamento
    navigation.navigate("PaymentSuccess" );
  };

  return (
    <View style={styles.container}>
      <View style={styles.contentContainer}>
        <View style={[styles.statusIcon, styles.pendingIcon]}>
          <ActivityIndicator size="large" color="#FFFFFF" />
        </View>
        <Text style={styles.title}>Pagamento em processamento</Text>
        <Text style={styles.description}>
          Estamos aguardando a confirmação do seu pagamento. Isso pode levar
          alguns minutos.
        </Text>

        <View style={styles.statusContainer}>
          <Text style={styles.statusText}>
            Verificando automaticamente em {countdown} segundos
          </Text>
          <ActivityIndicator
            size="small"
            color="#2196F3"
            style={styles.smallLoader}
          />
        </View>

        <TouchableOpacity
          style={styles.button}
          onPress={checkStatus}
          disabled={countdown === 0}
        >
          {countdown === 0 ? (
            <Text style={styles.buttonText}>Verificando...</Text>
          ) : (
            <Text style={styles.buttonText}>Verificar status agora</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => navigation.navigate("Home")}
        >
          <Text style={styles.secondaryButtonText}>Voltar mais tarde</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F9FC",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  contentContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 24,
    width: "100%",
    maxWidth: 400,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statusIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  pendingIcon: {
    backgroundColor: "#FF9800",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
    color: "#333333",
    textAlign: "center",
  },
  description: {
    fontSize: 16,
    color: "#666666",
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 22,
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  statusText: {
    fontSize: 14,
    color: "#666666",
    marginRight: 8,
  },
  smallLoader: {
    marginLeft: 4,
  },
  button: {
    backgroundColor: "#2196F3",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    width: "100%",
    alignItems: "center",
    marginBottom: 12,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  secondaryButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    width: "100%",
    alignItems: "center",
  },
  secondaryButtonText: {
    color: "#2196F3",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default PaymentPendingScreen;

import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { Modal, View, Text, Pressable, StyleSheet, Alert as RNAlert } from "react-native";

const COLORS = {
  background: "#FFF",
  overlay: "rgba(0,0,0,0.6)",
  title: "#111",
  message: "#757575",
  confirm: "#E53935",
  confirmText: "#FFF",
};

type AlertOptions = {
  title?: string;
  confirmText?: string;
  onConfirm?: () => void;
  cancelText?: string;
  onCancel?: () => void;
  showCancel?: boolean;
};

type AlertContextType = {
  showAlert: (message: string, options?: AlertOptions) => void;
};

const AlertContext = createContext<AlertContextType | undefined>(undefined);

// module-level global handler (registered by provider)
let globalShowAlert: ((message: string, options?: AlertOptions) => void) | null = null;

/**
 * showCustomAlert - callable outside React tree
 */
export function showCustomAlert(message: string, options?: AlertOptions) {
  if (globalShowAlert) {
    globalShowAlert(message, options);
    return;
  }

  // fallback to native alert if provider not present
  const title = options?.title || "Atenção";
  const confirmText = options?.confirmText || "OK";
  const cancelText = options?.cancelText;
  const buttons: any[] = [];

  if (options?.showCancel || cancelText) {
    buttons.push({
      text: cancelText || "Cancelar",
      onPress: options?.onCancel,
      style: "cancel" as const,
    });
  }

  buttons.push({
    text: confirmText,
    onPress: options?.onConfirm,
  });

  RNAlert.alert(title, message, buttons);
  console.warn("CustomAlertProvider não encontrado. Usando Alert nativo como fallback.", { message, options });
}

export const useCustomAlert = (): AlertContextType => {
  const context = useContext(AlertContext);
  if (!context) {
    // return wrapper that forwards to module-level showCustomAlert (safe, no crash)
    return {
      showAlert: (message: string, options?: AlertOptions) => showCustomAlert(message, options),
    };
  }
  return context;
};

export const CustomAlertProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [alert, setAlert] = useState<{
    visible: boolean;
    message: string;
    title: string;
    confirmText: string;
    cancelText?: string;
    showCancel?: boolean;
    onConfirm?: () => void;
    onCancel?: () => void;
  }>({
    visible: false,
    message: "",
    title: "Atenção",
    confirmText: "OK",
    cancelText: undefined,
    showCancel: false,
    onConfirm: undefined,
    onCancel: undefined,
  });

  const showAlert = useCallback((message: string, options?: AlertOptions) => {
    const cancelText = options?.cancelText?.trim();
    const showCancel = options?.showCancel ?? !!cancelText;
    setAlert({
      visible: true,
      message,
      title: options?.title || "Atenção",
      confirmText: options?.confirmText?.trim() || "OK",
      cancelText: cancelText,
      showCancel,
      onConfirm: options?.onConfirm,
      onCancel: options?.onCancel,
    });
  }, []);

  useEffect(() => {
    // register global handler while mounted
    globalShowAlert = showAlert;
    return () => {
      // unregister only if it's the same reference
      if (globalShowAlert === showAlert) globalShowAlert = null;
    };
  }, [showAlert]);

  const handleConfirm = () => {
    setAlert((prev) => ({ ...prev, visible: false }));
    alert.onConfirm?.();
  };

  const handleCancel = () => {
    setAlert((prev) => ({ ...prev, visible: false }));
    alert.onCancel?.();
  };

  return (
    <AlertContext.Provider value={{ showAlert }}>
      {children}
      <Modal
        visible={alert.visible}
        transparent
        animationType="none"
        onRequestClose={handleConfirm}
      >
        <View style={styles.overlay}>
          <View style={styles.container}>
            <Text style={styles.title}>{alert.title}</Text>
            <Text style={styles.message}>{alert.message}</Text>

            {alert.showCancel ? (
              <View style={styles.buttonRow}>
                <Pressable
                  style={styles.cancelButton}
                  onPress={handleCancel}
                >
                  <Text style={styles.cancelText}>{alert.cancelText || "Cancelar"}</Text>
                </Pressable>

                <Pressable
                  style={[styles.confirmButton, { flex: 1 }]}
                  onPress={handleConfirm}
                >
                  <Text style={styles.confirmText}>{alert.confirmText}</Text>
                </Pressable>
              </View>
            ) : (
              <Pressable
                style={styles.confirmButton}
                onPress={handleConfirm}
              >
                <Text style={styles.confirmText}>{alert.confirmText}</Text>
              </Pressable>
            )}
          </View>
        </View>
      </Modal>
    </AlertContext.Provider>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: COLORS.overlay,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  container: {
    backgroundColor: COLORS.background,
    borderRadius: 16,
    padding: 24,
    width: "90%",
    maxWidth: 340,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: COLORS.title,
    marginBottom: 12,
    textAlign: "center",
  },
  message: {
    fontSize: 16,
    color: COLORS.message,
    marginBottom: 24,
    textAlign: "center",
    lineHeight: 22,
  },
  buttonRow: {
    flexDirection: "row",
    width: "100%",
  },
  cancelButton: {
    backgroundColor: "#EFEFEF",
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 24,
    alignItems: "center",
    marginRight: 8,
    minWidth: 80,
    flex: 1,
  },
  cancelText: {
    color: "#111",
    fontSize: 16,
    fontWeight: "700",
  },
  confirmButton: {
    backgroundColor: COLORS.confirm,
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 24,
    alignItems: "center",
    minWidth: 80,
    width: "100%",
  },
  confirmText: {
    color: COLORS.confirmText,
    fontSize: 16,
    fontWeight: "700",
  },
});

// Componente de exemplo para demonstração
export default function App() {
  const { showAlert } = useCustomAlert();

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: 20 }}>
      <Text style={{ fontSize: 24, fontWeight: "bold", marginBottom: 32, textAlign: "center" }}>
        CustomAlert - ChamaGol
      </Text>

      <Pressable
        style={{
          backgroundColor: COLORS.red,
          padding: 16,
          borderRadius: 12,
          marginBottom: 16,
          width: "100%",
          maxWidth: 300,
        }}
        onPress={() => showAlert("Este é um alerta simples!")}
      >
        <Text style={{ color: COLORS.white, fontWeight: "bold", textAlign: "center" }}>
          Alerta Simples
        </Text>
      </Pressable>

      <Pressable
        style={{
          backgroundColor: COLORS.red,
          padding: 16,
          borderRadius: 12,
          marginBottom: 16,
          width: "100%",
          maxWidth: 300,
        }}
        onPress={() =>
          showAlert("Deseja realmente continuar com esta ação?", {
            title: "Confirmação",
            confirmText: "Sim",
            onConfirm: () => console.log("Confirmado!"),
          })
        }
      >
        <Text style={{ color: COLORS.white, fontWeight: "bold", textAlign: "center" }}>
          Alerta com Cancelar
        </Text>
      </Pressable>

      <Pressable
        style={{
          backgroundColor: COLORS.red,
          padding: 16,
          borderRadius: 12,
          width: "100%",
          maxWidth: 300,
        }}
        onPress={() =>
          showAlert("Seu perfil foi atualizado com sucesso!", {
            title: "Sucesso",
            confirmText: "Entendi",
            onConfirm: () => console.log("OK pressionado"),
          })
        }
      >
        <Text style={{ color: COLORS.white, fontWeight: "bold", textAlign: "center" }}>
          Alerta de Sucesso
        </Text>
      </Pressable>
    </View>
  );
}

// Wrapper para o exemplo funcionar
const AppWrapper = () => (
  <CustomAlertProvider>
    <App />
  </CustomAlertProvider>
);
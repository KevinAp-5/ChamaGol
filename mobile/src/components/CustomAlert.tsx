import React from "react";
import { Modal, View, Text, Pressable } from "react-native";
import { useTheme } from "../theme/theme";

interface CustomAlertProps {
  visible: boolean;
  title?: string;
  message: string;
  onClose?: () => void;
  confirmText?: string;
}

export const CustomAlert: React.FC<CustomAlertProps> = ({
  visible,
  title = "Atenção",
  message,
  onClose,
  confirmText = "OK",
}) => {
  const { colors } = useTheme();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={{
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <View style={{
          backgroundColor: colors.card,
          padding: 24,
          borderRadius: 12,
          width: '85%',
          alignItems: 'center'
        }}>
          <Text style={{ fontWeight: 'bold', fontSize: 18, marginBottom: 12, color: colors.primary }}>
            {title}
          </Text>
          <Text style={{ color: colors.muted, marginBottom: 24, textAlign: 'center', fontSize: 16 }}>
            {message}
          </Text>
          <Pressable
            style={{
              backgroundColor: colors.secondary,
              borderRadius: 8,
              paddingVertical: 12,
              paddingHorizontal: 32,
              width: '100%',
              alignItems: 'center'
            }}
            onPress={onClose}
          >
            <Text style={{ color: colors.background, fontWeight: 'bold', fontSize: 16 }}>
              {confirmText}
            </Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
};

// Helper para uso semelhante ao Alert.alert
type AlertOptions = {
  title?: string;
  message: string;
  confirmText?: string;
  onClose?: () => void;
};

let setAlertState: React.Dispatch<React.SetStateAction<AlertOptions & { visible: boolean }>>;

export const CustomAlertProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [alertState, _setAlertState] = React.useState<AlertOptions & { visible: boolean }>({
    visible: false,
    title: "",
    message: "",
    confirmText: "OK",
    onClose: undefined,
  });

  setAlertState = _setAlertState;

  return (
    <>
      {children}
      <CustomAlert
        visible={alertState.visible}
        title={alertState.title}
        message={alertState.message}
        confirmText={alertState.confirmText}
        onClose={() => {
          _setAlertState((prev) => ({ ...prev, visible: false }));
          alertState.onClose && alertState.onClose();
        }}
      />
    </>
  );
};

// Use este método para substituir Alert.alert
export function showCustomAlert(
  message: string,
  title?: string,
  onClose?: () => void,
  confirmText?: string
) {
  if (setAlertState) {
    setAlertState({
      visible: true,
      title: title || "Atenção",
      message,
      confirmText: confirmText || "OK",
      onClose,
    });
  }
}
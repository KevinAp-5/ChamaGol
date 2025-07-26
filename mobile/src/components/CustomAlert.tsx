import React from "react";
import { Modal, View, Text, Pressable } from "react-native";
import { useTheme } from "../theme/theme";

interface CustomAlertProps {
  visible: boolean;
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  showCancel?: boolean;
}

export const CustomAlert: React.FC<CustomAlertProps> = ({
  visible,
  title = "Atenção",
  message,
  confirmText = "OK",
  cancelText = "Cancelar",
  onConfirm,
  onCancel,
  showCancel = false,
}) => {
  const { colors } = useTheme();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel || onConfirm}
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
          <View style={{ flexDirection: showCancel ? 'row' : 'column', width: '100%', gap: 12 }}>
            {showCancel && (
              <Pressable
                style={{
                  backgroundColor: colors.error || "#E53935",
                  borderRadius: 8,
                  paddingVertical: 12,
                  paddingHorizontal: 24,
                  flex: 1,
                  alignItems: 'center'
                }}
                onPress={onCancel}
              >
                <Text style={{ color: colors.background, fontWeight: 'bold', fontSize: 16 }}>
                  {cancelText}
                </Text>
              </Pressable>
            )}
            <Pressable
              style={{
                backgroundColor: colors.secondary,
                borderRadius: 8,
                paddingVertical: 12,
                paddingHorizontal: 24,
                flex: 1,
                alignItems: 'center'
              }}
              onPress={onConfirm}
            >
              <Text style={{ color: colors.background, fontWeight: 'bold', fontSize: 16 }}>
                {confirmText}
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
};

type AlertOptions = {
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  showCancel?: boolean;
};

let setAlertState: React.Dispatch<React.SetStateAction<AlertOptions & { visible: boolean }>>;

export const CustomAlertProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [alertState, _setAlertState] = React.useState<AlertOptions & { visible: boolean }>({
    visible: false,
    title: "",
    message: "",
    confirmText: "OK",
    cancelText: "Cancelar",
    onConfirm: undefined,
    onCancel: undefined,
    showCancel: false,
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
        cancelText={alertState.cancelText}
        onConfirm={() => {
          _setAlertState((prev) => ({ ...prev, visible: false }));
          alertState.onConfirm && alertState.onConfirm();
        }}
        onCancel={() => {
          _setAlertState((prev) => ({ ...prev, visible: false }));
          alertState.onCancel && alertState.onCancel();
        }}
        showCancel={alertState.showCancel}
      />
    </>
  );
};

// Exemplo de uso para alerta simples ou sim/não
export function showCustomAlert(
  message: string,
  options?: {
    title?: string;
    confirmText?: string;
    cancelText?: string;
    onConfirm?: () => void;
    onCancel?: () => void;
    showCancel?: boolean;
  }
) {
  if (setAlertState) {
    setAlertState({
      visible: true,
      title: options?.title || "Atenção",
      message,
      confirmText: options?.confirmText || "OK",
      cancelText: options?.cancelText || "Cancelar",
      onConfirm: options?.onConfirm,
      onCancel: options?.onCancel,
      showCancel: !!options?.showCancel,
    });
  }
}
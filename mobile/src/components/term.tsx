import React, { useState } from "react";
import { Modal, View, Text, Pressable, ActivityIndicator, ScrollView } from "react-native";
import * as SecureStore from "expo-secure-store";
import { api } from "../config/Api";
import { useTheme } from "../theme/theme";
import { showCustomAlert } from "./CustomAlert";

interface TermModalProps {
  visible: boolean;
  onAccepted: () => void;
}

export const TermModal: React.FC<TermModalProps> = ({ visible, onAccepted }) => {
  const { colors } = useTheme();
  const [accepting, setAccepting] = useState(false);
  const [showTerm, setShowTerm] = useState(false);
  const [termContent, setTermContent] = useState<string | null>(null);
  const [loadingTerm, setLoadingTerm] = useState(false);

  const acceptLatestTerm = async () => {
    setAccepting(true);
    try {
      const token = await SecureStore.getItemAsync("accessToken");
      const response = await api(
        "POST",
        "acceptance/accept-latest",
        { isAdult: true },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.status === 200) {
        onAccepted();
      } else {
        showCustomAlert("Erro ao aceitar os termos.", "Erro");
      }
    } catch (error: any) {
      showCustomAlert("Erro ao aceitar os termos.", "Erro");
    } finally {
      setAccepting(false);
    }
  };

  const fetchTerm = async () => {
    setLoadingTerm(true);
    try {
      const response = await api("GET", "terms/latest");
      if (response.status === 200 && response.data?.content) {
        setTermContent(response.data.content);
        setShowTerm(true);
      } else {
        showCustomAlert("Não foi possível carregar o termo de uso.", "Erro");
      }
    } catch (error: any) {
      showCustomAlert("Não foi possível carregar o termo de uso.", "Erro");
    } finally {
      setLoadingTerm(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={() => {}}
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
          width: '90%',
          alignItems: 'center',
          maxHeight: '85%',
        }}>
          <Text style={{ fontWeight: 'bold', fontSize: 18, marginBottom: 12, color: colors.primary }}>
            Aceite dos Termos de Uso
          </Text>
          <Text style={{ color: colors.muted, marginBottom: 16, textAlign: 'center' }}>
            Para continuar, é necessário aceitar os <Text
              style={{ fontWeight: 'bold', color: colors.secondary, textDecorationLine: 'underline' }}
              onPress={fetchTerm}
            >
              Termos de Uso
            </Text> do CHAMAGOL.
            {loadingTerm && <ActivityIndicator size="small" color={colors.secondary} style={{ marginLeft: 8 }} />}
          </Text>
          <Pressable
            style={{
              backgroundColor: colors.secondary,
              borderRadius: 8,
              paddingVertical: 12,
              paddingHorizontal: 32,
              marginBottom: 8,
              width: '100%',
              alignItems: 'center'
            }}
            onPress={acceptLatestTerm}
            disabled={accepting}
          >
            {accepting ? (
              <ActivityIndicator color={colors.background} />
            ) : (
              <Text style={{ color: colors.background, fontWeight: 'bold', fontSize: 16 }}>
                Aceitar Termos de Uso
              </Text>
            )}
          </Pressable>
          {/* Modal interno para exibir o termo */}
          <Modal
            visible={showTerm}
            transparent
            animationType="fade"
            onRequestClose={() => setShowTerm(false)}
          >
            <View style={{
              flex: 1,
              backgroundColor: 'rgba(0,0,0,0.6)',
              justifyContent: 'center',
              alignItems: 'center'
            }}>
              <View style={{
                backgroundColor: colors.card,
                padding: 20,
                borderRadius: 12,
                width: '92%',
                maxHeight: '85%',
              }}>
                <ScrollView>
                  <Text style={{ color: colors.primary, fontSize: 16, marginBottom: 16 }}>
                    {termContent}
                  </Text>
                </ScrollView>
                <Pressable
                  style={{
                    backgroundColor: colors.secondary,
                    borderRadius: 8,
                    paddingVertical: 10,
                    paddingHorizontal: 24,
                    alignSelf: 'center',
                    marginTop: 12,
                  }}
                  onPress={() => setShowTerm(false)}
                >
                  <Text style={{ color: colors.background, fontWeight: 'bold', fontSize: 15 }}>
                    Fechar
                  </Text>
                </Pressable>
              </View>
            </View>
          </Modal>
        </View>
      </View>
    </Modal>
  );
};
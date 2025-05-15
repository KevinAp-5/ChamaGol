import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, ActivityIndicator, Alert } from 'react-native';
import { useTheme } from '../theme/theme';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import api from '../config/Api';

type Props = NativeStackScreenProps<RootStackParamList, 'ProSubscription'>;

export default function ProSubscriptionScreen({ navigation }: Props) {
  const { colors } = useTheme();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const benefits = [
    { icon: 'star', title: 'Sinais Exclusivos PRO', description: 'Acesse sinais premium antes de todos' },
    { icon: 'bell-ring', title: 'Notificações Prioritárias', description: 'Seja o primeiro a receber os melhores sinais' },
    { icon: 'chart-line', title: 'Taxa de Assertividade Superior', description: 'Sinais com maior probabilidade de sucesso' },
  ];

  // Configuração do esquema do deep link da sua app (deve bater com app.json)
  const scheme = Linking.createURL('/');

  useEffect(() => {
    // Listener para deep links que retornam do checkout Mercado Pago
    const subscription = Linking.addEventListener('url', handleDeepLink);
    return () => subscription.remove();
  }, []);

  const handleDeepLink = (event: { url: string }) => {
    const url = event.url;
    // Aqui você pode analisar a url para detectar sucesso, falha ou pendente
    if (url.includes('success')) {
      Alert.alert('Pagamento aprovado', 'Obrigado pela sua assinatura!');
    } else if (url.includes('failure')) {
      Alert.alert('Pagamento falhou', 'Por favor, tente novamente.');
    } else if (url.includes('pending')) {
      Alert.alert('Pagamento pendente', 'Seu pagamento está pendente.');
    }
  };

  const handleSubscription = async () => {
    setIsLoading(true);
    setError('');
    try {
      // 1. Solicita o preferenceId ao backend
      const response = await api.post('payment/create');
      if (response.status !== 200) throw new Error('Erro ao criar assinatura');

      const preferenceId = response.data;

      // 2. Monta a URL do checkout Mercado Pago com back_urls configurados para deep links da app
      // Exemplo: myapp://payment/success, myapp://payment/failure, myapp://payment/pending
      // Essas URLs devem estar configuradas no backend na criação da preferência
      const checkoutUrl = `https://www.mercadopago.com.br/checkout/v1/redirect?pref_id=${preferenceId}`;

      // 3. Abre o navegador nativo integrado (Custom Tabs / Safari View Controller)
      const result = await WebBrowser.openBrowserAsync(checkoutUrl);

      // Opcional: você pode tratar o resultado do browser aqui se quiser
      // console.log('WebBrowser result:', result);

    } catch (err) {
      setError('Erro ao processar pagamento. Tente novamente.');
      console.error('Erro no pagamento:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Image source={require('../assets/logo.png')} style={styles.logo} />
          <View>
            <Text style={{ fontWeight: 'bold', color: colors.secondary, fontSize: 60 }}>SEJA PRO</Text>
          </View>
        </View>

        <View style={[styles.heroSection, { backgroundColor: colors.card }]}>
          <Text style={[styles.heroText, { color: colors.primary }]}>Eleve seu jogo ao próximo nível</Text>
          <Text style={[styles.heroSubtext, { color: colors.muted }]}>
            Tenha acesso a sinais exclusivos e aumente suas chances de sucesso
          </Text>
        </View>

        <View style={styles.benefitsContainer}>
          {benefits.map((benefit, index) => (
            <View key={index} style={[styles.benefitCard, { backgroundColor: colors.card }]}>
              <MaterialCommunityIcons name={benefit.icon as any} size={32} color={colors.accent} />
              <Text style={[styles.benefitTitle, { color: colors.primary }]}>{benefit.title}</Text>
              <Text style={[styles.benefitDescription, { color: colors.muted }]}>{benefit.description}</Text>
            </View>
          ))}
        </View>

        <View style={[styles.pricingCard, { backgroundColor: colors.card }]}>
          <Text style={[styles.pricingTitle, { color: colors.primary }]}>Oferta Especial</Text>
          <View style={styles.priceContainer}>
            <Text style={[styles.currency, { color: colors.accent }]}>R$</Text>
            <Text style={[styles.price, { color: colors.accent }]}>10</Text>
            <Text style={[styles.period, { color: colors.muted }]}>/mês</Text>
          </View>
          <TouchableOpacity
            style={[styles.subscribeButton, { backgroundColor: colors.accent }]}
            onPress={handleSubscription}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color={colors.card} />
            ) : (
              <Text style={[styles.buttonText, { color: colors.card }]}>ASSINAR AGORA</Text>
            )}
          </TouchableOpacity>
        </View>

        {error ? (
          <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
        ) : null}

        <Text style={[styles.guarantee, { color: colors.muted }]}>
          7 dias de garantia de satisfação ou seu dinheiro de volta
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logo: {
    width: 120,
    height: 120,
    resizeMode: 'contain',
    marginBottom: 16,
  },
  heroSection: {
    padding: 20,
    borderRadius: 12,
    marginBottom: 24,
    elevation: 2,
  },
  heroText: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  heroSubtext: {
    fontSize: 16,
    textAlign: 'center',
  },
  benefitsContainer: {
    marginBottom: 24,
  },
  benefitCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
    flexDirection: 'row',
    alignItems: 'center',
  },
  benefitTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 12,
    flex: 1,
  },
  benefitDescription: {
    fontSize: 14,
    marginLeft: 12,
    flex: 2,
  },
  pricingCard: {
    padding: 24,
    borderRadius: 12,
    marginBottom: 16,
    elevation: 4,
    alignItems: 'center',
  },
  pricingTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 24,
  },
  currency: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  price: {
    fontSize: 48,
    fontWeight: 'bold',
    marginHorizontal: 4,
  },
  period: {
    fontSize: 16,
  },
  subscribeButton: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 8,
    width: '100%',
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  guarantee: {
    textAlign: 'center',
    fontSize: 14,
    marginBottom: 24,
  },
  errorText: {
    textAlign: 'center',
    marginTop: 8,
    fontSize: 14,
    marginBottom: 16,
  },
});

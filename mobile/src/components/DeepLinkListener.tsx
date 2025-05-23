import React, { useEffect } from 'react';
import { Alert } from 'react-native';
import * as Linking from 'expo-linking';

interface DeepLinkListenerProps {
  navigation?: any; // Opcional: para navegar para outras telas após processar o deep link
}

export default function DeepLinkListener({ navigation }: DeepLinkListenerProps) {
  const handleDeepLink = (event: { url: string }) => {
    const url = event.url;
    console.log('Deep link recebido:', url);
   
    // TODO: remover os alerts
    // Parse da URL para extrair path e parâmetros
    const { path, queryParams } = Linking.parse(url);
    console.log('Path:', path, 'Params:', queryParams);
    
    // Tratamento das URLs de retorno de pagamento
    if (url.includes('payment/success')) {
      Alert.alert('Pagamento aprovado', 'Obrigado pela sua assinatura!');
      // Opcionalmente: navegar para uma tela de sucesso
      if (navigation) {
        navigation.navigate('PaymentSuccess', { ...queryParams });
      }
    } else if (url.includes('payment/failure')) {
      Alert.alert('Pagamento falhou', 'Por favor, tente novamente.');
      // Opcionalmente: navegar para uma tela de falha
      if (navigation) {
        navigation.navigate('PaymentFailure', { ...queryParams });
      }
    } else if (url.includes('payment/pending')) {
      Alert.alert('Pagamento pendente', 'Seu pagamento está em análise.');
      // Opcionalmente: navegar para uma tela de pendente
      if (navigation) {
        navigation.navigate('PaymentPending', { ...queryParams });
      }
    } else {
      console.log('Deep link não reconhecido');
    }
  };

  useEffect(() => {
    // Adiciona o listener para deep links (quando o app já está aberto)
    const subscription = Linking.addEventListener('url', handleDeepLink);

    // Verifica se o app foi aberto via deep link (cold start)
    const getInitialUrl = async () => {
      const initialUrl = await Linking.getInitialURL();
      if (initialUrl) {
        handleDeepLink({ url: initialUrl });
      }
    };

    getInitialUrl();

    // Remove o listener quando o componente desmontar
    return () => {
      subscription.remove();
    };
  }, []);

  // Este componente não renderiza nada visualmente
  return null;
}
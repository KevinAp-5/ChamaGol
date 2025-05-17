import React, { useEffect } from 'react';
import { Alert } from 'react-native';
import * as Linking from 'expo-linking';

export default function DeepLinkListener() {

  // Função que trata o deep link recebido
  const handleDeepLink = (event: { url: string }) => {
    const url = event.url;
    console.log('Deep link recebido:', url);

    if (url.includes('payment/success')) {
      Alert.alert('Pagamento aprovado', 'Obrigado pela sua assinatura!');
    } else if (url.includes('payment/failure')) {
      Alert.alert('Pagamento falhou', 'Por favor, tente novamente.');
    } else if (url.includes('payment/pending')) {
      Alert.alert('Pagamento pendente', 'Seu pagamento está em análise.');
    } else {
      console.log('Deep link não reconhecido');
    }
  };

  useEffect(() => {
    // Adiciona o listener para deep links
    const subscription = Linking.addEventListener('url', handleDeepLink);

    // Também verifica se o app foi aberto via deep link (cold start)
    (async () => {
      const initialUrl = await Linking.getInitialURL();
      if (initialUrl) {
        handleDeepLink({ url: initialUrl });
      }
    })();

    // Remove o listener quando o componente desmontar
    return () => {
      subscription.remove();
    };
  }, []);

  return null; // Componente só escuta deep links, não renderiza nada
}

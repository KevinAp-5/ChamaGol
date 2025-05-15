import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { WebView } from 'react-native-webview';

type MercadoPagoCheckoutProps = {
  preferenceId: string;
  publicKey: string;
  onPaymentSuccess: () => void;
  onPaymentFailure: () => void;
  onPaymentPending: () => void;
};

export default function MercadoPagoCheckout({
  preferenceId,
  publicKey,
  onPaymentSuccess,
  onPaymentFailure,
  onPaymentPending,
}: MercadoPagoCheckoutProps) {
  const [loading, setLoading] = useState(true);

  // HTML que será carregado na WebView com o SDK Mercado Pago e botão wallet
  const htmlContent = `
    <!DOCTYPE html>
    <html lang="pt-br">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Mercado Pago Checkout</title>
      <script src="https://sdk.mercadopago.com/js/v2"></script>
      <style>
        body, html {
          margin: 0; padding: 0; height: 100%; display: flex; justify-content: center; align-items: center;
          background-color: #f5f5f5;
        }
        #wallet_container {
          width: 300px;
        }
      </style>
    </head>
    <body>
      <div id="wallet_container"></div>
      <script>
        const mp = new MercadoPago('${publicKey}', {locale: 'pt-BR'});
        mp.bricks().create('wallet', 'wallet_container', {
          initialization: {
            preferenceId: '${preferenceId}'
          },
          callbacks: {
            onReady: () => {
              window.ReactNativeWebView.postMessage('ready');
            },
            onError: (error) => {
              window.ReactNativeWebView.postMessage('error:' + JSON.stringify(error));
            },
            onSubmit: () => {
              window.ReactNativeWebView.postMessage('submit');
            },
            onPaymentApproved: () => {
              window.ReactNativeWebView.postMessage('approved');
            },
            onPaymentFailure: () => {
              window.ReactNativeWebView.postMessage('failure');
            },
            onPaymentPending: () => {
              window.ReactNativeWebView.postMessage('pending');
            }
          }
        });
      </script>
    </body>
    </html>
  `;

  // Handler para mensagens vindas da WebView
  const onMessage = (event: any) => {
    const message = event.nativeEvent.data;
    if (message === 'ready') {
      setLoading(false);
    } else if (message.startsWith('error:')) {
      console.error('Erro Mercado Pago:', message);
      onPaymentFailure();
    } else if (message === 'approved') {
      onPaymentSuccess();
    } else if (message === 'failure') {
      onPaymentFailure();
    } else if (message === 'pending') {
      onPaymentPending();
    }
  };

  return (
    <View style={{ flex: 1 }}>
      {loading && (
        <View style={styles.loading}>
          <ActivityIndicator size="large" color="#3483fa" />
        </View>
      )}
      <WebView
        originWhitelist={['*']}
        source={{ html: htmlContent }}
        onMessage={onMessage}
        javaScriptEnabled
        domStorageEnabled
        style={{ flex: 1 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  loading: {
    position: 'absolute',
    top: 0, bottom: 0, left: 0, right: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    zIndex: 10,
  }
});

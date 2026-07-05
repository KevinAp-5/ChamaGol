package com.usermanager.manager.dto.payment;

import com.mercadopago.client.preference.PreferenceClient;
import com.mercadopago.client.preference.PreferenceRequest;

public record PreferenceDataRequest(PreferenceClient client, PreferenceRequest request) {

}

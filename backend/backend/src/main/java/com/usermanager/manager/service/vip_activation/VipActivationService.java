package com.usermanager.manager.service.vip_activation;

import org.springframework.stereotype.Service;

import com.usermanager.manager.model.VipActivation.VipActivation;
import com.usermanager.manager.model.user.User;

@Service
public interface VipActivationService {

    VipActivation createVipActivation(User user);

    VipActivation nextVipActivation();

}

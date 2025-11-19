package com.usermanager.manager.service.vip_activation.impl;

import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.usermanager.manager.enums.Subscription;
import com.usermanager.manager.model.VipActivation.VipActivation;
import com.usermanager.manager.model.sale.Sale;
import com.usermanager.manager.model.user.User;
import com.usermanager.manager.repository.VipActivationRepository;
import com.usermanager.manager.service.sale.SaleService;
import com.usermanager.manager.service.subscription.SubscriptionService;
import com.usermanager.manager.service.user.UserService;
import com.usermanager.manager.service.vip_activation.VipActivationService;

@Service
public class VipActivationImpl implements VipActivationService {

    private VipActivationRepository vipActivationRepository;
    private UserService userService;
    private SaleService saleService;
    private SubscriptionService subscriptionService;

    public VipActivationImpl(VipActivationRepository vipActivationRepository, UserService userService,
            SaleService saleService, SubscriptionService subscriptionService) {
        this.vipActivationRepository = vipActivationRepository;
        this.userService = userService;
        this.saleService = saleService;
        this.subscriptionService = subscriptionService;
    }

    @Override
    @Transactional
    public VipActivation createVipActivation(User user) {
        Optional<Sale> sale = saleService.getActiveSale();
        VipActivation vipActivation = VipActivation.builder()
                .userId(user)
                .saleId(sale.orElse(null))
                .build();

        return vipActivationRepository.save(vipActivation);
    }

    @Transactional
    public List<VipActivation> nextVipActivation() {
        List<VipActivation> vipActivationList = vipActivationRepository.findAllByProcessedFalseOrderByCreationDateAsc();
        if (vipActivationList.isEmpty()) {
            return vipActivationList;
        }

        for (VipActivation vipActivation: vipActivationList) {
            User user = vipActivation.getUserId();
            Sale sale = vipActivation.getSaleId();
    
            user.setSubscription(Subscription.VIP);
            user.setUpdatedAt(ZonedDateTime.now(ZoneId.of("America/Sao_Paulo")));
            if (sale != null)
                saleService.useSale();
    
            Integer subscriptionTime = (sale != null) ? sale.getUserSubscriptionTime() : 30;
            createSubscriptionControl(user, subscriptionTime);
            userService.save(user);
    
            vipActivation.setProcessed(true);
        }

        return vipActivationRepository.saveAll(vipActivationList);
    }

    @Transactional
    private void createSubscriptionControl(User user, Integer subscriptionDays) {
        subscriptionService.createSubscriptionControl(user, subscriptionDays.intValue());
    }
}

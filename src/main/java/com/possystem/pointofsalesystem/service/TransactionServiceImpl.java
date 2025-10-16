package com.possystem.pointofsalesystem.service;

import com.possystem.pointofsalesystem.model.Sale;
import com.possystem.pointofsalesystem.model.PaymentInfo;
import org.springframework.stereotype.Service;

@Service
public class TransactionServiceImpl implements TransactionService {

    @Override
    public Sale startNewSale() {
        Sale sale = new Sale();
        sale.setId(java.util.UUID.randomUUID().toString());
        sale.setTotalAmount(0.0);
        sale.setStatus("PENDING");
        return sale;
    }

    @Override
    public Sale addItemToCart(String productId, int quantity) {
        Sale sale = startNewSale();
        sale.setTotalAmount(sale.getTotalAmount() + 10.0 * quantity);
        return sale;
    }

    @Override
    public Sale processCheckout(PaymentInfo payment) {
        Sale sale = startNewSale();
        sale.setStatus("COMPLETED");
        return sale;
    }
}
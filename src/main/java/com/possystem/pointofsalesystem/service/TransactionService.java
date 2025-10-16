package com.possystem.pointofsalesystem.service;


import com.possystem.pointofsalesystem.model.Sale;
import com.possystem.pointofsalesystem.model.PaymentInfo;

// 🛑 FIX: Added the missing 'interface' keyword.
public interface TransactionService {
    // FIX: Method parameters were also corrected from previous attempts.

    Sale startNewSale();

    // NOTE: The name 'productId' must match what is used in the implementation
    Sale addItemToCart(String productId, int quantity);

    Sale processCheckout(PaymentInfo payment);
}

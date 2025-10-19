package com.possystem.pointofsalesystem.controller;

import com.possystem.pointofsalesystem.model.Sale;
import com.possystem.pointofsalesystem.model.PaymentInfo;
import com.possystem.pointofsalesystem.service.TransactionService;
import org.springframework.stereotype.Controller;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@Controller
@RequestMapping("/Point_Of_Sale")
public class POSController {

    private final TransactionService transactionService;

    @Autowired
    public POSController(TransactionService transactionService) {
        this.transactionService = transactionService;
    }

    @GetMapping("/Home")
    public String serveIndex() {
        return "index";
    }

    @PostMapping("/add-to-cart")
    @ResponseBody
    public Sale addToCart(@RequestParam String productId, @RequestParam int quantity) {
        return transactionService.addItemToCart(productId, quantity);
    }

    @PostMapping("/checkout")
    @ResponseBody
    public Sale finalizeSale(@RequestBody PaymentInfo payment) {
        return transactionService.processCheckout(payment);
    }
}
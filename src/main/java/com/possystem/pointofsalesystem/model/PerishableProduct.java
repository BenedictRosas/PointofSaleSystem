package com.possystem.pointofsalesystem.model;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "perishable_products")
@PrimaryKeyJoinColumn(name = "product_id")
public class PerishableProduct extends Product {

    @JsonFormat(pattern = "yyyy-MM-dd") // Use this for incoming JSON
    private LocalDate expiryDate;

    // ...
    // Default no-arg constructor is necessary for JPA
    public PerishableProduct() {
        super();
        this.setIsPerishable(true);
    }

    // Optional constructor for setting fields without the ID
    public PerishableProduct(String name, BigDecimal price, Integer quantity, LocalDate expiryDate) {
        super();
        this.setName(name);
        this.setPrice(price);
        this.setQuantity(quantity);
        this.expiryDate = expiryDate;
        this.setIsPerishable(true);
    }

    // --- Getters and Setters for Expiry Date ---

    public LocalDate getExpiryDate() {
        return expiryDate;
    }

    public void setExpiryDate(LocalDate expiryDate) {
        this.expiryDate = expiryDate;
    }
}
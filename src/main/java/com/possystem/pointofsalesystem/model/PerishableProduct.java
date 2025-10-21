 package com.possystem.pointofsalesystem.model;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.LocalDate;


import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.persistence.*;
// ... other imports

@Entity
@DiscriminatorValue("1") // <-- THIS IS REQUIRED (is_perishable = 1)
@Table(name = "perishable_products")
@PrimaryKeyJoinColumn(name = "product_id") // Correctly joins the PK
public class PerishableProduct extends Product {

    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate expiryDate;

    // ... rest of the code

    // Default no-arg constructor is necessary for JPA
    public PerishableProduct() {
        super();
        // REMOVE: this.setIsPerishable(true);
    }

    // Optional constructor for setting fields without the ID
    public PerishableProduct(String name, BigDecimal price, Integer quantity, LocalDate expiryDate) {
        super();
        this.setName(name);
        this.setPrice(price);
        this.setQuantity(quantity);
        this.expiryDate = expiryDate;
        // REMOVE: this.setIsPerishable(true);
    }

    // --- Getters and Setters for Expiry Date ---

    public LocalDate getExpiryDate() {
        return expiryDate;
    }

    public void setExpiryDate(LocalDate expiryDate) {
        this.expiryDate = expiryDate;
    }
}
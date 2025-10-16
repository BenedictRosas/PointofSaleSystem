package com.possystem.pointofsalesystem.model;

import jakarta.persistence.Entity;

@Entity
public class PerishableProduct extends Product {

    private String expiryDate;

    public PerishableProduct() {
        super();
    }

    public PerishableProduct(String id, String name, double price, String expiryDate) {
        super(id, name, price);
        this.expiryDate = expiryDate;
    }

    // --- Getters and Setters ---
    public String getExpiryDate() { return expiryDate; }
    public void setExpiryDate(String expiryDate) { this.expiryDate = expiryDate; }
}
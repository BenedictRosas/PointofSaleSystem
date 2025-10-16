package com.possystem.pointofsalesystem.model;


import jakarta.persistence.Entity;
import jakarta.persistence.Id;

@Entity
public class Sale {
    @Id
    private String id;
    private double totalAmount;
    private String status;

    public Sale() {}

    // Add necessary getters and setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public double getTotalAmount() { return totalAmount; }
    public void setTotalAmount(double totalAmount) { this.totalAmount = totalAmount; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}

package com.possystem.pointofsalesystem.model;

import jakarta.persistence.Entity;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Inheritance;
import jakarta.persistence.InheritanceType;
import jakarta.persistence.Table;
import java.math.BigDecimal;



@Entity
@Table(name = "products")
@Inheritance(strategy = InheritanceType.JOINED)
public class Product {

    // FIX 1: ID is Long and configured for MySQL AUTO_INCREMENT
    @Id
    @jakarta.persistence.GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private BigDecimal price; // Using BigDecimal for price

    // FIX 2: Added fields required by your database and service layer
    private Integer quantity;
    private Boolean isPerishable;

    public Product() {}

    // --- Getters and Setters (All corrected to match field types) ---

    // ID (Now Long)
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    // Name
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    // Price
    public BigDecimal getPrice() { return price; }
    public void setPrice(BigDecimal price) { this.price = price; }

    // Quantity (FIXED the missing method issue)
    public Integer getQuantity() { return quantity; }
    public void setQuantity(Integer quantity) { this.quantity = quantity; }

    // isPerishable (FIXED the missing method issue)
    public Boolean getIsPerishable() { return isPerishable; }
    public void setIsPerishable(Boolean isPerishable) { this.isPerishable = isPerishable; }
}
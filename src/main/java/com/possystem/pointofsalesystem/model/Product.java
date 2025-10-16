package com.possystem.pointofsalesystem.model;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Inheritance;
import jakarta.persistence.InheritanceType;

@Entity
@Inheritance(strategy = InheritanceType.SINGLE_TABLE)
public class Product implements Manageable {

    @Id
    private String id;
    private String name;
    private double price;

    public Product() {}

    public Product(String id, String name, double price) {
        this.id = id;
        this.name = name;
        this.price = price;
    }

    // --- Getters and Setters ---
    @Override
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    @Override
    public String getName() { return name; }
    @Override
    public void setName(String name) { this.name = name; }
    public double getPrice() { return price; }
    public void setPrice(double price) { this.price = price; }
}
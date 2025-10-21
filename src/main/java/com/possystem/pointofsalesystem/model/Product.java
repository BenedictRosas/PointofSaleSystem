package com.possystem.pointofsalesystem.model;
import jakarta.persistence.*;
import java.math.BigDecimal;


@Entity
@Table(name = "products")
@Inheritance(strategy = InheritanceType.JOINED)
@DiscriminatorColumn( // <--- REQUIRED
        name = "is_perishable",
        discriminatorType = DiscriminatorType.INTEGER)
@DiscriminatorValue("0") // <--- REQUIRED: Value for standard products (is_perishable = 0)
public class Product {
    @Id
    @Column(name = "product_id") // Correct column name mapping
    private Long id;
    private String name;
    private BigDecimal price;
    private Integer quantity;

// Map the is_perishable field to the discriminator column

    @Column(name = "is_perishable", insertable = false, updatable = false)

    private Boolean isPerishable; // Hibernate manages this field

    public Product() {}

// --- Getters and Setters (All corrected to match field types) --

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
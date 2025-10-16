package com.possystem.pointofsalesystem.service;

import com.possystem.pointofsalesystem.model.Product;
import java.util.List;
import java.util.Optional;

public interface Inventory {
    List<Product> getAllProducts();
    Optional<Product> getProductById(String id);
    void addProduct(Product product);
    boolean updateProduct(String id, Product productDetails);
    boolean deleteProduct(String id);
    List<Product> searchProducts(String searchTerm);
}
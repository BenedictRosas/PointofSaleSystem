package com.possystem.pointofsalesystem.repository;

import com.possystem.pointofsalesystem.model.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

// FIX: ID type is Long
public interface ProductRepository extends JpaRepository<Product, Long> {

    // FIX: Added the missing method declaration for search functionality
    List<Product> findByNameContainingIgnoreCase(String name);
}
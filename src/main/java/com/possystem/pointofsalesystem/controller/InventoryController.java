package com.possystem.pointofsalesystem.controller;

import com.possystem.pointofsalesystem.model.Product;
import com.possystem.pointofsalesystem.model.PerishableProduct;
import com.possystem.pointofsalesystem.service.Inventory;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/products")
public class InventoryController {

    private final Inventory inventoryService;

    @Autowired
    public InventoryController(Inventory inventoryService) {
        this.inventoryService = inventoryService;
    }

    @GetMapping
    public List<Product> getAllProducts(@RequestParam(required = false) String search) {
        if (search != null && !search.trim().isEmpty()) {
            return inventoryService.searchProducts(search);
        }
        return inventoryService.getAllProducts();
    }

    @PostMapping("/add")
    public ResponseEntity<String> addProduct(@RequestBody Product product) {
        inventoryService.addProduct(product);
        return ResponseEntity.ok("Standard product added successfully.");
    }

    @PostMapping("/add-perishable")
    public ResponseEntity<String> addPerishableProduct(@RequestBody PerishableProduct perishableProduct) {
        inventoryService.addProduct(perishableProduct);
        return ResponseEntity.ok("Perishable product added successfully.");
    }

    @PutMapping("/{id}")
    public ResponseEntity<String> updateProduct(@PathVariable String id, @RequestBody Product productDetails) {
        boolean updated = inventoryService.updateProduct(id, productDetails);
        if (updated) {
            return ResponseEntity.ok("Product updated successfully.");
        }
        return ResponseEntity.notFound().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteProduct(@PathVariable String id) {
        boolean deleted = inventoryService.deleteProduct(id);
        if (deleted) {
            return ResponseEntity.ok("Product deleted successfully.");
        }
        return ResponseEntity.notFound().build();
    }
}
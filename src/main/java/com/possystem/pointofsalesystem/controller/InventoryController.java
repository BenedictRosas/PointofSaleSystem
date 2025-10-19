package com.possystem.pointofsalesystem.controller;

import com.possystem.pointofsalesystem.model.Product;
import com.possystem.pointofsalesystem.model.PerishableProduct;
import com.possystem.pointofsalesystem.service.Inventory;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller; // FIX 1: Changed from @RestController to @Controller
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Controller // The class must be @Controller to return redirects (like for perishable product)
@RequestMapping("/products")
public class InventoryController {

    private final Inventory inventoryService;

    @Autowired
    public InventoryController(Inventory inventoryService) {
        this.inventoryService = inventoryService;
    }

    // This method returns JSON, so it needs @ResponseBody
    @GetMapping
    @ResponseBody
    public List<Product> getAllProducts(@RequestParam(required = false) String search) {
        if (search != null && !search.trim().isEmpty()) {
            return inventoryService.searchProducts(search);
        }
        return inventoryService.getAllProducts();
    }

    // Standard Product (AJAX/JSON submission)
    @PostMapping("/add")
    @ResponseBody // FIX 2: Ensures this AJAX method returns JSON body
    public ResponseEntity<String> addProduct(@RequestBody Product product) {
        inventoryService.addProduct(product);
        return ResponseEntity.ok("Standard product added successfully.");
    }

    @PostMapping("/add-perishable")
    @ResponseBody
    public PerishableProduct addPerishableProduct(@RequestBody PerishableProduct perishableProduct) {

        inventoryService.addProduct(perishableProduct);


        return perishableProduct;
    }

    // This method returns JSON, so it needs @ResponseBody
    @PutMapping("/{id}")
    @ResponseBody
    public ResponseEntity<String> updateProduct(@PathVariable String id, @RequestBody Product productDetails) {
        boolean updated = inventoryService.updateProduct(id, productDetails);
        if (updated) {
            return ResponseEntity.ok("Product updated successfully.");
        }
        return ResponseEntity.notFound().build();
    }

    // This method returns JSON, so it needs @ResponseBody
    @DeleteMapping("/{id}")
    @ResponseBody
    public ResponseEntity<String> deleteProduct(@PathVariable String id) {
        boolean deleted = inventoryService.deleteProduct(id);
        if (deleted) {
            return ResponseEntity.ok("Product deleted successfully.");
        }
        return ResponseEntity.notFound().build();
    }
}
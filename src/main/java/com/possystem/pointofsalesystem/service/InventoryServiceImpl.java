package com.possystem.pointofsalesystem.service;

import com.possystem.pointofsalesystem.model.Product;
import com.possystem.pointofsalesystem.model.PerishableProduct;
import com.possystem.pointofsalesystem.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class InventoryServiceImpl implements Inventory {

    private final ProductRepository productRepository;

    @Autowired
    public InventoryServiceImpl(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    @Override
    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }

    // FIX: Convert String ID from controller to Long ID for repository
    @Override
    public Optional<Product> getProductById(String idString) {
        try {
            Long id = Long.parseLong(idString);
            return productRepository.findById(id);
        } catch (NumberFormatException e) {
            return Optional.empty();
        }
    }

    @Override
    public void addProduct(Product product) {
        // FIX: Set ID to null for MySQL AUTO_INCREMENT
        product.setId(null);

        // FIX: Handle default values required by the NOT NULL database columns
        if (product instanceof PerishableProduct) {
            // Perishable product logic
            product.setIsPerishable(true);
            if (product.getQuantity() == null) {
                product.setQuantity(1); // Default to 1 for a new perishable item
            }
        } else {
            // Standard product logic
            product.setIsPerishable(false);
            if (product.getQuantity() == null) {
                product.setQuantity(0); // Default to 0 for a new standard item
            }
        }

        productRepository.save(product);
    }

    // FIX: Convert String ID to Long ID for update
    @Override
    public boolean updateProduct(String idString, Product productDetails) {
        try {
            Long id = Long.parseLong(idString);
            Optional<Product> existingProductOpt = productRepository.findById(id);

            if (existingProductOpt.isPresent()) {
                Product existingProduct = existingProductOpt.get();

                existingProduct.setName(productDetails.getName());
                existingProduct.setPrice(productDetails.getPrice());

                // Note: Price type is now BigDecimal, ensure your controller handles this.

                if (existingProduct instanceof PerishableProduct && productDetails instanceof PerishableProduct) {
                    ((PerishableProduct) existingProduct).setExpiryDate(((PerishableProduct) productDetails).getExpiryDate());
                }

                productRepository.save(existingProduct);
                return true;
            }
            return false;
        } catch (NumberFormatException e) {
            return false;
        }
    }

    // FIX: Convert String ID to Long ID for delete
    @Override
    public boolean deleteProduct(String idString) {
        try {
            Long id = Long.parseLong(idString);
            if (productRepository.existsById(id)) {
                productRepository.deleteById(id);
                return true;
            }
            return false;
        } catch (NumberFormatException e) {
            return false;
        }
    }

    @Override
    public List<Product> searchProducts(String searchTerm) {
        if (searchTerm == null || searchTerm.trim().isEmpty()) {
            return getAllProducts();
        }

        List<Product> results = productRepository.findByNameContainingIgnoreCase(searchTerm);

        try {
            // Check if search term is a numeric ID and use findById(Long) if so
            Long id = Long.parseLong(searchTerm);
            Optional<Product> resultById = productRepository.findById(id);
            if (resultById.isPresent() && !results.contains(resultById.get())) {
                results.add(0, resultById.get());
            }
        } catch (NumberFormatException e) {
            // Ignore if search term is not a numeric ID
        }

        return results;
    }
}
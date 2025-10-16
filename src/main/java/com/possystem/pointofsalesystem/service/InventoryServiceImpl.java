package com.possystem.pointofsalesystem.service;

import com.possystem.pointofsalesystem.model.Product;
import com.possystem.pointofsalesystem.model.PerishableProduct;
import com.possystem.pointofsalesystem.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

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

    @Override
    public Optional<Product> getProductById(String id) {
        return productRepository.findById(id);
    }

    @Override
    public void addProduct(Product product) {
        if (product.getId() == null || product.getId().isEmpty()) {
            product.setId(UUID.randomUUID().toString());
        }
        productRepository.save(product);
    }

    @Override
    public boolean updateProduct(String id, Product productDetails) {
        Optional<Product> existingProductOpt = productRepository.findById(id);

        if (existingProductOpt.isPresent()) {
            Product existingProduct = existingProductOpt.get();

            existingProduct.setName(productDetails.getName());
            existingProduct.setPrice(productDetails.getPrice());

            if (existingProduct instanceof PerishableProduct && productDetails instanceof PerishableProduct) {
                ((PerishableProduct) existingProduct).setExpiryDate(((PerishableProduct) productDetails).getExpiryDate());
            }

            productRepository.save(existingProduct);
            return true;
        }
        return false;
    }

    @Override
    public boolean deleteProduct(String id) {
        if (productRepository.existsById(id)) {
            productRepository.deleteById(id);
            return true;
        }
        return false;
    }

    @Override
    public List<Product> searchProducts(String searchTerm) {
        if (searchTerm == null || searchTerm.trim().isEmpty()) {
            return getAllProducts();
        }

        List<Product> results = productRepository.findByNameContainingIgnoreCase(searchTerm);

        Optional<Product> resultById = productRepository.findById(searchTerm);
        if (resultById.isPresent() && !results.contains(resultById.get())) {
            results.add(0, resultById.get());
        }
        return results;
    }
}
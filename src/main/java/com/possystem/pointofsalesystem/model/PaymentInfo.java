package com.possystem.pointofsalesystem.model;


public class PaymentInfo {
    private String method;
    private double amountPaid;

    public PaymentInfo() {}


    public PaymentInfo(String method, double amountPaid) {
        this.method = method;
        this.amountPaid = amountPaid;
    }
    // Add necessary getters and setters
    public String getMethod() { return method; }
    public void setMethod(String method) { this.method = method; }
    public double getAmountPaid() { return amountPaid; }
    public void setAmountPaid(double amountPaid) { this.amountPaid = amountPaid; }
}

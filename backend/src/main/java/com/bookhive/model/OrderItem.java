package com.bookhive.model;

public class OrderItem {
    private String bookId;
    private int quantity;
    private double priceAtPurchase;

    public OrderItem() {}

    public OrderItem(String bookId, int quantity, double priceAtPurchase) {
        this.bookId = bookId;
        this.quantity = quantity;
        this.priceAtPurchase = priceAtPurchase;
    }

    public String getBookId() { return bookId; }
    public void setBookId(String bookId) { this.bookId = bookId; }
    public int getQuantity() { return quantity; }
    public void setQuantity(int quantity) { this.quantity = quantity; }
    public double getPriceAtPurchase() { return priceAtPurchase; }
    public void setPriceAtPurchase(double priceAtPurchase) { this.priceAtPurchase = priceAtPurchase; }
}

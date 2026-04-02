package com.bookhive.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.Instant;

@Document(collection = "marketplace_listings")
public class MarketplaceListing {
    @Id
    private String id;
    private String sellerId;
    private String bookId;
    private String condition;
    private double price;
    private Instant listedAt;
    private String status;

    public MarketplaceListing() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getSellerId() { return sellerId; }
    public void setSellerId(String sellerId) { this.sellerId = sellerId; }
    public String getBookId() { return bookId; }
    public void setBookId(String bookId) { this.bookId = bookId; }
    public String getCondition() { return condition; }
    public void setCondition(String condition) { this.condition = condition; }
    public double getPrice() { return price; }
    public void setPrice(double price) { this.price = price; }
    public Instant getListedAt() { return listedAt; }
    public void setListedAt(Instant listedAt) { this.listedAt = listedAt; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}

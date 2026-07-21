package com.satvik.ecommerce.entity;

import jakarta.persistence.*;
import lombok.*;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "wishlists")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Wishlist {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @OneToMany(mappedBy = "wishlist", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<WishlistItem> wishlistItems = new ArrayList<>();

    public void addWishlistItem(WishlistItem item) {
        if (wishlistItems == null) {
            wishlistItems = new ArrayList<>();
        }
        wishlistItems.add(item);
        item.setWishlist(this);
    }

    public void removeWishlistItem(WishlistItem item) {
        if (wishlistItems != null) {
            wishlistItems.remove(item);
            item.setWishlist(null);
        }
    }

    public void clearItems() {
        if (wishlistItems != null) {
            for (WishlistItem item : wishlistItems) {
                item.setWishlist(null);
            }
            wishlistItems.clear();
        }
    }
}

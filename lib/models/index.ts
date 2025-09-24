// Import all models to ensure they are registered in the correct order
import './Category';
import './Product';
import './User';
import './BlogPost';
import './BlogReview';
import './Comment';
import './ContactMessage';
import './Coupon';
import './Order';
import './ProductQuestion';
import './ProductReview';
import './Cart';
import './Wishlist';
import './GuestUser';

// Re-export all models for convenience
export { default as Category } from './Category';
export { default as Product } from './Product';
export { default as User } from './User';
export { default as BlogPost } from './BlogPost';
export { default as BlogReview } from './BlogReview';
export { default as Comment } from './Comment';
export { default as ContactMessage } from './ContactMessage';
export { default as Coupon } from './Coupon';
export { default as Order } from './Order';
export { default as ProductQuestion } from './ProductQuestion';
export { default as ProductReview } from './ProductReview';
export { default as Cart } from './Cart';
export { default as Wishlist } from './Wishlist';
export { default as GuestUser } from './GuestUser';

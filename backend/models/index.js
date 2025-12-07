const User = require("./userModel")
const Product = require("./productModel")
const Order = require("./orderModel")
const Review = require("./reviewModel")
const CartItem = require("./cartItemModel")
const OrderItem = require("./orderItemModel")
const TopUpRequest = require("./topUpRequestModel")
const ChatRoom = require("./chatRoomModel")
const Message = require("./messageModel")

// User has many Products
User.hasMany(Product, { foreignKey: "sellerId", targetKey: "id", as: "products" })
Product.belongsTo(User, { foreignKey: "sellerId", targetKey: "id", as: "seller" })

// Order
Order.belongsTo(User, { foreignKey: "userId", as: "user" })
Order.belongsToMany(Product, { through: OrderItem, as: "products", foreignKey: "orderId", otherKey: "productId" })
Product.belongsToMany(Order, { through: OrderItem, as: "orders", foreignKey: "productId", otherKey: "orderId" })
Order.hasMany(OrderItem, { foreignKey: 'orderId', as: 'orderItems' })
OrderItem.belongsTo(Order, { foreignKey: 'orderId', as: 'order' })
Product.hasMany(OrderItem, { foreignKey: 'productId', as: 'orderItems' })
OrderItem.belongsTo(Product, { foreignKey: 'productId', as: 'product' })

// User has many Reviews
User.hasMany(Review, { foreignKey: "userId", targetKey: "id", as: "reviews" })
Review.belongsTo(User, { foreignKey: "userId", targetKey: "id", as: "user" })

// Product has many Reviews
Product.hasMany(Review, { foreignKey: "productId", targetKey: "id", as: "reviews" })
Review.belongsTo(Product, { foreignKey: "productId", targetKey: "id", as: "product" })

// User has many CartItems
User.hasMany(CartItem, { foreignKey: "userId", targetKey: "id", as: "cartItems" })
CartItem.belongsTo(User, { foreignKey: "userId", targetKey: "id", as: "user" })

// Product has many CartItems
Product.hasMany(CartItem, { foreignKey: "productId", targetKey: "id", as: "cartItems" })
CartItem.belongsTo(Product, { foreignKey: "productId", targetKey: "id", as: "product" })

// TopUpRequest belongs to User
TopUpRequest.belongsTo(User, { foreignKey: "userId", targetKey: "id", as: "user" })

// Chat
ChatRoom.belongsTo(User, { as: "User", foreignKey: "userId" })
ChatRoom.belongsTo(User, { as: "Seller", foreignKey: "sellerId" })

ChatRoom.hasMany(Message, { foreignKey: "chatRoomId" })
Message.belongsTo(ChatRoom, { foreignKey: "chatRoomId" })

Message.belongsTo(User, { foreignKey: "senderId" })

module.exports = {
  User,
  Product,
  Order,
  Review,
  CartItem
}
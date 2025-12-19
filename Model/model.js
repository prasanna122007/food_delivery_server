import mongoose from 'mongoose'

const { Schema } = mongoose

const UserSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
})

const RestaurantSchema = new Schema({
  name: String,
  description: String,
})

const FoodSchema = new Schema({
  restaurant: { type: Schema.Types.ObjectId, ref: 'Restaurant' },
  name: String,
  description: String,
  price: Number,
  image: String,
})

const OrderSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: false },
  items: [
    {
      food: { type: Schema.Types.ObjectId, ref: 'Food' },
      qty: Number,
    },
  ],
  customer: {
    name: String,
    address: String,
  },
  total: Number,
  status: { type: String, default: 'Placed' },
  createdAt: { type: Date, default: Date.now },
})

export const User = mongoose.model('User', UserSchema)
export const Restaurant = mongoose.model('Restaurant', RestaurantSchema)
export const Food = mongoose.model('Food', FoodSchema)
export const Order = mongoose.model('Order', OrderSchema)

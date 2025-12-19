import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'
import { User, Restaurant, Food, Order } from '../Model/model.js'

dotenv.config()
const JWT_SECRET = process.env.JWT_SECRET || 'change_this_secret'

const createToken = (user) => jwt.sign({ id: user._id, email: user.email, name: user.name }, JWT_SECRET, { expiresIn: '7d' })

export const signup = async (req, res) => {
  try {
    const { name, email, password } = req.body
    if (!name || !email || !password) return res.status(400).json({ error: 'Missing fields' })
    const existing = await User.findOne({ email })
    if (existing) return res.status(400).json({ error: 'Email already registered' })
    const hash = await bcrypt.hash(password, 10)
    const user = await User.create({ name, email, password: hash })
    // return token so client can auto-login if desired
    const token = createToken(user)
    res.json({ id: user._id, token })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Server error' })
  }
}

export const addFood = async (req, res) => {
  try {
    const { restaurantId, name, description, price, image } = req.body
    if (!restaurantId || !name) return res.status(400).json({ error: 'Missing fields' })
    const food = await Food.create({ restaurant: restaurantId, name, description, price, image })
    res.json(food)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Server error' })
  }
}

export const addRestaurant = async (req, res) => {
  try {
    const { name, description } = req.body
    if (!name) return res.status(400).json({ error: 'Missing name' })
    const r = await Restaurant.create({ name, description })
    res.json(r)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Server error' })
  }
}

export const login = async (req, res) => {
  try {
    const { email, password } = req.body
    const user = await User.findOne({ email })
    if (!user) return res.status(401).json({ error: 'Invalid credentials' })
    const ok = await bcrypt.compare(password, user.password)
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' })
    const token = createToken(user)
    res.json({ token })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Server error' })
  }
}

export const getRestaurants = async (req, res) => {
  try {
    const list = await Restaurant.find().lean()
    if (list.length === 0) {
      // seed a couple of Indian restaurants and dishes
      const r1 = await Restaurant.create({ name: 'Biryani Palace', description: 'Authentic Hyderabadi biryani' })
      const r2 = await Restaurant.create({ name: 'Dosa Corner', description: 'Crispy South Indian dosas' })
      await Food.create({ restaurant: r1._id, name: 'Hyderabadi Biryani', price: 250, description: 'Fragrant rice with marinated meat' })
      await Food.create({ restaurant: r1._id, name: 'Chicken Biryani', price: 220, description: 'Spiced chicken with rice' })
      await Food.create({ restaurant: r2._id, name: 'Masala Dosa', price: 80, description: 'Crispy dosa with potato masala' })
      return res.json([r1, r2])
    }
    res.json(list)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Server error' })
  }
}

export const getRestaurantMenu = async (req, res) => {
  try {
    const { id } = req.params
    const foods = await Food.find({ restaurant: id }).lean()
    res.json(foods)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Server error' })
  }
}

const authenticateOptional = (req) => {
  const header = req.headers.authorization
  if (!header) return null
  const parts = header.split(' ')
  if (parts.length !== 2) return null
  const token = parts[1]
  try {
    const data = jwt.verify(token, JWT_SECRET)
    return data
  } catch (e) {
    return null
  }
}

export const placeOrder = async (req, res) => {
  try {
    const userData = authenticateOptional(req)
    const userId = userData?.id || null
    const { items = [], customer = {} } = req.body
    if (!items.length) return res.status(400).json({ error: 'No items' })

    // compute total by fetching foods
    const ids = items.map((i) => i.id)
    const foods = await Food.find({ _id: { $in: ids } }).lean()
    let total = 0
    const orderItems = items.map((it) => {
      const f = foods.find((x) => x._id.toString() === it.id)
      const price = f?.price || 0
      total += price * (it.qty || 1)
      return { food: it.id, qty: it.qty }
    })

    const order = await Order.create({ user: userId, items: orderItems, customer, total })
    res.json({ id: order._id })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Server error' })
  }
}

export const getMyOrders = async (req, res) => {
  try {
    const header = req.headers.authorization
    if (!header) return res.status(401).json({ error: 'Missing auth' })
    const parts = header.split(' ')
    if (parts.length !== 2) return res.status(401).json({ error: 'Invalid auth' })
    const token = parts[1]
    let user
    try {
      user = jwt.verify(token, JWT_SECRET)
    } catch (e) {
      return res.status(401).json({ error: 'Invalid token' })
    }
    const orders = await Order.find({ user: user.id }).populate('items.food').lean()
    res.json(orders)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Server error' })
  }
}

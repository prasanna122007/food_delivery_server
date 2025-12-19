import express from 'express'
import { signup, login, getRestaurants, getRestaurantMenu, placeOrder, getMyOrders, addFood, addRestaurant } from '../Controller/Controller.js'

const router = express.Router()

router.post('/api/auth/signup', signup)
router.post('/api/auth/login', login)

router.get('/api/restaurants', getRestaurants)
router.get('/api/restaurants/:id/menu', getRestaurantMenu)
router.post('/api/restaurants', addRestaurant)
router.post('/api/foods', addFood)

router.post('/api/orders', placeOrder)
router.get('/api/orders/my', getMyOrders)

export default router

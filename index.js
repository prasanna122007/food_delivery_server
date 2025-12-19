import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import routes from './Routes/routes.js'
import { connectDB } from './Db/db.js'

dotenv.config()

const app = express()
app.use(cors())
app.use(express.json())

app.use(routes)

const PORT = process.env.PORT || 5000

const start = async () => {
  try {
    console.log('Starting server...')
    await connectDB()
    app.listen(PORT, () => console.log(`Server listening on ${PORT}`))
  } catch (error) {
    console.error('Failed to start server:', error)
    process.exit(1)
  }
}

start().catch(console.error)

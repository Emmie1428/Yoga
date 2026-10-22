import 'dotenv/config'
import app from './app'

const PORT = process.env.PORT || 8090

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`)
})

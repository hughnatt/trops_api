const express = require('express')
const port = process.env.PORT
const apiRouter = require('./routers/api')
const searchRouter = require('./routers/search')
const categoryRouter = require('./routers/category')
const imageRouter = require('./routers/image')
require('./db/db')

const app = express()

app.use(express.json())
app.use(apiRouter)
app.use(searchRouter)
app.use(categoryRouter)
app.use(imageRouter)

app.listen(port, () => {
    console.log(`Server running on port ${port}`)
})
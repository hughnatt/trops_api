const express = require('express')
const port = process.env.PORT
const apiRouter = require('./routers/api')
const searchRouter = require('./routers/search')
require('./db/db')

const app = express()

app.use(express.json())
app.use(apiRouter)
app.use(searchRouter)

app.listen(port, () => {
    console.log(`Server running on port ${port}`)
})
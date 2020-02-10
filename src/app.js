const express = require('express')
const port = process.env.PORT
const apiRouter = require('./routers/api')
require('./db/db')

const app = express()

app.use(express.json())
app.use(apiRouter)

app.listen(port, () => {
    console.log(`Server running on port ${port}`)
})
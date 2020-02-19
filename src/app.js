const express = require('express')
const port = process.env.PORT
const apiRouter = require('./routers/api')
const searchRouter = require('./routers/search')
const categoryRouter = require('./routers/category')
<<<<<<< HEAD
const imageRouter = require('./routers/image')
=======
const advertRouter = require('./routers/advert')
>>>>>>> 560e75698bc04c02ff361cab0846eb9fbc4b2149
require('./db/db')

const app = express()

app.use(express.json())
app.use(apiRouter)
app.use(searchRouter)
app.use(categoryRouter)
<<<<<<< HEAD
app.use(imageRouter)
=======
app.use(advertRouter)
>>>>>>> 560e75698bc04c02ff361cab0846eb9fbc4b2149

app.listen(port, () => {
    console.log(`Server running on port ${port}`)
})
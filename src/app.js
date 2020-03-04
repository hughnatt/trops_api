const express = require('express')
const port = process.env.PORT
const usersRouter = require('./routers/users')
const searchRouter = require('./routers/search')
const categoryRouter = require('./routers/category')
const imageRouter = require('./routers/image')
const advertRouter = require('./routers/advert')
const adminRouter = require('./routers/admin')
const statsRouter = require('./routers/stats')
require('./db/db')

const app = express()

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*"); // FOR DEVELOPMENT PURPOSES ONLY
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  next();
});
app.use(express.json())
app.use(usersRouter)
app.use(searchRouter)
app.use(categoryRouter)
app.use(imageRouter)
app.use(advertRouter)
app.use(adminRouter)
app.use(statsRouter)


app.listen(port, () => {
    console.log(`[TROPS-API] Server running on port ${port}`)
})

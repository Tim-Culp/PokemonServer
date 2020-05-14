const express = require('express'); //1
const app = express();

require('dotenv').config();

const sequelize = require('./db');
//modules that require .db need the obscured environment postgres password varialbe
const userController = require('./controllers/userController');
const pokemonController = require('./controllers/pokemonController');

sequelize.sync();

app.use(express.json());
app.use(require('./middleware/headers'));

//exposed routes
app.use('/api/users', userController);

//authentication gate
app.use(require('./middleware/validate-session'));
//protected routes
app.use('/api/pokemon', pokemonController);


app.listen(process.env.PORT, () => {
    console.log("Server listening on port " + process.env.PORT)
});
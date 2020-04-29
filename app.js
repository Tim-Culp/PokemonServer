const express = require('express'); //1
const app = express();

const dotenv = require('dotenv');
dotenv.config();

//modules that require .db need the obscured environment postgres password varialbe
const userController = require('./controllers/userController');
const pokemonController = require('./controllers/pokemonController');
const sequelize = require('./db');

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
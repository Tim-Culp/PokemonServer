const express = require('express'); //1
const app = express();

require('dotenv').config();

const sequelize = require('./db');
//modules that require .db need the obscured environment postgres password varialbe
const userController = require('./controllers/userController');
const pokemonController = require('./controllers/pokemonController');

// sequelize.sync();

app.use(express.json());
app.use(require('./middleware/headers'));

//exposed routes
app.use('/api/users', userController);

//authentication gate

//validate-session is used to identify which user, if any, is accessing the server and therefore giving users' data necessary privacy. It does this by taking the request's authentication header and appending a "user" object to the request before send it onward. In app.js, any route below this validate-session route will have to pass through validate-session before being allowed to access the below routes.
app.use(require('./middleware/validate-session'));
//protected routes
app.use('/api/pokemon', pokemonController);

sequelize.authenticate()
    .then(()=> {
        console.log("Connected to postgres database")
        sequelize.sync()
            .then(()=>{
                app.listen(process.env.PORT, () => {
                console.log("Server listening on port " + process.env.PORT)
                })
            })
    }).catch(e=>{
        console.log("Error: Server crashed.");
        console.log(e);
    })
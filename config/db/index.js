require('dotenv').config();
const path = require('path');
const fs = require('fs');
const {Sequelize, DataTypes} = require('sequelize');

let db = {};

let sequelize;

(async function(){
    if (process.env.NODE_ENV === 'development') {
        //development
        sequelize = new Sequelize({
            dialect: 'sqlite',
            storage: path.resolve(__dirname, '../../sqlite/test.sqlite'),
        })
        db[`models`] = {};
        for (file of fs.readdirSync(path.join(__dirname, './models'))) {
            let table = file.slice(0, -3);
            db[`models`][`${table}`] = require(`./models/${table}`)(sequelize, DataTypes);
            await db[`models`][`${table}`].sync({});
        }

    }
    else {
        //production

    }

})().then(()=>{
    db[`models`][`User`].sync({force: true}).then(()=>{
        console.log("-----------------------test database setup start------------------------");
        Promise.all([
            db.models.User.create({ email: 'user1@kimtahen.com', name: 'user1', password: 'password1', status: 'RUN' }),
            db.models.User.create({ email: 'user2@kimtahen.com', name: 'user2', password: 'password2', status: 'STOP' }),
            db.models.User.create({ email: 'user3@kimtahen.com', name: 'user3', password: 'password3', status: 'DELETED' })
        ]).then(() => {
            db.models.User.findAll().then((res) => {
                console.log(res.map(res => res.dataValues));
        console.log("-----------------------test database setup end------------------------");
            })
        });

    })
})


db['sequelize'] = sequelize;
db['Sequelize'] = Sequelize;
module.exports = db; 

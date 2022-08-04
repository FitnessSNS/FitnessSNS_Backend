require('dotenv').config();
const path = require('path');
const fs = require('fs');
const {Sequelize, DataTypes} = require('sequelize');

let db = {};

let sequelize;

(async function(){
    db['Sequelize'] = Sequelize;
    if (process.env.NODE_ENV === 'development') {
        //development
        sequelize = new Sequelize({
            dialect: 'sqlite',
            storage: path.resolve(__dirname, '../../sqlite/test.sqlite'),
        })
        db['sequelize'] = sequelize;
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

    //foreign key set
    db.models.User.hasOne(db.models.Session,{
        allowNull: false,
    });
    db.models.Session.belongsTo(db.models.User);
    await db.sequelize.sync({});


})().then(async ()=>{
    console.log("-----------------------User table setup start------------------------");
    await db[`models`][`User`].sync({force: true});
    await Promise.all([
        db.models.User.create({ email: 'user1@kimtahen.com', name: 'user1', password: 'password1', status: 'RUN' }),
        db.models.User.create({ email: 'user2@kimtahen.com', name: 'user2', password: 'password2', status: 'STOP' }),
        db.models.User.create({ email: 'user3@kimtahen.com', name: 'user3', password: 'password3', status: 'DELETED' })

    ]);
    console.log((await db.models.User.findAll()).map(res=>res.dataValues));
    console.log("-----------------------User table setup end------------------------");

    console.log("-----------------------Session table setup start------------------------");
    await db[`models`][`Session`].sync({force: true});
    await Promise.all([
    ]);
    console.log((await db.models.Session.findAll({include: db.models.User})).map(res=>res.dataValues.User));
    console.log("-----------------------Session table setup end------------------------");
})


module.exports = db; 

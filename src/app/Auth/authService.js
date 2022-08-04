const db = require('../../../config/db');
exports.createSession = async (user_id, refresh_token, ip) =>{
    try{
        await db.models.Session.create({ refresh_token, ip, UserId: user_id });
    } catch (e) {
        console.log(e);
        throw e;
    }
}

exports.getSessionByToken = async (refresh_token) => {
    try{
        const session =  await db.models.Session.findOne({where: {refresh_token}});
        const user = await session.getUser();
        return {session, user};
    } catch (e) {
        console.log(e);
        throw e;
    }
}

exports.getSessionByUserId = async (user_id) => {
    try{
        const session =  await db.models.Session.findOne({where: {UserId: user_id}});
        return {session};
    } catch (e) {
        console.log(e);
        throw e;
    }
}


exports.deleteSession = async (refresh_token) => {
    try {
        await db.models.Session.destroy({where: {refresh_token}});
    } catch (e) {
        console.log(e);
        throw e;
    }
}

exports.updateSession = async (prev_token, new_token) => {
    try {
        await db.models.Session.update({refresh_token: new_token},{where: {refresh_token: prev_token}});
        console.log(await db.models.Session.findAll());
    } catch (e) {
        console.log(e);
        throw e;
    }

}
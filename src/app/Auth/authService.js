const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
exports.createSession = async (user_id, refresh_token, ip) => {
    try {
        await prisma.session.create({
            data: {
                refresh_token,
                ip,
                userId: user_id
            }
        });
    } catch (e) {
        console.log(e);
        throw e;
    }
}

exports.getSessionByToken = async (refresh_token) => {
    try {
        const session = await prisma.session.findFirst({ where: { refresh_token }, include: { user: { select: { email: true } } } });
        return { session };
    } catch (e) {
        console.log(e);
        throw e;
    }
}

exports.getSessionByUserId = async (user_id) => {
    try {
        const session = await prisma.session.findFirst({ where: { userId: user_id } });
        return { session };
    } catch (e) {
        console.log(e);
        throw e;
    }
}


exports.deleteSession = async (refresh_token) => {
    try {
        await prisma.session.deleteMany({ where: { refresh_token } });
    } catch (e) {
        console.log(e);
        throw e;
    }
}

exports.updateSession = async (prev_token, new_token) => {
    try {
        await prisma.session.updateMany({
            where: {
                refresh_token: prev_token
            },
            data: {
                refresh_token: new_token
            }
        });
    } catch (e) {
        console.log(e);
        throw e;
    }

}

exports.getUserByEmail = async ({provider, email}) => {
    try {
        let user = await prisma.user.findFirst({
            where : {
                provider,
                email 
            },
        });
        console.log(email);
        return user;
    } catch (e) {
        console.log(e);
        throw e;
    }
}

exports.getUserByProviderId = async ({provider, provider_id}) => {
    try {
        let user = await prisma.user.findFirst({
            where : {
                provider,
                provider_id: String(provider_id),
            },
        });
        return user;
    } catch (e) {
        console.log(e);
        throw e;
    }
}

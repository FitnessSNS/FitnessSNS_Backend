const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.addAccountDetails = async ({provider, email, nickname}) => {
    try {
        let user = await prisma.user.findMany({
            where: {
                provider,
                email,
            },
        });
        await prisma.UserProfile.update({
            where: {
                user_id: user[0].id,
            },
            data: {
                nickname,
                User: {
                    update: {
                        account_details_saved: true,
                    }
                }
            }
        });
    } catch (e) {
        console.log(e);
        throw e;
    }
}

exports.chageStatus = async ({status, provider, email}) => {
    try {
        return await prisma.user.updateMany({
            where: {
                provider,
                email
            },
            data: {
                status  
            }
        })
    } catch (e) {
        console.log(e);
        throw e;
    }
}

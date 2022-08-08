const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
exports.createUser = async ({provider, provider_id, email, password, status, account_details_saved, nickname}) => {
    try {
        return await prisma.user.create({
            data: {
                email,
                provider,
                provider_id: String(provider_id),
                password,
                status,
                account_details_saved,
                UserProfile: {
                    create: {
                        nickname
                    }
                }
                
            }
        });
    } catch (e) {
        console.log(e);
        throw e;
    }
}
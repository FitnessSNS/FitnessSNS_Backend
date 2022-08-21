const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
exports.createUser = async ({provider, provider_id, email, password, salt, status, account_details_saved, nickname}) => {
    try {
        return await prisma.user.create({
            data: {
                email: email ? email : null,
                provider: provider ? provider : null,
                provider_id: provider_id ? String(provider_id) : null,
                password : password ? password : null,
                salt: salt ? salt : null,
                status: status ? status : null,
                account_details_saved: account_details_saved ? account_details_saved : null,
                UserProfile: {
                    create: {
                        nickname: nickname ? nickname : null,
                    }
                }
                
            }
        });
    } catch (e) {
        console.log(e);
        throw e;
    }
}


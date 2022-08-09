const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const load = async () => {
    try {
        let user;
        user = await prisma.user.create({
            data: {
                email: "user1@gmail.com",
                provider: "local",
                password: "password1",
                status: "run",
                account_details_saved: true,
                UserProfile: {
                    create: {
                        nickname: "nicknameofuser1"
                    }
                }
                
            }
        });
        console.log("user1 created",user);

        user = await prisma.user.create({
            data: {
                email: "user2@naver.com",
                provider: "local",
                status: "run",
                account_details_saved: false,
            }
        })
        console.log("user2 created",user);

        userProfile = await prisma.userProfile.create({
            data: {
                nickname: "nicknameofuser2",
                user: {
                    connect: {
                        id: 2,
                    }
                }
            }
        })
        await prisma.user.update({
            where: {
                id: 2,
            },
            data: {
                account_details_saved: true,
            }
        })
        console.log("user2 profile created");
        
    } catch (e) {
        console.error(e);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    };
}

load();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const load = async () => {
    try {
        await prisma.user.create({
            data: {
                email: "user1@gmail.com",
                nickname: "user1",
                password: "password1",
                status: "run",
            }
        });
        console.log("user1 created");
        await prisma.user.create({
            data: {
                email: "user2@gmail.com",
                nickname: "user2",
                password: "password2",
                status: "stop",
            }
        });
        console.log("user2 created");
        await prisma.user.create({
            data: {
                email: "user3@gmail.com",
                nickname: "user3",
                password: "password3",
                status: "pause",
            }
        });
        console.log("user3 created");
        
    } catch (e) {
        console.error(e);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    };
}

load();
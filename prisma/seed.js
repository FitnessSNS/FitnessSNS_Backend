const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const load = async () => {
    try {
        let user;
        user = await prisma.user.create({
            data: {
                email: "kimtahen@naver.com",
                provider: "local",
                password: "ccrM00ZvMBRRH+z9Equy93Od/Zmoj6t3QyYNb0V5Ck9Nxx0HqjS0iFLJDMfzAdj6GT4at6voMuGE1oFvt0fz/w==",
                salt: "1L03/JTZH++5VTd+Plq+GmLzCXAOAVMsSWqNWJHghaGS9iOqIGLnsxwOzGhovrHfVKcBygUUvZsKmArQOqbsUg==",
                status: "run",
                account_details_saved: true,
                UserProfile: {
                    create: {
                        nickname: "kimtaehyeon"
                    }
                }
                
            }
        });
        console.log("user1 created",user);
        
    } catch (e) {
        console.error(e);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    };
}

load();
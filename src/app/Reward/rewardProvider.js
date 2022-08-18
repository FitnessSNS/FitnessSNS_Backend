const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.retrieveChallenge = async () => {
    const challengeRows = await prisma.Challenge.findMany();
    
    if (challengeRows.length < 1) {
        return 'NoChallenges';
    }
    
    return challengeRows;
}
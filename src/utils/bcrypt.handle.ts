import { hash, compare } from "bcryptjs"
import Person from "../interfaces/Person";

const encrypt = async (pass: string) => {
    const passwordHash = await hash(pass, 8)
    return passwordHash;
}

const verified = async (pass: string, passHash: string) => {
    const isCorrect = await compare(pass, passHash);
    return isCorrect;
}

async function hashUserPasswords(users: Person[]) {
    const usersWithHashedPasswords = await Promise.all(
        users.map(async (user) => {
            const clonedUser = { ...user };
            clonedUser.password = await encrypt(user.password!);
            return clonedUser;
        })
    );

    return usersWithHashedPasswords;
}

export { encrypt, verified, hashUserPasswords }
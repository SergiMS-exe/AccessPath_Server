export const checkPasswordsConfirm = (password: string, confirmPassword: string) => {
    if (password !== confirmPassword) return { error: "Las contraseñas no coinciden", status: 400 };
    else return { status: 200 };
}

export const checkEmail = (email: string) => {
    if (!isValidEmail(email)) return { error: "Introduzca un email válido", status: 400 };
    else return { status: 200 };
}

export const checkPassword = (password: string) => {
    if (!isValidPassword(password)) return { error: "La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula y un número", status: 400 };
    else return { status: 200 };
}

const isValidEmail = (email: string): boolean => {
    const emailRegex = /^(?:[a-z\d]+(?:[_\.-][a-z\d]+)*)@(?:[a-z\d]+(?:-?[a-z\d]+)*(?:\.[a-z\d]+(?:-?[a-z\d]+)*)*\.[a-z]{2,})$/i;
    return emailRegex.test(email);
};

const isValidPassword = (password: string): boolean => {
    const passwordRegex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d).{8,}$/;
    return passwordRegex.test(password);
};

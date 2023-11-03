"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkPassword = exports.checkEmail = exports.checkPasswordsConfirm = void 0;
const checkPasswordsConfirm = (password, confirmPassword) => {
    if (password !== confirmPassword)
        return { error: "Las contraseñas no coinciden", status: 400 };
    else
        return { status: 200 };
};
exports.checkPasswordsConfirm = checkPasswordsConfirm;
const checkEmail = (email) => {
    if (!isValidEmail(email))
        return { error: "Introduzca un email válido", status: 400 };
    else
        return { status: 200 };
};
exports.checkEmail = checkEmail;
const checkPassword = (password) => {
    if (!isValidPassword(password))
        return { error: "La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula y un número", status: 400 };
    else
        return { status: 200 };
};
exports.checkPassword = checkPassword;
const isValidEmail = (email) => {
    const emailRegex = /^(?:[a-z\d]+(?:[_\.-][a-z\d]+)*)@(?:[a-z\d]+(?:-?[a-z\d]+)*\.[a-z]{2,})$/i;
    return emailRegex.test(email);
};
const isValidPassword = (password) => {
    const passwordRegex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d).{8,}$/;
    return passwordRegex.test(password);
};

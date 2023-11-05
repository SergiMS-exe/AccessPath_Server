jest.mock('bcryptjs');
import bcrypt from 'bcryptjs';
const mockedBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;

jest.mock('../../../src/models/usuarioModel');
import UsuarioModel from '../../../src/models/usuarioModel';
const mockedUserModel = UsuarioModel as jest.Mocked<typeof UsuarioModel>;

import * as userService from '../../../src/services/usuariosService';
import Person from '../../../src/interfaces/Person';

describe('userService', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    const user: Person = {
        nombre: 'Jane',
        apellidos: 'Doe',
        email: 'jane@example.com',
        password: 'securePassword123',
        tipoDiscapacidad: 'Ninguna'
    };

    describe('registerUsuarioService', () => {
        afterEach(() => {
            mockedBcrypt.compareSync.mockReset();
        });

        it('USSer1 -> Caso positivo: Registro de un nuevo usuario con datos válidos', async () => {
            mockedUserModel.findOne.mockResolvedValue(null);
            mockedUserModel.create = jest.fn().mockResolvedValue(user);

            const result = await userService.registerUsuarioService(user);

            expect(result).toEqual({ usuario: user });
        });

        it('USSer2 -> Caso negativo: Intento de registrar un usuario con un correo electrónico ya existente', async () => {
            mockedUserModel.findOne.mockResolvedValue(user);

            const response = await userService.registerUsuarioService(user);

            expect(response).toEqual({ error: "Ya hay un usuario con ese email", status: 409 });
        });

    });

    describe('logInUserService', () => {
        it('USSer4 -> Caso positivo: Inicio de sesión con credenciales válidas', async () => {

            mockedUserModel.findOne.mockResolvedValue(user);
            mockedBcrypt.compare = jest.fn().mockResolvedValue(true); //Mockeamos la función compare de bcrypt para que devuelva true

            const result = await userService.logInUserService({
                email: user.email,
                password: user.password!
            });

            expect(result).toEqual({ usuario: user });
        });

        it('USSer5 -> Caso negativo: Inicio de sesión con un correo electrónico inexistente', async () => {
            mockedUserModel.findOne.mockResolvedValue(null);

            const response = await userService.logInUserService({
                email: 'nonexistent@example.com',
                password: 'anyPassword'
            })

            expect(response).toEqual({ error: "No hay un usuario registrado con ese email", status: 404 });
        });

        it('USSer6 -> Caso negativo: Inicio de sesión con una contraseña incorrecta', async () => {
            mockedUserModel.findOne.mockResolvedValue(user);
            mockedBcrypt.compare = jest.fn().mockResolvedValue(false); //Mockeamos la función compare de bcrypt para que devuelva false

            const response = await userService.logInUserService({
                email: user.email,
                password: 'wrongPassword'
            })

            expect(response).toEqual({ error: "Contraseña incorrecta", status: 401 });
        });
    });
});
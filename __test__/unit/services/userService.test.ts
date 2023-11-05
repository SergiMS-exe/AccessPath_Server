// jest.mock('../../../src/models/usuarioModel');
// import UsuarioModel from '../../../src/models/usuarioModel';
// const mockedUserModel = UsuarioModel as jest.Mocked<typeof UsuarioModel>;

// jest.mock('mongoose', () => {
//     const actualMongoose = jest.requireActual('mongoose');
//     return {
//         ...actualMongoose,
//         Types: {
//             ObjectId: {
//                 isValid: jest.fn()
//             }
//         }
//     };
// });
// import mongoose from 'mongoose';
// const mockedMongoose = mongoose as jest.Mocked<typeof mongoose>;

// jest.mock('bcrypt');
// import bcrypt from 'bcrypt';
// const mockedBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;

// import * as userService from '../../../src/services/usuariosService';

// describe('userService', () => {
//     afterEach(() => {
//         jest.clearAllMocks();
//     });

//     describe('registerUsuarioService', () => {
//         afterEach(() => {
//             mockedBcrypt.compareSync.mockReset();
//         });

//         it('USSer1 -> Caso positivo: Registro de un nuevo usuario con datos válidos', async () => {
//             // Arrange
//             mockedUserModel.findOne.mockResolvedValue(null);
//             mockedUserModel.create.mockResolvedValue();

//             // Act
//             const result = await userService.registerUsuarioService({
//                 nombre: 'John',
//                 apellidos: 'Doe',
//                 email: 'john@example.com',
//                 password: 'securePassword123', // assuming encrypt function is mocked too
//                 tipoDiscapacidad: 'Ninguna'
//             });

//             // Assert
//             expect(result).toEqual({ /* expected success result */ });
//         });

//         it('USSer2 -> Caso negativo: Intento de registrar un usuario con un correo electrónico ya existente', async () => {
//             // Arrange
//             mockedUserModel.findOne.mockResolvedValue({ /* existing user data */ });

//             // Act & Assert
//             await expect(userService.registerUsuarioService({
//                 nombre: 'Jane',
//                 apellidos: 'Doe',
//                 email: 'jane@example.com',
//                 password: 'securePassword123',
//                 tipoDiscapacidad: 'Ninguna'
//             }))
//                 .rejects.toThrow('Email already in use');
//         });

//         it('USSer3 -> Caso negativo: Registro con datos inválidos o incompletos', async () => {
//             // Arrange, Act & Assert
//             await expect(userService.registerUsuarioService({
//                 nombre: '', // Invalid name
//                 apellidos: '', // Invalid surname
//                 email: 'invalidEmail', // Invalid email
//                 // Missing password
//                 tipoDiscapacidad: '' // Invalid disability type
//             }))
//                 .rejects.toThrow('Invalid or incomplete data');
//         });
//     });

//     describe('logInUserService', () => {
//         it('USSer4 -> Caso positivo: Inicio de sesión con credenciales válidas', async () => {
//             // Arrange
//             mockedUserModel.findOne.mockResolvedValue({ /* user details based on Person interface */ });
//             mockedBcrypt..mockResolvedValue(true);

//             // Act
//             const result = await userService.logInUserService({
//                 email: 'john@example.com',
//                 password: 'securePassword123'
//             });

//             // Assert
//             expect(result).toEqual({ /* expected success result */ });
//         });

//         it('USSer5 -> Caso negativo: Inicio de sesión con un correo electrónico inexistente', async () => {
//             // Arrange
//             mockedUserModel.findOne.mockResolvedValue(null);

//             // Act & Assert
//             await expect(userService.logInUserService({
//                 email: 'nonexistent@example.com',
//                 password: 'anyPassword'
//             }))
//                 .rejects.toThrow('User does not exist');
//         });

//         it('USSer6 -> Caso negativo: Inicio de sesión con una contraseña incorrecta', async () => {
//             // Arrange
//             mockedUserModel.findOne.mockResolvedValue({ /* user details based on Person interface */ });
//             bcrypt.verified.mockResolvedValue(false);

//             // Act & Assert
//             await expect(userService.logInUserService({
//                 email: 'john@example.com',
//                 password: 'wrongPassword'
//             }))
//                 .rejects.toThrow('Incorrect password');
//         });
//     });
// });
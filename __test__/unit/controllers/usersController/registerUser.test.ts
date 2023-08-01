import { Types } from "mongoose";
import { Request, Response, NextFunction } from 'express';
import { registerUsuarioService } from "../../../../src/services/usuariosService";
import Person from "../../../../src/interfaces/Person";
import { registerUserController } from "../../../../src/controllers/usersController";

jest.mock('../../../../src/services/usuariosService', () => {
    return {
        registerUsuarioService: jest.fn(),
    };
});

describe('registerUserController_function', () => {
    // Tests that a new user is successfully created with valid input data
    it('test_successful_user_creation', async () => {
        const req: Request = {
            body: {
                email: 'test@test.com',
                password: 'password',
                saved: [],
                nombre: 'Test',
                apellidos: 'User',
                tipoDiscapacidad: 'Ninguna'
            }
        } as Request;
        const res = {
            status: jest.fn().mockReturnThis(),
            send: jest.fn()
        } as unknown as Response;
        const next: NextFunction = jest.fn();
        const mockUser: Person = {
            _id: new Types.ObjectId().toHexString(),
            nombre: 'Test',
            apellidos: 'User',
            email: 'test@test.com',
            password: 'password',
            tipoDiscapacidad: 'Ninguna',
            saved: [],
        };
        const responseRegister = { usuario: mockUser };
        (registerUsuarioService as jest.MockedFunction<typeof registerUsuarioService>).mockResolvedValueOnce(responseRegister as any);

        await registerUserController(req, res, next);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.send).toHaveBeenCalledWith({ msg: 'Usuario creado correctamente', user: responseRegister.usuario });
        expect(next).toHaveBeenCalled();
    });

    // Tests that the function returns a 409 status code and error message when the user already exists
    it('test_user_already_exists', async () => {
        const req: Request = {
            body: {
                email: 'test@test.com',
                password: 'password',
                saved: [],
                nombre: 'Test',
                apellidos: 'User',
                tipoDiscapacidad: 'Ninguna'
            }
        } as Request;
        const res = {
            status: jest.fn().mockReturnThis(),
            send: jest.fn()
        } as unknown as Response;
        const next: NextFunction = jest.fn();
        const responseRegister = { error: 'Ya hay un usuario con ese email', status: 409 };
        (registerUsuarioService as jest.MockedFunction<typeof registerUsuarioService>).mockResolvedValueOnce(responseRegister);

        await registerUserController(req, res, next);

        expect(res.status).toHaveBeenCalledWith(409);
        expect(res.send).toHaveBeenCalledWith({ msg: responseRegister.error });
        expect(next).toHaveBeenCalled();
    });

    //Test that the function returns a 400 status code and error message when the input data is invalid
    it('test_invalid_input_data', async () => {
        const req: Request = {
            body: {}
        } as Request;
        const res = {
            status: jest.fn().mockReturnThis(),
            send: jest.fn()
        } as unknown as Response;
        const next: NextFunction = jest.fn();

        await registerUserController(req, res, next);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.send).toHaveBeenCalledWith({ msg: 'Faltan datos en el body' });
        expect(next).toHaveBeenCalled();
    });

    // Tests that the function returns a 500 status code and error message when an error occurs during registration
    it('test_error_during_registration', async () => {
        const req: Request = {
            body: {
                email: 'test@test.com',
                password: 'password',
                saved: [],
                nombre: 'Test',
                apellidos: 'User',
                tipoDiscapacidad: 'Ninguna'
            }
        } as Request;
        const res = {
            status: jest.fn().mockReturnThis(),
            send: jest.fn()
        } as unknown as Response;
        const next: NextFunction = jest.fn();
        const errorMessage = 'Error en el registro: Error';
        (registerUsuarioService as jest.MockedFunction<typeof registerUsuarioService>).mockRejectedValueOnce(new Error('Error'));

        await registerUserController(req, res, next);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.send).toHaveBeenCalledWith({ msg: errorMessage });
    });

    // Tests that the function calls the handleHttp function when an error occurs and returns an error message
    it('test_error_handling', async () => {
        const req: Request = {
            body: {
                email: 'test@test.com',
                password: 'password',
                saved: [],
                nombre: 'Test',
                apellidos: 'User',
                tipoDiscapacidad: 'Ninguna'
            }
        } as Request;
        const res = {
            status: jest.fn().mockReturnThis(),
            send: jest.fn()
        } as unknown as Response;
        const next: NextFunction = jest.fn();
        const errorMessage = 'Error en el registro: Error';
        (registerUsuarioService as jest.MockedFunction<typeof registerUsuarioService>).mockRejectedValueOnce(new Error('Error'));

        await registerUserController(req, res, next);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.send).toHaveBeenCalledWith({ msg: errorMessage });
    });

    // Tests that the registerUsuarioService function is called with the correct input data
    it('test_register_usuario_service_called_with_correct_input_data', async () => {
        const req: Request = {
            body: {
                email: 'test@test.com',
                password: 'password',
                saved: [],
                nombre: 'Test',
                apellidos: 'User',
                tipoDiscapacidad: 'Ninguna'
            }
        } as Request;
        const res = {
            status: jest.fn().mockReturnThis(),
            send: jest.fn()
        } as unknown as Response;
        const next: NextFunction = jest.fn();
        const mockUser: Person = {
            _id: new Types.ObjectId().toHexString(),
            nombre: 'Test',
            apellidos: 'User',
            email: 'test@test.com',
            password: 'password',
            tipoDiscapacidad: 'Ninguna',
            saved: [],
        };
        const responseRegister = { usuario: mockUser };
        (registerUsuarioService as jest.MockedFunction<typeof registerUsuarioService>).mockResolvedValueOnce(responseRegister as any);

        await registerUserController(req, res, next);

        expect(registerUsuarioService).toHaveBeenCalledWith(req.body);
        expect(next).toHaveBeenCalled();
    });

    // Tests that the function returns a 500 status code and error message when 'registerUsuarioService' throws an error
    it('test_error_during_registration', async () => {
        const req = {
            body: {
                email: 'test@test.com',
                password: 'password',
                saved: [],
                nombre: 'Test',
                apellidos: 'User',
                tipoDiscapacidad: 'none'
            }
        };
        const res = {
            status: jest.fn().mockReturnThis(),
            send: jest.fn()
        };
        const next = jest.fn();

        (registerUsuarioService as jest.MockedFunction<typeof registerUsuarioService>).mockRejectedValueOnce(new Error('Database error'));

        await registerUserController(req as any, res as any, next);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.send).toHaveBeenCalledWith({ msg: 'Error en el registro: Database error' });
    });


});

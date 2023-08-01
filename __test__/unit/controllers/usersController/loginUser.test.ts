import { Types } from "mongoose";
import { Request } from 'express';
import { Response, NextFunction } from 'express';
import { logInUserController } from "../../../../src/controllers/usersController";
import { logInUserService } from "../../../../src/services/usuariosService";
import Person from '../../../../src/interfaces/Person';

jest.mock('../../../../src/services/usuariosService', () => {
    return {
        logInUserService: jest.fn(),
    };
});

describe('logInUserController_function', () => {
    // Tests that the function returns a 200 status code, success message, and user object when the user logs in successfully
    it('test_successful_login', async () => {
        const req: Request = {
            body: { email: 'test@test.com', password: 'password' },
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

        const responseLogIn = { usuario: mockUser } as any;
        (logInUserService as jest.MockedFunction<typeof logInUserService>).mockResolvedValueOnce(responseLogIn);

        await logInUserController(req, res, next);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.send).toHaveBeenCalledWith({ msg: 'Sesion iniciada correctamente', user: responseLogIn.usuario });
        expect(next).toHaveBeenCalled();
    });

    // Tests that an error message is returned when no user is found with the provided email
    it('test_no_user_found_with_provided_email', async () => {
        const req: Request = {
            body: {
                email: 'nonexistentuser@example.com',
                password: 'password'
            }
        } as Request;
        const res = {
            status: jest.fn().mockReturnThis(),
            send: jest.fn()
        } as unknown as Response;
        const next: NextFunction = jest.fn()
        const mockResponse = { error: 'No hay un usuario registrado con ese email', status: 404 } as any
        (logInUserService as jest.MockedFunction<typeof logInUserService>).mockResolvedValueOnce(mockResponse)

        await logInUserController(req, res, next)

        expect(res.status).toHaveBeenCalledWith(404)
        expect(res.send).toHaveBeenCalledWith({ msg: 'No hay un usuario registrado con ese email' })
    })

    // Tests that an error message is returned when the provided password is incorrect
    it('test_provided_password_incorrect', async () => {
        const req: Request = {
            body: {
                email: 'test@test.com',
                password: 'wrongpassword'
            }
        } as Request;
        const res = {
            status: jest.fn().mockReturnThis(),
            send: jest.fn()
        } as unknown as Response;
        const next: NextFunction = jest.fn()
        const mockResponse = { error: 'Contraseña incorrecta', status: 401 } as any
        (logInUserService as jest.MockedFunction<typeof logInUserService>).mockResolvedValueOnce(mockResponse)

        await logInUserController(req, res, next)

        expect(res.status).toHaveBeenCalledWith(401)
        expect(res.send).toHaveBeenCalledWith({ msg: 'Contraseña incorrecta' })
    })


    // Tests that the function returns a 400 status code and error message when the email or password is missing from the request body
    it('test_missing_email_and_password', async () => {
        const req: Request = {
            body: {},
        } as Request;
        const res = {
            status: jest.fn().mockReturnThis(),
            send: jest.fn()
        } as unknown as Response;
        const next: NextFunction = jest.fn();

        await logInUserController(req, res, next);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.send).toHaveBeenCalledWith({ msg: 'Faltan datos en el body' });
        expect(next).toHaveBeenCalled();
    });

    // Tests that an error message is returned when email is not provided in the request body
    it('test_email_not_provided', async () => {
        const req: Request = {
            body: {
                password: 'password'
            }
        } as Request;
        const res = {
            status: jest.fn().mockReturnThis(),
            send: jest.fn()
        } as unknown as Response;
        const next: NextFunction = jest.fn()

        await logInUserController(req, res, next)

        expect(res.status).toHaveBeenCalledWith(400)
        expect(res.send).toHaveBeenCalledWith({ msg: 'Faltan datos en el body' })
        expect(next).toHaveBeenCalled();
    })

    // Tests that an error message is returned when password is not provided in the request body
    it('test_password_not_provided', async () => {
        const req: Request = {
            body: {
                email: 'test@test.com'
            }
        } as Request;
        const res = {
            status: jest.fn().mockReturnThis(),
            send: jest.fn()
        } as unknown as Response;
        const next: NextFunction = jest.fn()

        await logInUserController(req, res, next)

        expect(res.status).toHaveBeenCalledWith(400)
        expect(res.send).toHaveBeenCalledWith({ msg: 'Faltan datos en el body' })
    })


    // Tests that the function returns a 404 status code and error message when the user is not found in the database
    it('test_user_not_found', async () => {
        const req: Request = {
            body: { email: 'test@test.com', password: 'password' },
        } as Request;
        const res = {
            status: jest.fn().mockReturnThis(),
            send: jest.fn()
        } as unknown as Response;
        const next: NextFunction = jest.fn();
        const responseLogIn = { error: 'No hay un usuario registrado con ese email', status: 404 };
        (logInUserService as jest.MockedFunction<typeof logInUserService>).mockResolvedValueOnce(responseLogIn);

        await logInUserController(req, res, next);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.send).toHaveBeenCalledWith({ msg: responseLogIn.error });
        expect(next).toHaveBeenCalled();
    });

    // Tests that the function returns a 401 status code and error message when the password is incorrect
    it('test_incorrect_password', async () => {
        const req: Request = {
            body: { email: 'test@test.com', password: 'password' },
        } as Request;
        const res = {
            status: jest.fn().mockReturnThis(),
            send: jest.fn()
        } as unknown as Response;
        const next: NextFunction = jest.fn();
        const responseLogIn = { error: 'Contraseña incorrecta', status: 401 };
        (logInUserService as jest.MockedFunction<typeof logInUserService>).mockResolvedValueOnce(responseLogIn);

        await logInUserController(req, res, next);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.send).toHaveBeenCalledWith({ msg: responseLogIn.error });
        expect(next).toHaveBeenCalled();
    });

    // Tests that the function calls the handleHttp function when an error occurs and returns an error message
    it('test_error_handling', async () => {
        const req: Request = {
            body: { email: 'test@test.com', password: 'password' },
        } as Request;
        const res = {
            status: jest.fn().mockReturnThis(),
            send: jest.fn()
        } as unknown as Response;
        const next: NextFunction = jest.fn();
        const errorMessage = 'Error en el login: Error';
        (logInUserService as jest.MockedFunction<typeof logInUserService>).mockRejectedValueOnce(new Error('Error'));

        await logInUserController(req, res, next);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.send).toHaveBeenCalledWith({ msg: errorMessage });
    });
});

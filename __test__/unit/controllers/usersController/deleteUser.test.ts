import { deleteUserController } from "../../../../src/controllers/usersController";
import { deleteUsuarioService } from "../../../../src/services/usuariosService";
import { Request, Response, NextFunction } from 'express';

jest.mock('../../../../src/services/usuariosService', () => {
    return {
        deleteUsuarioService: jest.fn(),
    };
});

describe('deleteUserController_function', () => {
    // Tests that the function returns a 200 status code and success message when the user is deleted successfully
    it('test_successful_user_deletion', async () => {
        const req: Partial<Request> = {
            params: {
                userId: '1'
            }
        };
        const res = {
            status: jest.fn().mockReturnThis(),
            send: jest.fn()
        } as unknown as Response;
        const next: NextFunction = jest.fn();

        (deleteUsuarioService as jest.MockedFunction<typeof deleteUsuarioService>).mockResolvedValueOnce({status: 200});

        await deleteUserController(req as any, res, next);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.send).toHaveBeenCalledWith({ msg: 'Usuario borrado correctamente' });
    });

    // Tests that a 404 status code and error message is returned when the user does not exist
    it('test_user_does_not_exist', async () => {
        const req: Partial<Request> = {
            params: {
                userId: '1'
            }
        };
        const res = {
            status: jest.fn().mockReturnThis(),
            send: jest.fn()
        } as unknown as Response;
        const next: NextFunction = jest.fn();

        const responseDelete = { error: 'Usuario no encontrado', status: 404 };
        (deleteUsuarioService as jest.MockedFunction<typeof deleteUsuarioService>).mockResolvedValueOnce(responseDelete);

        await deleteUserController(req as any, res, next);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.send).toHaveBeenCalledWith({ msg: 'Usuario no encontrado' });
    });

    // Tests that a 500 status code and error message is returned when an error occurs during deletion
    it('test_error_during_deletion', async () => {
        const req: Partial<Request> = {
            params: {
                userId: '1'
            }
        };
        const res = {
            status: jest.fn().mockReturnThis(),
            send: jest.fn()
        } as unknown as Response;
        const next: NextFunction = jest.fn();

        (deleteUsuarioService as jest.MockedFunction<typeof deleteUsuarioService>).mockRejectedValueOnce(new Error('Database error'));

        await deleteUserController(req as any, res, next);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.send).toHaveBeenCalledWith({ msg: 'Error en el borrado de usuario: Database error' });
    });

    // Tests that the function calls the deleteUsuarioService function with the correct userId
    it('test_delete_usuario_service_called_with_correct_userId', async () => {
        const req: Partial<Request> = {
            params: {
                userId: '1'
            }
        };
        const res = {
            status: jest.fn().mockReturnThis(),
            send: jest.fn()
        } as unknown as Response;
        const next: NextFunction = jest.fn();

        await deleteUserController(req as any, res, next);

        expect(deleteUsuarioService).toHaveBeenCalledWith(req.params?.userId);
    });

    // Tests that the function returns a 400 status code and error message when the userId is missing from the request params
    it('test_missing_userId', async () => {
        const req: Request = {
            params: {}
        } as Request;
        const res = {
            status: jest.fn().mockReturnThis(),
            send: jest.fn()
        } as unknown as Response;
        const next: NextFunction = jest.fn();

        await deleteUserController(req, res, next);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.send).toHaveBeenCalledWith({ msg: 'Falta el userId en los parametros' });
    });

    // Tests that the function calls the handleHttp function when an error occurs and returns an error message
    it('test_error_handling', async () => {
        const req: Partial<Request> = {
            params: {
                userId: '1'
            }
        };
        const res = {
            status: jest.fn().mockReturnThis(),
            send: jest.fn()
        } as unknown as Response;
        const next: NextFunction = jest.fn();

        (deleteUsuarioService as jest.MockedFunction<typeof deleteUsuarioService>).mockRejectedValueOnce(new Error('Error'));

        await deleteUserController(req as any, res, next);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.send).toHaveBeenCalledWith({ msg: 'Error en el borrado de usuario: Error' });
    });
});
import { NextFunction } from "express";
import { saveSiteController } from "../../../../src/controllers/usersController";
import { saveSiteService } from "../../../../src/services/usuariosService";

jest.mock('../../../../src/services/usuariosService', () => {
    return {
        saveSiteService: jest.fn(),
    };
});

describe('saveSiteController_function', () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    // Tests that the function returns a 200 status code and a success message when the site is saved successfully
    it('test_save_site_successfully', async () => {
        const req = {
            body: {
                userId: 'exampleId',
                site: {
                    placeId: '123',
                    name: 'Test Site'
                }
            }
        };
        const res = {
            status: jest.fn().mockReturnThis(),
            send: jest.fn()
        };
        const next: NextFunction = jest.fn();

        (saveSiteService as jest.MockedFunction<typeof saveSiteService>).mockResolvedValueOnce({ status: 200 });

        await saveSiteController(req as any, res as any, next);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.send).toHaveBeenCalledWith({ msg: 'Sitio guardado correctamente' });
        expect(next).toHaveBeenCalled();
    });

    // Tests that the function returns a 404 status code and an error message when the user is not found
    it('test_user_not_found', async () => {
        const req = {
            body: {
                userId: 'nonExistingId',
                site: {
                    placeId: '123',
                    name: 'Test Site'
                }
            }
        };
        const res = {
            status: jest.fn().mockReturnThis(),
            send: jest.fn()
        };
        const next: NextFunction = jest.fn();

        const responseSave = {
            error: 'No hay un usuario registrado con ese id',
            status: 404
        };
        (saveSiteService as jest.MockedFunction<typeof saveSiteService>).mockResolvedValueOnce(responseSave);

        await saveSiteController(req as any, res as any, next);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.send).toHaveBeenCalledWith({ msg: 'No hay un usuario registrado con ese id' });
        expect(next).toHaveBeenCalled();
    });

    //Test that the function returns a 400 status code and an error message when the email is not provided
    it('test_email_not_provided', async () => {
        const req = {
            body: {}
        };
        const res = {
            status: jest.fn().mockReturnThis(),
            send: jest.fn()
        };
        const next: NextFunction = jest.fn();
        
        await saveSiteController(req as any, res as any, next);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.send).toHaveBeenCalledWith({ msg: 'Faltan datos en el body' });
        expect(next).toHaveBeenCalled();
    });

    // Tests that the function returns a 409 status code and an error message when the site is already saved
    it('test_site_already_saved', async () => {
        const req = {
            body: {
                userId: 'exampleId',
                site: {
                    placeId: '123',
                    name: 'Test Site'
                }
            }
        };
        const res = {
            status: jest.fn().mockReturnThis(),
            send: jest.fn()
        };
        const next: NextFunction = jest.fn();

        const responseSave = {
            error: 'El sitio ya está guardado',
            status: 409
        };
        (saveSiteService as jest.MockedFunction<typeof saveSiteService>).mockResolvedValueOnce(responseSave);

        await saveSiteController(req as any, res as any, next);

        expect(res.status).toHaveBeenCalledWith(409);
        expect(res.send).toHaveBeenCalledWith({ msg: 'El sitio ya está guardado' });
        expect(next).toHaveBeenCalled();
    });

    // Tests that the function returns a 500 status code and an error message when the site cannot be saved
    it('test_site_cannot_be_saved', async () => {
        const req = {
            body: {
                userId: 'exampleId',
                site: {
                    placeId: '123',
                    name: 'Test Site'
                }
            }
        };
        const res = {
            status: jest.fn().mockReturnThis(),
            send: jest.fn()
        };
        const next: NextFunction = jest.fn();

        const responseSave = {
            error: 'No se pudo guardar el sitio',
            status: 500
        };
        (saveSiteService as jest.MockedFunction<typeof saveSiteService>).mockResolvedValueOnce(responseSave);

        await saveSiteController(req as any, res as any, next);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.send).toHaveBeenCalledWith({ msg: 'No se pudo guardar el sitio' });
        expect(next).toHaveBeenCalled();
    });

    // Tests that the function returns a 500 status code and an error message when an exception is thrown
    it('test_exception_thrown', async () => {
        const req = {
            body: {
                userId: 'exampleId',
                site: {
                    placeId: '123',
                    name: 'Test Site'
                }
            }
        };
        const res = {
            status: jest.fn().mockReturnThis(),
            send: jest.fn()
        };
        const next: NextFunction = jest.fn();

        (saveSiteService as jest.MockedFunction<typeof saveSiteService>).mockRejectedValueOnce(new Error('Test Error'));

        await saveSiteController(req as any, res as any, next);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.send).toHaveBeenCalledWith({ msg: 'Error en guardado de sitio: Test Error' });
        expect(next).toHaveBeenCalled();
    });
});
import { unsaveSiteController } from "../../../../src/controllers/usersController";
import { unsaveSiteService } from "../../../../src/services/usuariosService";

jest.mock("../../../../src/services/usuariosService", () => ({
    unsaveSiteService: jest.fn()
}));

describe('unsaveSiteController_function', () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    // Tests that the function responds with status 400 and an error message when the email or placeId is missing from the request body
    it('responds with status 400 and an error message when email or placeId is missing', async () => {
        const req = { body: {} };
        const res = { status: jest.fn().mockReturnThis(), send: jest.fn() };
        const next = jest.fn();

        await unsaveSiteController(req as any, res as any, next);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.send).toHaveBeenCalledWith({ msg: 'Faltan datos en el body' });
    });

    // Tests that the function responds with status 404 and an error message when the user is not found in the database
    it('responds with status 404 and an error message when user is not found', async () => {
        const req = { body: { userId: 'nonexistentId', placeId: '123' } };
        const res = { status: jest.fn().mockReturnThis(), send: jest.fn() };
        const next = jest.fn();

        (unsaveSiteService as jest.MockedFunction<typeof unsaveSiteService>).mockResolvedValueOnce({ error: 'No hay un usuario registrado con ese email', status: 404 });

        await unsaveSiteController(req as any, res as any, next);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.send).toHaveBeenCalledWith({ msg: 'No hay un usuario registrado con ese email' });
    });

    // Tests that the function responds with status 409 and an error message when the site has already been removed from the user's saved list
    it('responds with status 409 and an error message when site has already been removed', async () => {
        const req = { body: { userId: 'exampleId', placeId: '123' } };
        const res = { status: jest.fn().mockReturnThis(), send: jest.fn() };
        const next = jest.fn();
        (unsaveSiteService as jest.MockedFunction<typeof unsaveSiteService>).mockResolvedValueOnce({ error: 'El sitio ya se ha eliminado de la lista de guardados', status: 409 });

        await unsaveSiteController(req as any, res as any, next);

        expect(res.status).toHaveBeenCalledWith(409);
        expect(res.send).toHaveBeenCalledWith({ msg: 'El sitio ya se ha eliminado de la lista de guardados' });
    });

    // Tests that the function responds with status 500 and an error message when the site could not be removed from the user's saved list
    it('responds with status 500 and an error message when site could not be removed', async () => {
        const req = { body: { userId: 'exampleId', placeId: '123' } };
        const res = { status: jest.fn().mockReturnThis(), send: jest.fn() };
        const next = jest.fn();
        (unsaveSiteService as jest.MockedFunction<typeof unsaveSiteService>).mockResolvedValueOnce({ error: 'No se pudo guardar el sitio', status: 500 });

        await unsaveSiteController(req as any, res as any, next);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.send).toHaveBeenCalledWith({ msg: 'No se pudo guardar el sitio' });
    });

    // Tests that the function responds with status 200 and a success message when the site is successfully removed from the user's saved list
    it('responds with status 200 and a success message when site is successfully removed', async () => {
        const req = { body: { userId: 'exampleId', placeId: '123' } };
        const res = { status: jest.fn().mockReturnThis(), send: jest.fn() };
        const next = jest.fn();
        (unsaveSiteService as jest.MockedFunction<typeof unsaveSiteService>).mockResolvedValueOnce({ status: 200 });

        await unsaveSiteController(req as any, res as any, next);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.send).toHaveBeenCalledWith({ msg: 'Sitio eliminado correctamente de la lista de guardados' });
    });

    // Tests that the function responds with a custom error message when the 'handleHttp' function is called with an error message
    it('responds with a custom error message when handleHttp is called with an error message', async () => {
        const req = { body: { userId: 'exampleId', placeId: '123' } };
        const res = { status: jest.fn().mockReturnThis(), send: jest.fn() };
        const next = jest.fn();
        (unsaveSiteService as jest.MockedFunction<typeof unsaveSiteService>).mockRejectedValueOnce(new Error('Database connection failed'));

        await unsaveSiteController(req as any, res as any, next);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.send).toHaveBeenCalledWith({ msg: 'Error en guardado de sitio: Database connection failed' });
    });
});

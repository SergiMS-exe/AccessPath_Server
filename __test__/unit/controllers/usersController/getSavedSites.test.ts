import { getSavedSitesController } from "../../../../src/controllers/usersController";
import { getSavedSitesService } from "../../../../src/services/usuariosService";

jest.mock("../../../../src/services/usuariosService", () => ({
    getSavedSitesService: jest.fn()
}));

describe('getSavedSitesController_function', () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    // Tests that 404 status code and error message are returned when user does not exist
    it('should return 404 status code and error message when user does not exist', async () => {
        const req = { params: { userId: 'nonexistentuser' } };
        const res = { status: jest.fn().mockReturnThis(), send: jest.fn() };
        const next = jest.fn();

        (getSavedSitesService as jest.MockedFunction<typeof getSavedSitesService>).mockResolvedValueOnce(
            {
                error: 'No hay un usuario registrado con ese email',
                status: 404
            }
        );

        await getSavedSitesController(req as any, res as any, next);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.send).toHaveBeenCalledWith({ msg: 'No hay un usuario registrado con ese email' });
    });

    // Tests that 404 status code and error message are returned when user exists but has no saved sites
    it('should return 404 status code and error message when user exists but has no saved sites', async () => {
        const req = { params: { userId: 'nosavedsites@example.com' } };
        const res = { status: jest.fn().mockReturnThis(), send: jest.fn() };
        const next = jest.fn();

        (getSavedSitesService as jest.MockedFunction<typeof getSavedSitesService>).mockResolvedValueOnce(
            {
                error: 'No hay sitios guardados',
                status: 404
            }
        );

        await getSavedSitesController(req as any, res as any, next);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.send).toHaveBeenCalledWith({ msg: 'No hay sitios guardados' });
    });

    // Tests that 200 status code and saved sites are returned when user exists and has saved sites
    it('should return 200 status code and saved sites when user exists and has saved sites', async () => {
        const req = { params: { userId: 'userid123' } };
        const res = { status: jest.fn().mockReturnThis(), send: jest.fn() };
        const next = jest.fn();

        (getSavedSitesService as jest.MockedFunction<typeof getSavedSitesService>).mockResolvedValueOnce(
            {
                savedSites: [{ placeId: '123', name: 'Saved Site' }] as any
            }
        );

        await getSavedSitesController(req as any, res as any, next);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.send).toHaveBeenCalledWith({ msg: 'Sitios obtenidos correctamente', saved: [{ placeId: '123', name: 'Saved Site' }] });
    });

    // Tests that 500 status code and error message are returned when getSavedSitesService throws an error
    it('should return 500 status code and error message when getSavedSitesService throws an error', async () => {
        const req = { params: { userId: 'errorexample@example.com' } };
        const res = { status: jest.fn().mockReturnThis(), send: jest.fn() };
        const next = jest.fn();

        (getSavedSitesService as jest.MockedFunction<typeof getSavedSitesService>).mockRejectedValueOnce(new Error('Error in getSavedSitesService'));

        await getSavedSitesController(req as any, res as any, next);

        expect(res.status).toHaveBeenCalledWith(500)
        expect(res.send).toHaveBeenCalledWith({ msg: 'Error en guardado de sitio: Error in getSavedSitesService' })
    });

    // Tests that 400 status code and error message are returned when userId is missing from params
    it('should return 400 with error message when userId is missing from params', async () => {
        const req = { params: {} };
        const res = { status: jest.fn().mockReturnThis(), send: jest.fn() };
        const next = jest.fn();

        (getSavedSitesService as jest.MockedFunction<typeof getSavedSitesService>).mockResolvedValueOnce(
            {
                error: 'Falta el userId en los parametros',
                status: 400
            }
        );

        await getSavedSitesController(req as any, res as any, next);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.send).toHaveBeenCalledWith({ msg: 'Falta el userId en los parametros' });
    });

});

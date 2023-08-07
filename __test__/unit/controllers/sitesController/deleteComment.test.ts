import { deleteCommentController } from "../../../../src/controllers/sitiosController";
import { deleteCommentService } from "../../../../src/services/sitiosService";

jest.mock('../../../../src/services/sitiosService', () => {
    return {
        deleteCommentService: jest.fn(),
    };
});

describe('deleteCommentController', () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    // Tests that 200 status code and success message are returned when comment is deleted successfully
    it('should return 200 status code and success message when comment is deleted successfully', async () => {
        const req = {
            body: {
                comment: { _id: 'commentId', userId: 'userId' },
                placeId: 'placeId'
            }
        } as any;
        const res = {
            status: jest.fn().mockReturnThis(),
            send: jest.fn()
        } as any;
        const next = jest.fn();

        const deleteCommentResponse = { msg: 'Comentario eliminado correctamente', newPlace: { comments: [] } } as any;

        (deleteCommentService as jest.MockedFunction<typeof deleteCommentService>).mockResolvedValueOnce(deleteCommentResponse);
        await deleteCommentController(req, res, next)

        expect(res.status).toHaveBeenCalledWith(200)
        expect(res.send).toHaveBeenCalledWith({ msg: 'Comentario eliminado correctamente', comment: req.body.comment })
    });

    // Tests that 400 status code and error message are returned when required data is missing from the request body
    it('should return 400 status code and error message when required data is missing from the request body', async () => {
        const req = {
            body: {}
        } as any;
        const res = {
            status: jest.fn().mockReturnThis(),
            send: jest.fn()
        } as any;
        const next = jest.fn()

        await deleteCommentController(req, res, next)

        expect(res.status).toHaveBeenCalledWith(400)
        expect(res.send).toHaveBeenCalledWith({ msg: 'Faltan datos en el body' })
    });

    // Tests that 500 status code and error message are returned when an error occurs while deleting the comment
    it('should return 500 status code and error message when an error occurs while deleting the comment', async () => {
        const req = {
            body: {
                comment: { _id: 'commentId', userId: 'userId' },
                placeId: 'placeId'
            }
        } as any;
        const res = {
            status: jest.fn().mockReturnThis(),
            send: jest.fn()
        } as any;
        const next = jest.fn()

        const deleteCommentResponse = { error: 'No se pudo eliminar el comentario', status: 500 } as any;
        (deleteCommentService as jest.MockedFunction<typeof deleteCommentService>).mockResolvedValueOnce(deleteCommentResponse);
        await deleteCommentController(req, res, next)

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.send).toHaveBeenCalledWith({ msg: 'No se pudo eliminar el comentario' })
    });

    // Tests that 404 status code and error message are returned when no sitio is found with the given placeId
    it('should return 404 status code and error message when no sitio is found with the given placeId', async () => {
        const req = {
            body: {
                comment: { _id: 'commentId', userId: 'userId' },
                placeId: 'placeId'
            }
        } as any;
        const res = {
            status: jest.fn().mockReturnThis(),
            send: jest.fn()
        } as any;
        const next = jest.fn()

        const deleteCommentResponse = { error: 'No hay un sitio registrado con ese placeId', status: 404 } as any;

        (deleteCommentService as jest.MockedFunction<typeof deleteCommentService>).mockResolvedValueOnce(deleteCommentResponse);

        await deleteCommentController(req, res, next)

        expect(res.status).toHaveBeenCalledWith(404)
        expect(res.send).toHaveBeenCalledWith({ msg: 'No hay un sitio registrado con ese placeId' })
    });

});

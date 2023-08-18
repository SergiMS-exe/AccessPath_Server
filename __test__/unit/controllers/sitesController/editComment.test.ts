import { editCommentController } from "../../../../src/controllers/sitiosController";
import { editCommentService } from "../../../../src/services/sitiosService";

jest.mock('../../../../src/services/sitiosService', () => {
    return {
        editCommentService: jest.fn(),
    };
});

describe('editCommentController', () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    // Tests that a valid request body results in a successful comment edit
    it('should edit comment when request body is valid', async () => {
        const req = {
            params: {
                placeId: 'placeId'
            },
            body: {
                commentId: 'commentId',
                newText: 'newText'
            }
        } as any;
        const res = { status: jest.fn().mockReturnThis(), send: jest.fn() };
        const next = jest.fn();
        const serviceResponse = { editedComment: { _id: '123', texto: 'new comment', userId: '456' } } as any;
        (editCommentService as jest.MockedFunction<typeof editCommentService>).mockResolvedValueOnce(serviceResponse);

        await editCommentController(req as any, res as any, next);

        expect(editCommentService).toHaveBeenCalled();
        expect(res.send).toHaveBeenCalledWith({ msg: 'Comentario editado correctamente', newComment: serviceResponse.editedComment });
        expect(next).toHaveBeenCalled();
    });

    // Tests that a comment not found in place results in a 404 error
    it('should return 404 error when comment is not found in place', async () => {
        const req = {
            params: {
                placeId: 'placeId'
            },
            body: {
                commentId: 'unknownCommentId',
                newText: 'newText'
            }
        } as any;
        const res = { status: jest.fn().mockReturnThis(), send: jest.fn() } as any;
        const serviceResponse = { error: 'No hay un sitio registrado con ese placeId', status: 404 };
        const next = jest.fn();
        
        (editCommentService as jest.MockedFunction<typeof editCommentService>).mockResolvedValueOnce(serviceResponse);

        await editCommentController(req, res, next);

        expect(editCommentService).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(serviceResponse.status);
        expect(res.send).toHaveBeenCalledWith({ msg: serviceResponse.error });
        expect(next).toHaveBeenCalled();
    });

    // Tests that missing comment or placeId in request body results in a 400 error
    it('should return 400 error when comment or placeId is missing in request body', async () => {
        const req = { params: {}, body: {} } as any;
        const res = { status: jest.fn().mockReturnThis(), send: jest.fn() } as any;
        const next = jest.fn();

        await editCommentController(req, res, next);

        expect(editCommentService).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.send).toHaveBeenCalledWith({ msg: 'Faltan datos en los parametros' });
        expect(next).toHaveBeenCalled();
    });

    // Tests that an error in editCommentService results in a 500 error
    it('should return 500 error when editCommentService throws an error', async () => {
        const req = {
            params: {
                placeId: 'placeId'
            },
            body: {
                commentId: 'commentId',
                newText: 'newText'
            }
        } as any;
        const res = { status: jest.fn().mockReturnThis(), send: jest.fn() } as any;
        const next = jest.fn();

        const errorMessage = 'Error in editCommentService';
        (editCommentService as jest.MockedFunction<typeof editCommentService>).mockRejectedValueOnce(errorMessage);

        await editCommentController(req, res, next);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.send).toHaveBeenCalledWith({ msg: 'Error en la edicion de comentario: '+errorMessage });
        expect(next).toHaveBeenCalled();
    });

    // Tests that empty comment text results in a 400 error
    it('should return 400 error when comment text is empty', async () => {
        const req = {
            params: {
                placeId: 'placeId'
            },
            body: {
                commentId: 'commentId',
                newText: ''
            }
        } as any;
        const res = { status: jest.fn().mockReturnThis(), send: jest.fn() } as any;
        const next = jest.fn();

        await editCommentController(req, res, next);

        expect(editCommentService).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.send).toHaveBeenCalledWith({ msg: 'Faltan datos en el body' });
        expect(next).toHaveBeenCalled();
    });

    // Tests that a comment with non-existent userId results in null comment in response
    it('should return null comment when userId does not exist in edited comment', async () => {
        const req = {
            params: {
                placeId: 'placeId'
            },
            body: {
                commentId: 'commentId',
                newText: 'newText'
            }
        } as any;
        const res = { send: jest.fn() } as any;
        const next = jest.fn();

        const editCommentResponse = { newPlace: { comments: [{ _id: '123', texto: 'new comment', userId: '789' }] } } as any;
        (editCommentService as jest.MockedFunction<typeof editCommentService>).mockResolvedValueOnce(editCommentResponse);

        await editCommentController(req, res, next);

        expect(editCommentService).toHaveBeenCalled();
        expect(res.send).toHaveBeenCalledWith({ msg: 'Comentario editado correctamente', comment: undefined });
        expect(next).toHaveBeenCalled();
    });
});

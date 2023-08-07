import { NextFunction } from "express";
import { postCommentController } from "../../../../src/controllers/sitiosController";
import { postCommentService } from "../../../../src/services/sitiosService";

jest.mock('../../../../src/services/sitiosService', () => {
    return {
        postCommentService: jest.fn(),
    };
});

describe('postCommentController', () => {
    
    beforeEach(() => {
        jest.clearAllMocks();
    });

    // Tests that a comment can be successfully posted
    it('should post a comment when valid comment and placeId are provided', async () => {
        const myComment = { userId: 'user1', text: 'test comment' };
        const req = { body: { comment: myComment, placeId: 'place1' } };
        const res = { 
            status: jest.fn().mockReturnThis(),
            send: jest.fn() 
        };
        const next: NextFunction = jest.fn();

        const serviceResponse = { 
            status: 200, 
            newPlace: {
                comments: [
                    myComment
                ]
            }
        } as any;
        
        (postCommentService as jest.MockedFunction<typeof postCommentService>).mockResolvedValueOnce(serviceResponse);

        await postCommentController(req as any, res as any, next);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.send).toHaveBeenCalledWith({ msg: 'Comentario enviado correctamente', comment: myComment });
        expect(next).toHaveBeenCalled();
    });

    // Tests that an error is thrown when the comment is missing in the request body
    it('should throw an error when comment is missing in the request body', async () => {
        const req = { body: { placeId: 'place1' } };
        const res = { status: jest.fn().mockReturnThis(), send: jest.fn() };
        const next: NextFunction = jest.fn();

        await postCommentController(req as any, res as any, next);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.send).toHaveBeenCalledWith({ msg: "Faltan datos en el body" });
        expect(next).toHaveBeenCalled();
    });

    // Tests that an error is thrown when the placeId is missing in the request body
    it('should throw an error when placeId is missing in the request body', async () => {
        const req = { body: { comment: { userId: 'user1', text: 'test comment' } } };
        const res = { status: jest.fn().mockReturnThis(), send: jest.fn() };
        const next: NextFunction = jest.fn();

        await postCommentController(req as any, res as any, next);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.send).toHaveBeenCalledWith({ msg: "Faltan datos en el body" });
        expect(next).toHaveBeenCalled();
    });

    // Tests that an error is thrown when there is an error while posting the comment
    it('should throw an error when there is an error while posting the comment', async () => {
        const req = { body: { comment: { userId: 'user1', text: 'test comment' }, placeId: 'invalidPlaceId' } };
        const res = { status: jest.fn().mockReturnThis(), send: jest.fn() };
        const next: NextFunction = jest.fn();
        const serviceResponse = { error: "No se pudo guardar el comentario", status: 500 };

        (postCommentService as jest.MockedFunction<typeof postCommentService>).mockResolvedValueOnce(serviceResponse);

        await postCommentController(req as any, res as any, next);
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.send).toHaveBeenCalledWith({ msg: 'No se pudo guardar el comentario' });
        expect(next).toHaveBeenCalled();
    });

    // Tests that an error is thrown when an invalid placeId is provided in the request body
    it('should throw an error when an invalid placeId is provided in the request body', async () => {
        const req = { body: { comment: { userId: 'user1', text: 'test comment' }, placeId: 'invalidPlaceId' } };
        const res = { status: jest.fn().mockReturnThis(), send: jest.fn() };
        const next: NextFunction = jest.fn();

        (postCommentService as jest.MockedFunction<typeof postCommentService>).mockRejectedValueOnce(new Error('CastError: Cast to ObjectId failed for value \'invalidPlaceId\' at path \'placeId\''));

        await postCommentController(req as any, res as any, next);
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.send).toHaveBeenCalledWith({ msg: 'Error en el envio de comentario: Error: CastError: Cast to ObjectId failed for value \'invalidPlaceId\' at path \'placeId\'' });
        expect(next).toHaveBeenCalled();
    });
});

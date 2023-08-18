import { NextFunction } from "express";
import { postCommentController } from "../../../../src/controllers/sitiosController";
import { postCommentService } from "../../../../src/services/sitiosService";
import { ObjectId } from "mongodb";

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
        const myComment = { usuarioId: 'user1', texto: 'test comment' };
        const req = { body: { comment: myComment, site: 'place1' } };
    
        const res = { 
            status: jest.fn().mockReturnThis(),
            send: jest.fn() 
        };
        const next: NextFunction = jest.fn();
    
        // Including the additional properties that get added in the service
        const returnedComment = {
            ...myComment,
            _id: new ObjectId(), // Mocked ObjectID, you might want to fix this to a specific value for the test
            date: new Date(),    // Mocked Date, you might want to fix this to a specific value for the test
        };
    
        const serviceResponse = { 
            status: 200, 
            newPlace: {
                comments: [
                    returnedComment
                ]
            },
            comment: returnedComment
        } as any;
        
        (postCommentService as jest.MockedFunction<typeof postCommentService>).mockResolvedValueOnce(serviceResponse);
    
        await postCommentController(req as any, res as any, next);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.send).toHaveBeenCalledWith({ msg: 'Comentario enviado correctamente', comment: returnedComment });
        expect(next).toHaveBeenCalled();
    });
    

    // Tests that an error is thrown when the comment is missing in the request body
    it('should throw an error when comment is missing in the request body', async () => {
        const req = { body: { site: 'place1' } };
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
        const req = { 
            body: { 
                comment: { usuarioId: 'user1', texto: 'test comment' }, 
                site: 'invalidPlaceId' 
            } 
        };
        const res = { 
            status: jest.fn().mockReturnThis(), 
            send: jest.fn() 
        };
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
        const req = { 
            body: { 
                comment: { usuarioId: 'user1', texto: 'test comment' }, 
                site: 'invalidPlaceId' 
            } 
        };
        const res = { 
            status: jest.fn().mockReturnThis(), 
            send: jest.fn() 
        };
        const next: NextFunction = jest.fn();
    
        (postCommentService as jest.MockedFunction<typeof postCommentService>).mockRejectedValueOnce(new Error('CastError: Cast to ObjectId failed for value \'invalidPlaceId\' at path \'placeId\''));
    
        await postCommentController(req as any, res as any, next);
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.send).toHaveBeenCalledWith({ msg: 'Error en el envio de comentario: Error: CastError: Cast to ObjectId failed for value \'invalidPlaceId\' at path \'placeId\'' });
        expect(next).toHaveBeenCalled();
    });
    
});

import { Types } from 'mongoose';

jest.mock('../../../src/models/sitioModel');
import SitioModel from '../../../src/models/sitioModel';
const mockedSiteModel = SitioModel as jest.Mocked<typeof SitioModel>;

jest.mock('../../../src/models/usuarioModel');
import UsuarioModel from '../../../src/models/usuarioModel';
const mockedUserModel = UsuarioModel as jest.Mocked<typeof UsuarioModel>;

jest.mock('../../../src/models/valoracionModel');
import ValoracionModel from '../../../src/models/valoracionModel';
const mockedValoracionModel = ValoracionModel as jest.Mocked<typeof ValoracionModel>;

jest.mock('../../../src/utils/auxiliar.handle');
import { updateAverages } from '../../../src/utils/auxiliar.handle';
const mockedUpdateAverages = updateAverages as jest.MockedFunction<typeof updateAverages>;

jest.mock('../../../src/utils/google.handle');
import { handleFindSitesByTextGoogle } from '../../../src/utils/google.handle';
const mockedHandleFindSitesByTextGoogle = handleFindSitesByTextGoogle as jest.MockedFunction<typeof handleFindSitesByTextGoogle>;

import * as siteService from '../../../src/services/sitiosService';
import { Photo, Site } from '../../../src/interfaces/Site';
import { usuarios, valoraciones } from '../../../src/utils/testDB';
import { ObjectId } from 'mongodb';

describe('siteService', () => {

    afterEach(() => {
        jest.clearAllMocks();
    });
    const site1: Site = {
        placeId: 'site1',
        nombre: 'Site 1',
        location: {
            latitude: 40.712776,
            longitude: -74.005974
        },
        direccion: 'Site 1 address',
        types: ['type1', 'type2'],
        calificacionGoogle: 5,
        comentarios: [{
            _id: new Types.ObjectId(),
            usuarioId: '12345',
            texto: 'Great place to visit!',
            date: new Date()
        },
        {
            _id: new Types.ObjectId(),
            usuarioId: '12345',
            texto: 'Great place to visit!',
            date: new Date()
        }],
        valoraciones: {
            fisica: {
                entrada: 5,
                taza_bano: 5,
                rampas: 4,
                ascensores: 5,
                pasillos: 5,
                banos_adaptados: 4,
                senaletica_clara: 5
            },
            sensorial: {
                senaletica_braille: 5,
                sistemas_amplificacion: 3,
                iluminacion_adecuada: 4,
                informacion_accesible: 4,
                pictogramas_claros: 4

            },
            psiquica: {
                informacion_simple: 5,
                senaletica_intuitiva: 4,
                espacios_tranquilos: 4,
                interaccion_personal: 4
            }
        }
    };

    const site2: Site = {
        placeId: 'site2',
        nombre: 'Site 2',
        location: {
            latitude: 40.722776,
            longitude: -74.015974
        },
        direccion: 'Site 2 address',
        types: ['type1', 'type2'],
        calificacionGoogle: 5,
        fotos: [{
            usuarioId: '123456',
            base64: 'base64EncodedString',
            alternativeText: 'Site 2'
        },
        {
            usuarioId: '12345',
            base64: 'base64EncodedString',
            alternativeText: 'Site 2'
        }],
    };

    describe('getClosePlacesService', () => {

        it('SSer1 -> Caso positivo: Búsqueda de lugares cercanos con datos válidos', async () => {
            mockedSiteModel.find = jest.fn().mockReturnValue({
                limit: jest.fn().mockResolvedValue([site1, site2])
            });

            const location = { latitude: 40.712776, longitude: -74.005974 };
            const result = await siteService.getClosePlacesService(location, 1000, 10);

            expect(result).toHaveProperty('sitios');
            expect(result.sitios).toEqual([site1, site2]);
        });

        it('SSer2 -> Caso negativo: Ubicación válida, pero la base de datos no retorna sitios', async () => {
            mockedSiteModel.find = jest.fn().mockReturnValue({
                limit: jest.fn().mockResolvedValue(undefined)
            });

            const location = { latitude: 40.712776, longitude: -74.005974 };
            const result = await siteService.getClosePlacesService(location, 1000, 10);

            expect(result).toEqual({ error: "No se pudo encontrar ningun lugar cercano", status: 404 });
        });
    });

    describe('getPlacesByTextService', () => {
        afterEach(() => {
            jest.clearAllMocks();
        });

        it('SSer3 -> Caso positivo: Búsqueda de lugares por texto con datos válidos', async () => {
            // Los sitios retornados por la API de Google no tienen los campos de comentarios, valoraciones y fotos
            const googlePlacesSite1 = { ...site1, comentarios: undefined, valoraciones: undefined, fotos: undefined };
            const googlePlacesSite2 = { ...site2, comentarios: undefined, valoraciones: undefined, fotos: undefined };

            // Mockeo de la función que llama a la API de Google
            mockedHandleFindSitesByTextGoogle.mockResolvedValue([googlePlacesSite1, googlePlacesSite2]);

            // Mockeo de la función que busca los sitios en la base de datos
            mockedSiteModel.find = jest.fn().mockResolvedValue([site1, site2]);

            const searchText = 'texto de búsqueda';
            const result = await siteService.getPlacesByTextService(searchText);

            expect(mockedHandleFindSitesByTextGoogle).toHaveBeenCalledWith(searchText);
            expect(result).toHaveProperty('sitios');
            expect(result.sitios).toEqual([site1, site2]);
        });

        it('SSer4 -> Caso negativo: Error al conectarse con la API de Google Places', async () => {
            // Mockeo de la función que llama a la API de Google para que retorne un error
            mockedHandleFindSitesByTextGoogle.mockRejectedValue(new Error('Google Places API error'));

            const searchText = 'busqueda de texto';
            const result = await siteService.getPlacesByTextService(searchText);

            expect(mockedHandleFindSitesByTextGoogle).toHaveBeenCalledWith(searchText);
            expect(result).toEqual({ error: "Error al buscar sitios en Google Places: Google Places API error", status: 500 });
        });

        it('SSer5 -> Caso negativo: Error al buscar sitios en la base de datos', async () => {
            // Mockeo de la función que llama a la API de Google
            const googlePlacesSite1 = { ...site1, comentarios: undefined, valoraciones: undefined, fotos: undefined };
            const googlePlacesSite2 = { ...site2, comentarios: undefined, valoraciones: undefined, fotos: undefined };
            mockedHandleFindSitesByTextGoogle.mockResolvedValue([googlePlacesSite1, googlePlacesSite2]);

            // Mockeo de la función que busca los sitios en la base de datos para que retorne un error
            mockedSiteModel.find = jest.fn().mockRejectedValue(new Error('Database error'));

            const searchText = 'busqueda de texto';
            const result = await siteService.getPlacesByTextService(searchText);

            expect(mockedHandleFindSitesByTextGoogle).toHaveBeenCalledWith(searchText);
            expect(result).toEqual({ error: "Error al buscar sitios en la base de datos: Database error", status: 500 });
        });

    });

    describe('postCommentService', () => {
        afterEach(() => {
            jest.clearAllMocks();
        });

        it('SSer6 -> Caso positivo: Enviar comentario con datos válidos y sitio no existente en BD', async () => {
            // Simular que el sitio no existe en la base de datos
            mockedSiteModel.findOne.mockResolvedValue(null);

            const comentario = { texto: 'Muy buen lugar', usuarioId: 'usuario123' };
            const comentarioEsperado = expect.objectContaining(comentario);

            const result = await siteService.postCommentService(comentario, site2);

            expect(mockedSiteModel.findOne).toHaveBeenCalledWith({ placeId: site2.placeId });
            expect(mockedSiteModel.prototype.save).toHaveBeenCalled();

            // Asegúrate de que la estructura del objeto esperado coincida con lo que devuelve tu función
            expect(result).toEqual({ status: 200, newPlace: expect.objectContaining({ ...site2, comentarios: [comentarioEsperado] }), comment: comentarioEsperado });
        });

        it('SSer7 -> Caso positivo: Enviar comentario con datos válidos y sitio existente en BD', async () => {
            // Simular que el sitio existe en la base de datos
            mockedSiteModel.findOne.mockResolvedValue(new SitioModel(site1));
            //mockear el save
            mockedSiteModel.prototype.save.mockResolvedValue(site1);
            const comentario = { texto: 'Excelente experiencia', usuarioId: 'usuario456' };

            const result = await siteService.postCommentService(comentario, site1);

            expect(mockedSiteModel.findOne).toHaveBeenCalledWith({ placeId: site1.placeId });
            expect(mockedSiteModel.prototype.save).toHaveBeenCalled();
            expect(result.status).toBe(200);
            expect(result.comment).toEqual(expect.objectContaining(comentario));
        });

        it('SSer8 -> Caso negativo: Error al guardar el comentario en BD', async () => {
            // Simular que el sitio existe, pero ocurre un error al guardar el comentario
            mockedSiteModel.findOne.mockResolvedValue(new SitioModel(site1));
            mockedSiteModel.prototype.save.mockRejectedValue(new Error('Error de BD'));

            const comentario = { texto: 'Comentario interesante', usuarioId: 'usuario789' };

            const result = await siteService.postCommentService(comentario, site1);

            expect(mockedSiteModel.findOne).toHaveBeenCalledWith({ placeId: site1.placeId });
            expect(result).toEqual({ error: "Error al guardar el comentario: Error de BD", status: 500 });
        });
    });

    describe('editCommentService', () => {
        it('SSer9 -> Caso positivo: Editar comentario existente con datos válidos y sitio existente en BD', async () => {
            const placeId = site1.placeId;
            const commentId = site1.comentarios![0]._id.toString();
            const newText = 'Texto editado';

            const updateResultMock = {
                ok: 1,
                value: { ...site1, comentarios: [{ ...site1.comentarios![0], texto: newText }] }
            };

            mockedSiteModel.findOneAndUpdate.mockResolvedValue(updateResultMock);

            const result = await siteService.editCommentService(placeId, commentId, newText);

            expect(mockedSiteModel.findOneAndUpdate).toHaveBeenCalledWith(
                { placeId: placeId, "comentarios._id": commentId },
                { $set: { "comentarios.$.texto": newText } },
                { new: true, rawResult: true }
            );
            expect(result).toEqual({ status: 200, editedComment: expect.anything() });
        });

        it('SSer10 -> Caso negativo: Sitio no encontrado en BD', async () => {
            const placeId = 'nonexistentPlaceId';
            const commentId = 'nonexistentCommentId';
            const newText = 'Texto editado';

            const updateResultMock = {
                ok: 0,
                value: null
            };

            mockedSiteModel.findOneAndUpdate.mockResolvedValue(updateResultMock);

            const result = await siteService.editCommentService(placeId, commentId, newText);

            expect(result).toEqual({ error: "No hay un sitio registrado con ese placeId", status: 404 });
        });

        it('SSer11 -> Caso negativo: Error al editar el comentario en BD', async () => {
            const placeId = site1.placeId;
            const commentId = site1.comentarios![0]._id.toString();
            const newText = 'Texto editado';

            mockedSiteModel.findOneAndUpdate.mockRejectedValue(new Error('DB error'));

            const result = await siteService.editCommentService(placeId, commentId, newText);

            expect(result).toEqual({ error: "Error al editar el comentario: DB error", status: 500 });
        });
    });

    describe('deleteCommentService', () => {

        it('SSer12 -> Caso positivo: Eliminar comentario existente con sitio existente en BD', async () => {
            const placeId = site1.placeId;
            const commentId = site1.comentarios![0]._id.toString();

            const newPlace = { ...site1, comentarios: site1.comentarios!.filter(c => c._id.toString() !== commentId) };

            mockedSiteModel.findOneAndUpdate.mockResolvedValueOnce(newPlace);

            const result = await siteService.deleteCommentService(commentId, placeId);

            expect(result).toEqual({ newPlace });
        });

        it('SSer13 -> Caso negativo: Sitio no encontrado en BD', async () => {
            const placeId = 'nonexistentPlaceId';
            const commentId = 'nonexistentCommentId';

            mockedSiteModel.findOneAndUpdate.mockResolvedValueOnce(null);

            const result = await siteService.deleteCommentService(commentId, placeId);

            expect(result).toEqual({ error: "No se ha encontrado un sitio con ese id", status: 404 });
        });

        it('SSer14 -> Caso negativo: Error al eliminar el comentario en BD', async () => {
            const placeId = site1.placeId;
            const commentId = site1.comentarios![0]._id.toString();

            mockedSiteModel.findOneAndUpdate.mockRejectedValueOnce(new Error('DB error'));

            const result = await siteService.deleteCommentService(commentId, placeId);

            expect(result).toEqual({ error: "No se pudo eliminar el comentario", status: 500 });
        });

    });

    describe('getCommentsService', () => {
        it('SSer15 -> Caso positivo: Obtener comentarios de un sitio existente en BD', async () => {
            mockedSiteModel.findOne.mockResolvedValue(new SitioModel(site1));
            mockedSiteModel.prototype.toObject.mockReturnValue(site1);
            mockedUserModel.findOne.mockResolvedValue(usuarios[0])

            const placeId = site1.placeId;
            const result = await siteService.getCommentsService(placeId);

            expect(mockedSiteModel.findOne).toHaveBeenCalledWith({ placeId: placeId });
            expect(result).toEqual({ comentarios: expect.objectContaining(site1.comentarios) });
        });

        it('SSer16 -> Caso negativo: Sitio no encontrado en BD', async () => {
            mockedSiteModel.findOne.mockResolvedValue(null);

            const placeId = 'nonexistentPlaceId';
            const result = await siteService.getCommentsService(placeId);

            expect(result).toEqual({ comentarios: [] });
        });


    });

    describe('postReviewService', () => {
        it('SSer17 -> Caso positivo: Enviar valoración con datos válidos y sitio no existente en BD', async () => {
            const userId = 'someUserId';

            // Mock para simular que no se encuentra el sitio
            mockedSiteModel.findOne.mockResolvedValue(null);

            // Mock para simular la creación de la valoración
            mockedValoracionModel.create = jest.fn().mockResolvedValue(valoraciones[0]);
            mockedSiteModel.prototype.toObject.mockReturnValue(site1);

            // Mock para simular la actualización de promedios
            mockedUpdateAverages.mockResolvedValue({ status: 200, newPlace: { ...site1, _id: new ObjectId() } });

            const result = await siteService.postReviewService(userId, site1, valoraciones[0]);

            expect(mockedValoracionModel.create).toHaveBeenCalled();
            expect(updateAverages).toHaveBeenCalled();
            expect(result).toHaveProperty('newPlace');
        });


        it('SSer18 -> Caso positivo: Enviar valoración con datos válidos y sitio existente en BD', async () => {
            const userId = 'existingUserId';

            // Mock para simular la creación de la valoración y actualización de promedios
            mockedValoracionModel.create = jest.fn().mockResolvedValue(valoraciones[0]);
            mockedUpdateAverages.mockResolvedValue({ status: 200, newPlace: { ...site1, _id: new ObjectId() } });

            const result = await siteService.postReviewService(userId, site1, valoraciones[0]);

            expect(mockedValoracionModel.create).toHaveBeenCalled();
            expect(updateAverages).toHaveBeenCalledWith(site1);
            expect(result).toHaveProperty('newPlace');
        });


    });

    describe('editReviewService', () => {
        it('SSer21 -> Caso positivo: Editar valoración existente con datos válidos y sitio existente en BD', async () => {
            const placeId = valoraciones[0].placeId!;
            const userId = 'existingUserId';
            const nuevoValor = valoraciones[0].fisica?.senaletica_clara
            const valoracionEditada = { ...valoraciones[0], nuevoValor: 3 };

            // Mock para simular la edición de la valoración
            mockedValoracionModel.findOneAndUpdate.mockResolvedValue({ ok: 1, value: valoracionEditada });
            mockedUpdateAverages.mockResolvedValue({ status: 200, newPlace: { ...site1, _id: new ObjectId(), valoraciones: valoracionEditada } });

            const result = await siteService.editReviewService(placeId, userId, valoracionEditada);

            expect(mockedValoracionModel.findOneAndUpdate).toHaveBeenCalled();
            expect(updateAverages).toHaveBeenCalledWith(placeId);
            expect(result).toHaveProperty('newPlace');
            expect(result.status).toEqual(200);
        });

        it('SSer22 -> Caso negativo: Error al editar la valoración en BD', async () => {
            const placeId = site1.placeId;
            const userId = 'existingUserId';
            const nuevoValor = valoraciones[0].fisica?.senaletica_clara
            const valoracionEditada = { ...valoraciones[0], nuevoValor: 3 };

            // Simular un error al intentar editar la valoración
            mockedValoracionModel.findOneAndUpdate.mockRejectedValue(new Error('DB error'));

            const result = await siteService.editReviewService(placeId, userId, valoracionEditada);

            expect(mockedValoracionModel.findOneAndUpdate).toHaveBeenCalled();
            expect(result).toEqual({ error: "Error al editar la valoracion: DB error", status: 500 });
        });
    });

    describe('deleteReviewService', () => {
        it('SSer23 -> Caso positivo: Eliminar valoración existente con sitio existente en BD', async () => {
            const placeId = site1.placeId;
            const userId = 'existingUserId';

            // Mock para simular la eliminación de la valoración
            mockedValoracionModel.findOneAndDelete.mockResolvedValue({ placeId: placeId, userId: userId });
            mockedUpdateAverages.mockResolvedValue({ status: 200, newPlace: { ...site1, _id: new ObjectId() } });

            const result = await siteService.deleteReviewService(placeId, userId);

            expect(mockedValoracionModel.findOneAndDelete).toHaveBeenCalledWith({ placeId: placeId, userId: userId });
            expect(updateAverages).toHaveBeenCalledWith(placeId);
            expect(result).toHaveProperty('newPlace');
            expect(result.status).toEqual(200);
        });

        it('SSer24 -> Caso negativo: Error al eliminar la valoración en BD', async () => {
            const placeId = site1.placeId;
            const userId = 'existingUserId';

            // Simular un error al intentar eliminar la valoración
            mockedValoracionModel.findOneAndDelete.mockRejectedValue(new Error('DB error'));

            const result = await siteService.deleteReviewService(placeId, userId);

            expect(mockedValoracionModel.findOneAndDelete).toHaveBeenCalledWith({ placeId: placeId, userId: userId });
            expect(result).toEqual({ error: "Error al eliminar la valoracion: DB error", status: 500 });
        });

    });

    describe('postPhotoService', () => {
        afterEach(() => {
            jest.clearAllMocks();
        });
        const newPhoto: Photo = {
            usuarioId: 'existingUserId',
            base64: 'base64EncodedString',
            alternativeText: 'Site 2'
        };
        it('SSer25 -> Caso positivo: Enviar foto con datos válidos y sitio no existente en BD', async () => {

            // Simular que el sitio no existe en la base de datos
            mockedSiteModel.findOne.mockResolvedValue(null);
            mockedSiteModel.prototype.save.mockResolvedValue(site1);

            const result = await siteService.postPhotoService(site1, newPhoto);

            expect(mockedSiteModel.findOne).toHaveBeenCalledWith({ placeId: site1.placeId });
            expect(mockedSiteModel.prototype.save).toHaveBeenCalled();
            expect(result).toHaveProperty('newPlace');
        });

        it('SSer26 -> Caso positivo: Enviar foto con datos válidos y sitio existente en BD', async () => {

            // Simular que el sitio existe en la base de datos
            mockedSiteModel.findOne.mockResolvedValue(new SitioModel(site1));
            mockedSiteModel.prototype.save.mockResolvedValue(site1);

            const result = await siteService.postPhotoService(site1, newPhoto);

            expect(mockedSiteModel.findOne).toHaveBeenCalledWith({ placeId: site1.placeId });
            expect(mockedSiteModel.prototype.save).toHaveBeenCalled();
            expect(result).toHaveProperty('newPlace');
        });

        it('SSer29 -> Caso negativo: Error al eliminar la foto en BD', async () => {
            const photoId = 'photoId123';

            // Simular un error al intentar eliminar la foto
            mockedSiteModel.findOneAndUpdate.mockRejectedValue(new Error('DB error'));

            const result = await siteService.deletePhotoService(photoId);

            expect(result).toEqual({ error: "No se pudo eliminar la foto", status: 500 });
        });
    });

    describe('deletePhotoService', () => {
        it('SSer28 -> Caso positivo: Eliminar foto existente con sitio existente en BD', async () => {
            const photoId = 'photoId123';

            // Simular la respuesta de findOneAndUpdate con éxito
            mockedSiteModel.findOneAndUpdate.mockResolvedValue({
                ok: 1,
                value: { ...site1, fotos: site2.fotos!.splice(1) }
            });

            const result = await siteService.deletePhotoService(photoId);

            expect(result).toHaveProperty('newPlace');
        });

        it('SSer29 -> Caso negativo: Error al eliminar la foto en BD', async () => {
            const photoId = 'photoId123';

            // Simular un error al intentar eliminar la foto
            mockedSiteModel.findOneAndUpdate.mockRejectedValue(new Error('DB error'));

            const result = await siteService.deletePhotoService(photoId);

            expect(result).toEqual({ error: "No se pudo eliminar la foto", status: 500 });
        });


    });
});
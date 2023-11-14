import request from 'supertest';
import app from '../../src/app';
import { closeTestDb, initializeTestDb, setUpDBData, sitios, usuarios } from "../../src/utils/testDB";
import { Site } from '../../src/interfaces/Site';
import { Valoracion } from '../../src/interfaces/Valoracion';

describe('Test de integración de los sitios', () => {
    beforeAll(async () => {
        await initializeTestDb();
    });

    afterAll(async () => {
        await closeTestDb();
    });

    beforeEach(async () => {
        await setUpDBData();
    });

    describe('Obtener sitios cercanos', () => {

        it('InSi1 -> Caso positivo: Solicitar lugares cercanos con ubicación y parámetros válidos y existen sitios cercanos', async () => {
            const response = await request(app)
                .get('/sites/close')
                .query({ location: '-80.13320%19.4326077', radius: 100000, limit: 30 });

            expect(response.statusCode).toBe(200);
            expect(response.body.msg).toBe('Sitios cercanos obtenidos correctamente');
            expect(response.body).toHaveProperty('sites');
        });

        it('InSi2 -> Caso positivo: Solicitar lugares cercanos con una ubicación donde no hay sitios', async () => {
            const response = await request(app)
                .get('/sites/close')
                .query({ location: '0%0', radius: 100000, limit: 30 });

            expect(response.statusCode).toBe(200);
            expect(response.body.msg).toBe('Sitios cercanos obtenidos correctamente');
            expect(response.body.sites).toEqual([]); // Lista de sitios vacía
        });
    });

    describe('Publicar comentario', () => {

        it('InSi3 -> Caso positivo: Publicar un comentario en un sitio nuevo', async () => {
            const newComment = {
                texto: "Comentario de prueba",
                usuarioId: usuarios[0]._id
            };

            const newSite = {
                placeId: "place1",
                nombre: "Café Central",
                direccion: "Calle Falsa 123",
                calificacionGoogle: 4.2,
                location: {
                    type: "Point",
                    coordinates: [-80.133208, 19.4326077]
                },
                types: ["cafe", "bakery"],
            };

            const response = await request(app)
                .post('/sites/comment')
                .send({ comment: newComment, site: newSite });

            expect(response.statusCode).toBe(200);
            expect(response.body.msg).toBe('Comentario enviado correctamente');
        });

        it('InSi4 -> Caso positivo: Publicar un comentario en un sitio existente', async () => {
            const existingComment = {
                texto: "Otro comentario de prueba",
                usuarioId: usuarios[0]._id
            };

            const existingSite = sitios[0];

            const response = await request(app)
                .post('/sites/comment')
                .send({ comment: existingComment, site: existingSite });

            expect(response.statusCode).toBe(200);
            expect(response.body.msg).toBe('Comentario enviado correctamente');
        });

        it('InSi5 -> Caso negativo: Publicar un comentario con datos inválidos', async () => {
            const invalidComment = {
                texto: "",
                usuarioId: usuarios[0]._id
            };

            const site = sitios[0];

            const response = await request(app)
                .post('/sites/comment')
                .send({ comment: invalidComment, site: site });

            expect(response.statusCode).toBe(400);
            expect(response.body.msg).toBe('Faltan datos en el body');
        });
    });

    describe('Editar comentario', () => {
        it('InSi6 -> Caso positivo: Editar un comentario existente en un sitio', async () => {
            const site = sitios[0];
            const commentId = site.comentarios[0]._id;
            const newText = "Comentario editado";

            const response = await request(app)
                .put('/sites/comment/' + site.placeId)
                .send({ commentId: commentId, newText: newText });

            expect(response.statusCode).toBe(200);
            expect(response.body.msg).toBe('Comentario editado correctamente');
        });

        it('InSi7 -> Caso negativo: Intentar editar un comentario en un sitio que no existe', async () => {
            const nonExistentSiteId = '1234567890abcdef12345678';
            const commentId = '1234567890abcdef12345678';
            const newText = "Comentario inexistente";

            const response = await request(app)
                .put('/sites/comment/' + nonExistentSiteId)
                .send({ commentId: commentId, newText: newText });

            expect(response.statusCode).toBe(404);
            expect(response.body.msg).toBe('No hay un sitio registrado con ese placeId');
        });
    });

    describe('Eliminar comentario', () => {
        it('InSi8 -> Caso positivo: Eliminar un comentario existente de un sitio', async () => {
            const site = sitios[0]; // Asumiendo que sitios[0] es un sitio existente
            const commentId = site.comentarios[0]._id; // Asumiendo que el comentario existe

            const response = await request(app)
                .delete('/sites/comment/' + site.placeId + '/' + commentId);

            expect(response.statusCode).toBe(200);
            expect(response.body.msg).toBe('Comentario eliminado correctamente');
        });

        it('InSi9 -> Caso negativo: Intentar eliminar un comentario de un sitio que no existe', async () => {
            const nonExistentSiteId = '1234567890abcdef12345678'; // ObjectId válido en formato pero no existente
            const nonExistentCommentId = '1234567890abcdef12345678';

            const response = await request(app)
                .delete('/sites/comment/' + nonExistentSiteId + '/' + nonExistentCommentId);

            expect(response.statusCode).toBe(404);
            expect(response.body.msg).toBe('No se ha encontrado un sitio con ese id');
        });
    });

    describe('Obtener comentarios de un sitio', () => {

        it('InSi10 -> Caso positivo: Obtener los comentarios de un sitio existente', async () => {
            const existingSiteId = sitios[0].placeId;
            const response = await request(app)
                .get('/sites/comments')
                .query({ placeId: existingSiteId });

            expect(response.statusCode).toBe(200);
            expect(response.body.msg).toBe('Comentarios obtenidos correctamente');
            expect(response.body.comentarios).not.toEqual([]);
        });

        it('InSi11 -> Caso negativo: Intentar obtener los comentarios de un sitio que no existe', async () => {
            const nonExistentSiteId = '1234567890abcdef12345678';

            const response = await request(app)
                .get('/sites/comments')
                .query({ placeId: nonExistentSiteId });

            expect(response.statusCode).toBe(200);
            expect(response.body.msg).toBe('Comentarios obtenidos correctamente');
            expect(response.body.comentarios).toEqual([]);
        });
    });

    describe('Publicar valoración en un sitio', () => {

        const newReview = {
            fisica: {
                entrada: 4,
                taza_bano: 3,
                senaletica_clara: 5
            },
            sensorial: {
                senaletica_braille: 5,
                sistemas_amplificacion: 4,
                pictogramas_claros: 5
            },
            psiquica: {
                informacion_simple: 5,
                interaccion_personal: 5
            }
        };

        it('InSi12 -> Caso positivo: Publicar una valoración en un sitio nuevo', async () => {
            const newSite = {
                ...sitios[0],
                placeId: "newPlaceId123",
            };
            const response = await request(app)
                .post('/sites/review')
                .send({ site: newSite, review: newReview, usuarioId: usuarios[0]._id });

            expect(response.statusCode).toBe(200);
            expect(response.body.msg).toBe('Valoracion enviada correctamente');
        });

        it('InSi13 -> Caso positivo: Publicar una valoración en un sitio existente', async () => {
            const existingSite = sitios[0];

            const response = await request(app)
                .post('/sites/review')
                .send({ site: existingSite, review: newReview, usuarioId: usuarios[0]._id });

            expect(response.statusCode).toBe(200);
            expect(response.body.msg).toBe('Valoracion enviada correctamente');
        });

        it('InSi14 -> Caso negativo: Publicar una valoración con datos inválidos', async () => {
            const site = sitios[0]; // Asumiendo que sitios[0] es un sitio existente
            const invalidReview = {
                // Datos de valoración inválidos o ausentes
            };

            const response = await request(app)
                .post('/sites/review')
                .send({ site: site, review: invalidReview, usuarioId: usuarios[0]._id });

            expect(response.statusCode).toBe(400);
            expect(response.body.msg).toBe('Faltan datos en el body');
        });
    });

    describe('Editar valoración de un sitio', () => {
        const updatedReview = {
            fisica: {
                entrada: 4,
                taza_bano: 3,
                senaletica_clara: 5
            },
            sensorial: {
                senaletica_braille: 5,
                sistemas_amplificacion: 4,
                pictogramas_claros: 5
            },
            psiquica: {
                informacion_simple: 5,
                interaccion_personal: 5
            }
        };
        it('InSi15 -> Caso positivo: Editar una valoración existente en un sitio', async () => {
            const site = sitios[0];

            const response = await request(app)
                .put('/sites/review/' + site.placeId + '/' + usuarios[0]._id)
                .send({ review: updatedReview });

            expect(response.statusCode).toBe(200);
            expect(response.body.msg).toBe('Valoracion editada correctamente');
        });

        it('InSi16 -> Caso negativo: Intentar editar una valoración en un sitio que no existe', async () => {
            const nonExistentSiteId = '1234567890abcdef12345678';

            const response = await request(app)
                .put('/sites/review/' + nonExistentSiteId + '/' + usuarios[0]._id)
                .send({ review: updatedReview });

            expect(response.statusCode).toBe(500);
            expect(response.body.msg).toBe('No se pudo editar la valoracion');
        });
    });

    describe('Eliminar valoración de un sitio', () => {

        it('InSi17 -> Caso positivo: Eliminar una valoración existente de un sitio', async () => {
            const site = sitios[0];

            const response = await request(app)
                .delete('/sites/review/' + site.placeId + '/' + usuarios[0]._id);

            expect(response.statusCode).toBe(200);
            expect(response.body.msg).toBe('Valoracion eliminada correctamente');
        });

        it('InSi18 -> Caso negativo: Intentar eliminar una valoración de un sitio que no existe', async () => {
            const nonExistentSiteId = '1234567890abcdef12345678';

            const response = await request(app)
                .delete('/sites/review/' + nonExistentSiteId + '/' + usuarios[0]._id);

            expect(response.statusCode).toBe(500);
            expect(response.body.msg).toBe('No se pudo eliminar la valoracion');
        });
    });

    describe('Publicar foto en un sitio', () => {

        it('InSi19 -> Caso positivo: Publicar una foto en un sitio nuevo', async () => {
            const newSite = {
                ...sitios[0],
                placeId: "newPlaceId123",
            };
            const newPhoto = {
                base64: "base64EncodedString",
                usuarioId: usuarios[0]._id,
                alternativeText: "Descripción de la foto"
            };

            const response = await request(app)
                .post('/sites/photo')
                .send({ site: newSite, photo: newPhoto });

            expect(response.statusCode).toBe(200);
            expect(response.body.msg).toBe('Foto enviada correctamente');
        });

        it('InSi20 -> Caso positivo: Publicar una foto en un sitio existente', async () => {
            const existingSite = sitios[0];
            const newPhoto = {
                base64: "base64EncodedString",
                usuarioId: usuarios[0]._id,
                alternativeText: "Descripción de la foto"
            };

            const response = await request(app)
                .post('/sites/photo')
                .send({ site: existingSite, photo: newPhoto });

            expect(response.statusCode).toBe(200);
            expect(response.body.msg).toBe('Foto enviada correctamente');
        });

        it('InSi21 -> Caso negativo: Publicar una foto con datos inválidos', async () => {
            const site = sitios[0];
            const invalidPhoto = {
                // foto inválida
            };

            const response = await request(app)
                .post('/sites/photo/')
                .send({ site: site, photo: invalidPhoto });

            expect(response.statusCode).toBe(400);
            expect(response.body.msg).toBe('Faltan datos en el body');
        });
    });

    describe('Eliminar foto de un sitio', () => {
        it('InSi22 -> Caso positivo: Eliminar una foto existente de un sitio', async () => {
            const site = sitios[0];
            const photoId = site.fotos[0]._id;

            const response = await request(app)
                .delete('/sites/photo/' + photoId);

            expect(response.statusCode).toBe(200);
            expect(response.body.msg).toBe('Foto eliminada correctamente');
        });

        it('InSi23 -> Caso negativo: Intentar eliminar una foto de un sitio que no existe', async () => {
            const nonExistentPhotoId = '1234567890abcdef12345678';

            const response = await request(app)
                .delete('/sites/photo/' + nonExistentPhotoId);

            expect(response.statusCode).toBe(500);
            expect(response.body.msg).toBe('No se pudo eliminar la foto');
        });
    });

});
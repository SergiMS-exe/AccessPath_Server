import { Request, Response } from 'express';

// Mock de la dependencia
jest.mock('../../../src/services/sitiosService');
import * as placeService from '../../../src/services/sitiosService';
const mockedPlaceService = placeService as jest.Mocked<typeof placeService>;

import * as placeController from '../../../src/controllers/sitiosController';
import { Site } from '../../../src/interfaces/Site';
import CommentType from '../../../src/interfaces/CommentType';
import { Types } from 'mongoose';
import { Valoracion } from '../../../src/interfaces/Valoracion';

describe('siteControler', () => {
    const site1: Site = {
        placeId: 'site1',
        nombre: 'Site 1',
        location: {
            latitude: 0,
            longitude: 0,
        },
        direccion: 'Site 1 address',
        types: ['type1', 'type2'],
        calificacionGoogle: 5
    };

    const site2: Site = {
        placeId: 'site2',
        nombre: 'Site 2',
        location: {
            latitude: 0,
            longitude: 0,
        },
        direccion: 'Site 2 address',
        types: ['type1', 'type2'],
        calificacionGoogle: 5
    };

    let req: Request;
    let res: Response;
    let next: any;

    beforeEach(() => {
        res = {
            status: jest.fn().mockReturnThis(),
            send: jest.fn(),
            locals: {}
        } as unknown as Response;

        next = jest.fn();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('getClosePlacesController', () => {
        it('SCon1 -> Caso positivo: Solicitud con ubicación válida y servicio retorna sitios cercanos', async () => {
            req = {
                query: {
                    location: '40.416775%-3.703790', // '40.416775,-3.703790
                }
            } as unknown as Request;

            // Mock de la respuesta del servicio con sitios cercanos
            const mockClosePlaces = { sitios: [site1 as any, site2 as any] };
            mockedPlaceService.getClosePlacesService.mockResolvedValue(mockClosePlaces);

            // Llama a la función del controlador
            await placeController.getClosePlacesController(req, res, next);

            // Verifica que la respuesta sea la esperada
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.locals.sitios).toEqual(mockClosePlaces.sitios);
            expect(res.locals.mensaje).toEqual('Sitios cercanos obtenidos correctamente');
        });

        it('SCon2 -> Caso negativo: No proporcionar una ubicación', async () => {
            req = { query: {} } as unknown as Request;

            // Llama a la función del controlador
            await placeController.getClosePlacesController(req, res, next);

            // Verifica que se reciba el código de error y mensaje correctos
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.send).toHaveBeenCalledWith({ msg: 'Faltan datos en la query' });
        });

        it('SCon3 -> Caso negativo: Ubicación en formato incorrecto', async () => {
            req = {
                query: {
                    location: '40.416775,-3.703790', //no tiene el divisor %
                }
            } as unknown as Request;


            // Llama a la función del controlador
            await placeController.getClosePlacesController(req, res, next);

            // Verifica que se reciba el código de error y mensaje correctos
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.send).toHaveBeenCalledWith({ msg: 'El formato de la ubicacion es incorrecto' });
        });

        it('SCon4 -> Caso negativo: Ubicación válida pero el servicio retorna un error', async () => {
            req = {
                query: {
                    location: '40.416775%-3.703790', // '40.416775,-3.703790
                }
            } as unknown as Request;


            // Mock de la respuesta del servicio con error
            mockedPlaceService.getClosePlacesService.mockRejectedValue(new Error('Error en el servicio'));

            // Llama a la función del controlador
            await placeController.getClosePlacesController(req, res, next);

            // Verifica que se reciba el código de error y mensaje correctos
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.send).toHaveBeenCalledWith({ msg: 'Error en la obtencion de sitios cercanos: Error en el servicio' });
        });
    });

    describe('getPlacesByTextController', () => {

        it('SCon5 -> Caso positivo: Solicitud con texto válido y servicio retorna sitios que coincidan con la consulta', async () => {
            req = {
                query: {
                    text: 'nombre de sitio',
                }
            } as unknown as Request;

            // Mock de la respuesta del servicio con sitios cercanos
            const mockPlacesByText = { sitios: [site1 as any, site2 as any] };
            mockedPlaceService.getPlacesByTextService.mockResolvedValue(mockPlacesByText);

            // Llama a la función del controlador
            await placeController.getPlacesByTextController(req, res, next);

            // Verifica que la respuesta sea la esperada
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.locals.sitios).toEqual(mockPlacesByText.sitios);
            expect(res.locals.mensaje).toEqual('Sitios obtenidos correctamente');
        });

        it('SCon6 -> Caso negativo: Falta el texto a buscar en la query.', async () => {

            req = {
                query: {}
            } as unknown as Request;

            // Llama a la función del controlador
            await placeController.getPlacesByTextController(req, res, next);

            // Verifica que la respuesta sea la esperada
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.send).toHaveBeenCalledWith({ msg: 'Faltan datos en la query' });
        });

        it('SCon7 -> Caso negativo: Ubicación válida pero el servicio retorna un error', async () => {

            req = {
                query: {
                    text: 'nombre de sitio',
                }
            } as unknown as Request;

            // Mock de la respuesta del servicio con error
            mockedPlaceService.getPlacesByTextService.mockRejectedValue(new Error('Error en el servicio'));

            // Llama a la función del controlador
            await placeController.getPlacesByTextController(req, res, next);

            // Verifica que se reciba el código de error y mensaje correctos
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.send).toHaveBeenCalledWith({ msg: 'Error en la obtencion de sitios por texto: Error en el servicio' });
        });
    });

    describe('postCommentController', () => {

        it('SCon8 -> Caso positivo: Enviar comentario con datos válidos y servicio confirma el envio', async () => {

            req = {
                body: {
                    site: site1,
                    comment: {
                        usuarioId: 'usuario1',
                        texto: 'Comentario de prueba',
                    }
                }
            } as unknown as Request;

            // Mock de la respuesta del servicio con sitios cercanos
            const mockResponse = { newPlace: site1, status: 200, comment: req.body.comment } as any;
            mockedPlaceService.postCommentService.mockResolvedValue(mockResponse);

            // Llama a la función del controlador
            await placeController.postCommentController(req, res, next);

            // Verifica que la respuesta sea la esperada
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.send).toHaveBeenCalledWith({ msg: 'Comentario enviado correctamente', comment: mockResponse.comment });
        });

        it('SCon9 -> Caso negativo: No proporcionar comentario o sitio en el body.', async () => {
            req = {
                body: {}
            } as unknown as Request;

            // Llama a la función del controlador
            await placeController.postCommentController(req, res, next);

            // Verifica que la respuesta sea la esperada
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.send).toHaveBeenCalledWith({ msg: 'Faltan datos en el body' });
        });

        it('SCon10 -> Caso negativo: Datos válidos pero el servicio retorna un error', async () => {
            req = {
                body: {
                    site: site1,
                    comment: {
                        usuarioId: 'usuario1',
                        texto: 'Comentario de prueba',
                    }
                }
            } as unknown as Request;

            // Mock de la respuesta del servicio con error
            mockedPlaceService.postCommentService.mockRejectedValue(new Error('Error en el servicio'));

            // Llama a la función del controlador
            await placeController.postCommentController(req, res, next);

            // Verifica que se reciba el código de error y mensaje correctos
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.send).toHaveBeenCalledWith({ msg: 'Error en el envio de comentario: Error en el servicio' });
        });
    });

    describe('editCommentController', () => {
        it('SCon11 -> Caso positivo: Editar comentario existente con datos válidos y servicio confirma la edición', async () => {
            req = {
                params: { placeId: 'site1' },
                body: {
                    commentId: 'comment1',
                    newText: 'Otro comentario de prueba',
                }
            } as unknown as Request;

            // Mock de la respuesta del servicio con sitios cercanos
            const mockResponse = { status: 200, editedComment: req.body.comment } as any;
            mockedPlaceService.editCommentService.mockResolvedValue(mockResponse);

            // Llama a la función del controlador
            await placeController.editCommentController(req, res, next);

            // Verifica que la respuesta sea la esperada
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.send).toHaveBeenCalledWith({ msg: 'Comentario editado correctamente', newComment: mockResponse.editedComment });
        });

        it('SCon12 -> Caso negativo: No proporcionar comentario o sitio en el body.', async () => {
            req = {
                body: {}
            } as unknown as Request;

            // Llama a la función del controlador
            await placeController.editCommentController(req, res, next);

            // Verifica que la respuesta sea la esperada
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.send).toHaveBeenCalledWith({ msg: 'Faltan datos en el body' });
        });

        it('SCon13 -> Caso negativo: Datos válidos pero el servicio retorna un error', async () => {
            req = {
                params: { placeId: 'site1' },
                body: {
                    commentId: 'comment1',
                    newText: 'Otro comentario de prueba',
                }
            } as unknown as Request;

            // Mock de la respuesta del servicio con error
            mockedPlaceService.editCommentService.mockRejectedValue(new Error('Error en el servicio'));

            // Llama a la función del controlador
            await placeController.editCommentController(req, res, next);

            // Verifica que se reciba el código de error y mensaje correctos
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.send).toHaveBeenCalledWith({ msg: 'Error en la edicion de comentario: Error en el servicio' });
        });
    });

    describe('deleteCommentController', () => {

        it('SCon15 -> Caso positivo: Eliminar comentario existente con datos válidos y servicio confirma eliminación', async () => {
            // Set up the request object with the necessary params
            req = {
                params: { commentId: 'comment1', placeId: 'site1' }
            } as unknown as Request;

            // Mock the response from the service to simulate successful deletion
            mockedPlaceService.deleteCommentService.mockResolvedValue({ status: 200, newPlace: site1 } as any);

            // Call the function under test
            await placeController.deleteCommentController(req, res, next);

            // Assert the response is as expected
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.send).toHaveBeenCalledWith({ msg: 'Comentario eliminado correctamente' });
        });

        it('SCon16 -> Caso negativo: Datos válidos pero el servicio retorna un error', async () => {
            // Set up the request object with the necessary params
            req = {
                params: { commentId: 'comment1', placeId: 'site1' }
            } as unknown as Request;

            // Mock the response from the service to simulate an error
            const mockError = new Error('Error en el servicio');
            mockedPlaceService.deleteCommentService.mockRejectedValue(mockError);

            // Call the function under test
            await placeController.deleteCommentController(req, res, next);

            // Assert the response is as expected
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.send).toHaveBeenCalledWith({ msg: 'Error en la eliminacion de comentario: ' + mockError.message });
        });
    });

    describe('getCommentsController', () => {

        it('SCon17 -> Caso positivo: Obtener comentarios con placeId válido y servicio retorna lista de comentarios', async () => {
            // Establecer el objeto de solicitud con la query necesaria
            req = {
                query: { placeId: 'site1' }
            } as unknown as Request;

            const comment1: CommentType = {
                _id: new Types.ObjectId(),
                usuario: {
                    _id: new Types.ObjectId(),
                    nombre: 'usuario1',
                    apellidos: 'apellidos1'
                },
                texto: 'Comentario de prueba',
                date: new Date()
            };

            const comment2: CommentType = {
                _id: new Types.ObjectId(),
                usuario: {
                    _id: new Types.ObjectId(),
                    nombre: 'usuario2',
                    apellidos: 'apellidos2'
                },
                texto: 'Otro comentario de prueba',
                date: new Date()
            };

            // Simular la respuesta del servicio con una lista de comentarios
            const mockComments: CommentType[] = [comment1, comment2];
            mockedPlaceService.getCommentsService.mockResolvedValue({ comentarios: mockComments });

            // Llamar a la función bajo prueba
            await placeController.getCommentsController(req, res, next);

            // Verificar que la respuesta sea la esperada
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.send).toHaveBeenCalledWith({ msg: 'Comentarios obtenidos correctamente', comentarios: mockComments });
        });

        it('SCon18 -> Caso negativo: Falta el placeId en la query', async () => {
            // Establecer el objeto de solicitud sin la query necesaria
            req = {
                query: {}
            } as unknown as Request;

            // Llamar a la función bajo prueba
            await placeController.getCommentsController(req, res, next);

            // Verificar que la respuesta sea la esperada
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.send).toHaveBeenCalledWith({ msg: 'Faltan datos en los parametros' });
        });

        it('SCon19 -> Caso negativo: Datos válidos pero el servicio retorna un error', async () => {
            // Establecer el objeto de solicitud con la query necesaria
            req = {
                query: { placeId: 'site1' }
            } as unknown as Request;

            // Simular un error en la respuesta del servicio
            const mockError = new Error('Error en el servicio');
            mockedPlaceService.getCommentsService.mockRejectedValue(mockError);

            // Llamar a la función bajo prueba
            await placeController.getCommentsController(req, res, next);

            // Verificar que la respuesta sea la esperada
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.send).toHaveBeenCalledWith({ msg: 'Error en la obtencion de comentarios: ' + mockError.message });
        });
    });

    describe('postReviewController', () => {

        const review = {
            fisica: {
                entrada: 5,
                taza_bano: 4,
            },
            sensorial: {
                senaletica_braille: 5,
                sistemas_amplificacion: 4,
            },
            psiquica: {
                informacion_simple: 5,
                senaletica_intuitiva: 4,
            }
        }

        it('SCon20 -> Caso positivo: Enviar reseña con datos válidos y servicio confirma el envío', async () => {
            // Configuración del objeto de solicitud con los datos válidos
            req = {
                body: {
                    site: site1,
                    usuarioId: 'usuario1',
                    review: review
                },
            } as unknown as Request;

            const newPlace = {
                ...site1,
                valoraciones: {
                    fisica: {
                        average: 4.5,
                        valoracion: {
                            entrada: 5,
                            taza_bano: 4,
                        }
                    },
                    sensorial: {
                        average: 4.5,
                        valoracion: {
                            senaletica_braille: 5,
                            sistemas_amplificacion: 4,
                        }
                    },
                    psiquica: {
                        average: 4.5,
                        valoracion: {
                            informacion_simple: 5,
                            senaletica_intuitiva: 4,
                        }
                    }
                }
            };
            // Simulación de la respuesta del servicio para confirmar que la reseña fue enviada
            const mockResponse = { newPlace } as any;
            mockedPlaceService.postReviewService.mockResolvedValue(mockResponse);

            // Llamada a la función del controlador
            await placeController.postReviewController(req, res, next);

            // Verificación de que la respuesta sea como se espera
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.locals.mensaje).toEqual('Valoracion enviada correctamente');
            expect(res.locals.newPlace).toEqual(mockResponse.newPlace);
        });

        it('SCon21 -> Caso negativo: No proporcionar reseña, lugar o usuarioId en el body', async () => {
            // Configuración del objeto de solicitud sin los datos necesarios
            req = {
                body: {}
            } as unknown as Request;

            // Llamada a la función del controlador
            await placeController.postReviewController(req, res, next);

            // Verificación de que la respuesta sea como se espera
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.send).toHaveBeenCalledWith({ msg: 'Faltan datos en el body' });
        });

        it('SCon22 -> Caso negativo: Datos válidos pero el servicio retorna un error', async () => {
            // Configuración del objeto de solicitud con los datos válidos
            req = {
                body: {
                    usuarioId: 'usuario1',
                    site: { placeId: 'site1' },
                    review: review
                }
            } as unknown as Request;

            // Simulación de la respuesta del servicio para simular un error
            const mockError = new Error('Error en el servicio');
            mockedPlaceService.postReviewService.mockRejectedValue(mockError);

            // Llamada a la función del controlador
            await placeController.postReviewController(req, res, next);

            // Verificación de que la respuesta sea como se espera
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.send).toHaveBeenCalledWith({ msg: "Error en el envio de valoracion: " + mockError.message });
        });
    });

    describe('editReviewController', () => {

        const review = {
            fisica: {
                entrada: 5,
                taza_bano: 4,
            },
            sensorial: {
                senaletica_braille: 5,
                sistemas_amplificacion: 4,
            },
            psiquica: {
                informacion_simple: 5,
                senaletica_intuitiva: 4,
            }
        }

        it('SCon23 -> Caso positivo: Editar reseña existente con datos válidos y servicio confirma la edición', async () => {
            // Establecer el objeto de solicitud con los datos necesarios en el body y los parámetros
            req = {
                body: {
                    review: review
                },
                params: { placeId: 'lugar1', userId: 'usuario1' }
            } as unknown as Request;

            const newPlace = {
                ...site1,
                valoraciones: {
                    fisica: {
                        average: 4.5,
                        valoracion: {
                            entrada: 5,
                            taza_bano: 4,
                        }
                    },
                    sensorial: {
                        average: 4.5,
                        valoracion: {
                            senaletica_braille: 5,
                            sistemas_amplificacion: 4,
                        }
                    },
                    psiquica: {
                        average: 4.5,
                        valoracion: {
                            informacion_simple: 5,
                            senaletica_intuitiva: 4,
                        }
                    }
                }
            };

            // Simular la respuesta del servicio para confirmar la edición
            const mockResponse = { newPlace, status: 200 } as any;
            mockedPlaceService.editReviewService.mockResolvedValue(mockResponse);

            // Llamar a la función bajo prueba
            await placeController.editReviewController(req, res, next);

            // Verificar que la respuesta sea la esperada
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.locals).toEqual({ newPlace, mensaje: 'Valoracion editada correctamente' });
        });

        it('SCon24 -> Caso negativo: No proporcionar reseña en el body', async () => {
            // Establecer el objeto de solicitud sin la reseña necesaria en el body
            req = {
                body: {},
                params: { placeId: 'lugar1', userId: 'usuario1' }
            } as unknown as Request;

            // Llamar a la función bajo prueba
            await placeController.editReviewController(req, res, next);

            // Verificar que la respuesta sea la esperada
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.send).toHaveBeenCalledWith({ msg: 'Faltan datos en el body' });
        });

        it('SCon25 -> Caso negativo: Datos válidos pero el servicio retorna un error', async () => {
            // Establecer el objeto de solicitud con los datos necesarios en el body y los parámetros
            req = {
                body: {
                    review: {
                        fisica: 4,
                        sensorial: 3,
                        psiquica: 5
                    }
                },
                params: { placeId: 'lugar1', userId: 'usuario1' }
            } as unknown as Request;

            // Simular un error en la respuesta del servicio
            const mockError = new Error('Error en el servicio');
            mockedPlaceService.editReviewService.mockRejectedValue(mockError);

            // Llamar a la función bajo prueba
            await placeController.editReviewController(req, res, next);

            // Verificar que la respuesta sea la esperada
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.send).toHaveBeenCalledWith({ msg: 'Error en la edicion de valoracion: ' + mockError.message });
        });
    });

    describe('deleteReviewController', () => {

        it('SCon26 -> Caso positivo: Eliminar reseña existente con datos válidos y servicio confirma eliminación', async () => {
            // Establecer el objeto de solicitud con los parámetros necesarios
            req = {
                params: { placeId: 'lugar1', userId: 'usuario1' }
            } as unknown as Request;

            // Simular la respuesta del servicio para confirmar la eliminación
            const mockResponse = { newPlace: site1, status: 200 } as any;
            mockedPlaceService.deleteReviewService.mockResolvedValue(mockResponse);

            // Llamar a la función bajo prueba
            await placeController.deleteReviewController(req, res, next);

            // Verificar que la respuesta sea la esperada
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.locals).toEqual({ newPlace: site1, mensaje: 'Valoracion eliminada correctamente' });
        });

        it('SCon27 -> Caso negativo: Datos válidos pero el servicio retorna un error', async () => {
            // Establecer el objeto de solicitud con los parámetros necesarios
            req = {
                params: { placeId: 'lugar1', userId: 'usuario1' }
            } as unknown as Request;

            // Simular un error en la respuesta del servicio
            const mockError = new Error('Error en el servicio');
            mockedPlaceService.deleteReviewService.mockRejectedValue(mockError);

            // Llamar a la función bajo prueba
            await placeController.deleteReviewController(req, res, next);

            // Verificar que la respuesta sea la esperada
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.send).toHaveBeenCalledWith({ msg: "Error en la eliminacion de valoracion: " + mockError.message });
        });
    });

    describe('postPhotoController', () => {
        const photo = {
            base64: 'datosBase64',
            usuarioId: 'usuario1',
            alternativeText: 'Texto alternativo'
        };
        it('SCon28 -> Caso positivo: Enviar foto con datos válidos y servicio confirma el envío', async () => {
            // Establecer el objeto de solicitud con los datos necesarios en el body
            req = {
                body: {
                    photo,
                    site: site1
                }
            } as unknown as Request;

            // Simular la respuesta del servicio para confirmar el envío
            const mockResponse = { newPlace: { ...site1, fotos: [photo] }, status: 200 } as any;
            mockedPlaceService.postPhotoService.mockResolvedValue(mockResponse);

            // Llamar a la función bajo prueba
            await placeController.postPhotoController(req, res, next);

            // Verificar que la respuesta sea la esperada
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.locals).toEqual({ newPlace: { ...site1, fotos: [photo] }, mensaje: 'Foto enviada correctamente' });
        });

        it('SCon29 -> Caso negativo: No proporcionar lugar o archivo en el body', async () => {
            // Establecer el objeto de solicitud sin los datos necesarios en el body
            req = {
                body: {}
            } as unknown as Request;

            // Llamar a la función bajo prueba
            await placeController.postPhotoController(req, res, next);

            // Verificar que la respuesta sea la esperada
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.send).toHaveBeenCalledWith({ msg: 'Faltan datos en el body' });
        });

        it('SCon30 -> Caso negativo: Datos válidos pero el servicio retorna un error', async () => {
            // Establecer el objeto de solicitud con los datos necesarios en el body
            req = {
                body: {
                    photo,
                    site: site1
                }
            } as unknown as Request;

            // Simular un error en la respuesta del servicio
            const mockError = new Error('Error en el servicio');
            mockedPlaceService.postPhotoService.mockRejectedValue(mockError);

            // Llamar a la función bajo prueba
            await placeController.postPhotoController(req, res, next);

            // Verificar que la respuesta sea la esperada
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.send).toHaveBeenCalledWith({ msg: "Error en el envio de foto: " + mockError.message });
        });
    });

    describe('deletePhotoController', () => {

        it('SCon31 -> Caso positivo: Eliminar foto existente con datos válidos y servicio confirma eliminación', async () => {
            // Establecer el objeto de solicitud con los parámetros necesarios
            req = {
                params: { photoId: 'foto1' }
            } as unknown as Request;

            // Simular la respuesta del servicio para confirmar la eliminación
            const mockResponse = { newPlace: site1, status: 200 } as any;
            mockedPlaceService.deletePhotoService.mockResolvedValue(mockResponse);

            // Llamar a la función bajo prueba
            await placeController.deletePhotoController(req, res, next);

            // Verificar que la respuesta sea la esperada
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.locals).toEqual({ newPlace: site1, mensaje: 'Foto eliminada correctamente' });
        });

        it('SCon32 -> Caso negativo: Datos válidos pero el servicio retorna un error', async () => {
            // Establecer el objeto de solicitud con los parámetros necesarios
            req = {
                params: { photoId: 'foto1' }
            } as unknown as Request;

            // Simular un error en la respuesta del servicio
            const mockError = new Error('Error en el servicio');
            mockedPlaceService.deletePhotoService.mockRejectedValue(mockError);

            // Llamar a la función bajo prueba
            await placeController.deletePhotoController(req, res, next);

            // Verificar que la respuesta sea la esperada
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.send).toHaveBeenCalledWith({ msg: "Error en la eliminacion de foto: " + mockError.message });
        });
    });

});
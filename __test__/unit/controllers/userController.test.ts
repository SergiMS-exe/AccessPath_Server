import { Types } from "mongoose";
import { Request, Response } from 'express';
import Person from "../../../src/interfaces/Person";

// Mock del servicio
jest.mock('./../../../src/services/usuariosService');
import * as userService from '../../../src/services/usuariosService';
const mockedUserService = userService as jest.Mocked<typeof userService>;

import * as userController from '../../../src/controllers/usersController';
import { Photo, Site } from "../../../src/interfaces/Site";
import CommentType from "../../../src/interfaces/CommentType";
import { Valoracion } from "../../../src/interfaces/Valoracion";

describe('userController', () => {

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

    describe('logInUserController', () => {
        afterEach(() => {
            // Limpia todos los mocks después de cada test
            jest.clearAllMocks();
        });

        it('should log in successfully with correct body and service response', async () => {
            const req = {
                body: {
                    email: 'test@example.com',
                    password: '123456'
                }
            } as Request;
            const res = {
                status: jest.fn().mockReturnThis(),
                send: jest.fn(),
            } as unknown as Response;
            const next = jest.fn();

            const mockUser: Person = {
                _id: new Types.ObjectId(),
                nombre: 'Test',
                apellidos: 'User',
                email: 'test@test.com',
                password: 'password',
                tipoDiscapacidad: 'Ninguna',
                saved: [],
            };

            const responseLogIn = { usuario: mockUser } as any;

            // Configura el mock del servicio para que devuelva una respuesta exitosa
            mockedUserService.logInUserService.mockResolvedValue(responseLogIn);

            // Llama a la función del controlador
            await userController.logInUserController(req, res, next);

            // Verifica que la respuesta sea la esperada
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.send).toHaveBeenCalledWith({ msg: 'Sesion iniciada correctamente', user: responseLogIn.usuario });
            expect(next).toHaveBeenCalled();
        });

        it('should return 400 if email or password is not provided in body', async () => {
            const req = {
                body: {}
            } as Request;
            const res = {
                status: jest.fn().mockReturnThis(),
                send: jest.fn(),
            } as unknown as Response;
            const next = jest.fn();

            // Llama a la función del controlador
            await userController.logInUserController(req, res, next);

            // Verifica que la respuesta sea la esperada
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.send).toHaveBeenCalledWith({ msg: "Faltan datos en el body" });
        });

        it('should return 404 if no user is registered with given email', async () => {
            const req = {
                body: {
                    email: 'unexistent@email.com',
                    password: '123456'
                }
            } as Request;

            const res = {
                status: jest.fn().mockReturnThis(),
                send: jest.fn(),
            } as unknown as Response;
            const next = jest.fn();

            const mockResponse = { error: 'No hay un usuario registrado con ese email', status: 404 };

            // Configura el mock del servicio para que devuelva una respuesta exitosa
            mockedUserService.logInUserService.mockResolvedValue(mockResponse);

            // Llama a la función del controlador
            await userController.logInUserController(req, res, next);

            // Verifica que la respuesta sea la esperada
            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.send).toHaveBeenCalledWith({ msg: mockResponse.error });
        });

        it('should return 401 if password is incorrect', async () => {
            const req = {
                body: {
                    email: 'existent@email.com',
                    password: 'wrongPassword'
                }
            } as Request;

            const res = {
                status: jest.fn().mockReturnThis(),
                send: jest.fn(),
            } as unknown as Response;
            const next = jest.fn();

            const mockResponse = { error: 'Contraseña incorrecta', status: 401 };

            // Configura el mock del servicio para que devuelva una respuesta exitosa
            mockedUserService.logInUserService.mockResolvedValue(mockResponse);

            // Llama a la función del controlador
            await userController.logInUserController(req, res, next);

            // Verifica que la respuesta sea la esperada
            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.send).toHaveBeenCalledWith({ msg: mockResponse.error });
        });
    });

    describe('registerUserController', () => {
        afterEach(() => {
            // Limpia todos los mocks después de cada test
            jest.clearAllMocks();
        });

        const mockedUser: Person = {
            email: 'validuser@example.com',
            password: 'Valid123',
            nombre: 'Valid',
            apellidos: 'User',
            tipoDiscapacidad: 'Ninguna'
        };

        const confirmSamePassword = 'Valid123';

        it('should register successfully with valid data and service response', async () => {
            const req = {
                body: { ...mockedUser, confirmPassword: confirmSamePassword }
            } as Request;
            const res = {
                status: jest.fn().mockReturnThis(),
                send: jest.fn(),
            } as unknown as Response;
            const next = jest.fn();

            // Configura el mock del servicio para que devuelva una respuesta exitosa
            mockedUserService.registerUsuarioService.mockResolvedValue({ usuario: mockedUser } as any);

            // Llama a la función del controlador
            await userController.registerUserController(req, res, next);

            // Verifica que la respuesta sea la esperada
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.send).toHaveBeenCalledWith({ msg: 'Usuario creado correctamente', user: mockedUser });
        });

        it('should return 400 if email, password, nombre, apellidos or tipoDiscapacidad is not provided in body', async () => {
            const req = {
                body: {}
            } as Request;
            const res = {
                status: jest.fn().mockReturnThis(),
                send: jest.fn(),
            } as unknown as Response;
            const next = jest.fn();

            // Llama a la función del controlador
            await userController.registerUserController(req, res, next);

            // Verifica que la respuesta sea la esperada
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.send).toHaveBeenCalledWith({ msg: "Faltan datos en el body" });
        });

        it('should return 409 if there is already a user with that email', async () => {

            const mockedExistingUser: Person = {
                email: 'existinguser@example.com',
                password: 'Valid123',
                nombre: 'Existing',
                apellidos: 'User',
                tipoDiscapacidad: 'Ninguna'
            };
            const req = {
                body: { ...mockedExistingUser, confirmPassword: confirmSamePassword }
            } as Request;
            const res = {
                status: jest.fn().mockReturnThis(),
                send: jest.fn(),
            } as unknown as Response;
            const next = jest.fn();

            const mockResponse = { error: 'Ya existe un usuario con ese email', status: 409 };

            // Configura el mock del servicio para que devuelva una respuesta de error
            mockedUserService.registerUsuarioService.mockResolvedValue(mockResponse);

            // Llama a la función del controlador
            await userController.registerUserController(req, res, next);

            // Verifica que la respuesta sea la esperada
            expect(res.status).toHaveBeenCalledWith(mockResponse.status);
            expect(res.send).toHaveBeenCalledWith({ msg: mockResponse.error });
        });

        it('should return 400 if passwords do not match', async () => {
            const req = {
                body: {
                    ...mockedUser,
                    confirmPassword: 'Different123'
                }
            } as Request;
            const res = {
                status: jest.fn().mockReturnThis(),
                send: jest.fn(),
            } as unknown as Response;
            const next = jest.fn();

            // Llama a la función del controlador
            await userController.registerUserController(req, res, next);

            // Verifica que la respuesta sea la esperada
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.send).toHaveBeenCalledWith({ msg: 'Las contraseñas no coinciden' });
        });

        it('should return 400 if email does not meet restrictions', async () => {
            const req = {
                body: {
                    ...mockedUser,
                    email: 'invalidemail'
                }
            } as Request;
            const res = {
                status: jest.fn().mockReturnThis(),
                send: jest.fn(),
            } as unknown as Response;
            const next = jest.fn();

            // Llama a la función del controlador
            await userController.registerUserController(req, res, next);

            // Verifica que la respuesta sea la esperada
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.send).toHaveBeenCalledWith({ msg: "Introduzca un email válido" });
        });

        it('should return 400 if password does not meet restrictions', async () => {
            const req = {
                body: {
                    ...mockedUser,
                    password: 'short'
                }
            } as Request;
            const res = {
                status: jest.fn().mockReturnThis(),
                send: jest.fn(),
            } as unknown as Response;
            const next = jest.fn();

            // Llama a la función del controlador
            await userController.registerUserController(req, res, next);

            // Verifica que la respuesta sea la esperada
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.send).toHaveBeenCalledWith({ msg: "La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula y un número" });
        });
    });

    describe('deleteUserController', () => {
        afterEach(() => {
            jest.clearAllMocks();
        });

        it('should delete user successfully with valid userId and service response', async () => {
            const req = { params: { userId: 'validUserId' } };
            const res = {
                status: jest.fn().mockReturnThis(),
                send: jest.fn(),
            } as unknown as Response;
            const next = jest.fn();

            // Configura el mock del servicio para que devuelva una respuesta exitosa
            mockedUserService.deleteUsuarioService.mockResolvedValue({ status: 200 });

            // Llama a la función del controlador
            await userController.deleteUserController(req as any, res, next);

            // Verifica que la respuesta sea la esperada
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.send).toHaveBeenCalledWith({ msg: 'Usuario borrado correctamente' });
        });

        it('should return 404 if service responds no user with that id', async () => {
            const req = { params: { userId: 'nonExistentUserId' } };
            const res = {
                status: jest.fn().mockReturnThis(),
                send: jest.fn(),
            } as unknown as Response;
            const next = jest.fn();

            const mockResponse = { error: 'No existe un usuario con ese id', status: 404 };

            // Configura el mock del servicio para que devuelva una respuesta de error
            mockedUserService.deleteUsuarioService.mockResolvedValue(mockResponse);

            // Llama a la función del controlador
            await userController.deleteUserController(req as any, res, next);

            // Verifica que la respuesta sea la esperada
            expect(res.status).toHaveBeenCalledWith(mockResponse.status);
            expect(res.send).toHaveBeenCalledWith({ msg: mockResponse.error });
        });
    });

    describe('saveSiteController', () => {

        afterEach(() => {
            jest.clearAllMocks();
        });

        it('should save site successfully with correct body and service responds successfully', async () => {
            const req = {
                body: {
                    userId: 'validUserId',
                    site: 'validSite'
                }
            } as Request;

            const res = {
                status: jest.fn().mockReturnThis(),
                send: jest.fn(),
            } as unknown as Response;
            const next = jest.fn();

            // Configura el mock del servicio para que devuelva una respuesta exitosa
            mockedUserService.saveSiteService.mockResolvedValue({ status: 200 });
            await userController.saveSiteController(req, res, next);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.send).toHaveBeenCalledWith({ msg: 'Sitio guardado correctamente' });
        });

        it('should return 400 if userId or site is not provided in body', async () => {
            const req = {
                body: {}
            } as Request;

            const res = {
                status: jest.fn().mockReturnThis(),
                send: jest.fn(),
            } as unknown as Response;
            const next = jest.fn();

            await userController.saveSiteController(req, res, next);
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.send).toHaveBeenCalledWith({ msg: 'Faltan datos en el body' });
        });

        it('should return 409 if service responds site is already saved', async () => {
            const req = {
                body: {
                    userId: 'validUserId',
                    site: 'alreadySavedSite'
                }
            } as Request;

            const res = {
                status: jest.fn().mockReturnThis(),
                send: jest.fn(),
            } as unknown as Response;
            const next = jest.fn();

            const mockResponse = { error: 'El sitio ya está guardado', status: 409 };
            mockedUserService.saveSiteService.mockResolvedValue(mockResponse);

            await userController.saveSiteController(req, res, next);

            expect(res.status).toHaveBeenCalledWith(mockResponse.status);
            expect(res.send).toHaveBeenCalledWith({ msg: mockResponse.error });
        });
    });

    describe('unsaveSiteController', () => {
        afterEach(() => {
            jest.clearAllMocks();
        });

        it('should unsave site successfully with correct body and service responds successfully', async () => {
            const req = {
                body: {
                    userId: 'validUserId',
                    placeId: 'validPlaceId'
                }
            } as Request;

            const res = {
                status: jest.fn().mockReturnThis(),
                send: jest.fn(),
            } as unknown as Response;
            const next = jest.fn();

            mockedUserService.unsaveSiteService.mockResolvedValue({ status: 200 });
            await userController.unsaveSiteController(req, res, next);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.send).toHaveBeenCalledWith({ msg: 'Sitio eliminado correctamente de la lista de guardados' });
        });

        it('should return 400 if userId or placeId is not provided in body', async () => {
            const req = {
                body: {}
            } as Request;

            const res = {
                status: jest.fn().mockReturnThis(),
                send: jest.fn(),
            } as unknown as Response;
            const next = jest.fn();

            await userController.unsaveSiteController(req, res, next);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.send).toHaveBeenCalledWith({ msg: 'Faltan datos en el body' });
        });

        it('should return 409 if service responds site has been removed or is not in the list', async () => {
            const req = {
                body: {
                    userId: 'validUserId',
                    placeId: 'nonExistentPlaceId'
                }
            } as Request;

            const res = {
                status: jest.fn().mockReturnThis(),
                send: jest.fn(),
            } as unknown as Response;
            const next = jest.fn();

            const mockResponse = { error: 'El sitio ya ha sido eliminado o no está en la lista', status: 409 };
            mockedUserService.unsaveSiteService.mockResolvedValue(mockResponse);
            await userController.unsaveSiteController(req, res, next);

            expect(res.status).toHaveBeenCalledWith(mockResponse.status);
            expect(res.send).toHaveBeenCalledWith({ msg: mockResponse.error });
        });
    });

    describe('getSavedSitesController', () => {
        afterEach(() => {
            jest.clearAllMocks();
        });

        it('should get saved sites successfully with valid userId and service response', async () => {
            const req = {
                params: {
                    userId: 'validUserId'
                }
            } as any;

            const res = {
                status: jest.fn().mockReturnThis(),
                send: jest.fn(),
                locals: {}
            } as unknown as Response;
            const next = jest.fn();

            const mockResponse = { savedSites: [site1, site2] as any };

            mockedUserService.getSavedSitesService.mockResolvedValue(mockResponse);

            await userController.getSavedSitesController(req, res, next);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.locals.sitios).toEqual(mockResponse.savedSites);
            expect(res.locals.mensaje).toEqual('Sitios guardados obtenidos correctamente');
        });

        it('should return 404 if service responds no user found', async () => {
            const req = {
                params: {
                    userId: 'invalidUserId'
                }
            } as any;
            const res = {
                status: jest.fn().mockReturnThis(),
                send: jest.fn(),
            } as unknown as Response;
            const next = jest.fn();

            const mockResponse = { error: "No hay un usuario registrado con ese id", status: 404 };

            mockedUserService.getSavedSitesService.mockResolvedValue(mockResponse);

            await userController.getSavedSitesController(req, res, next);

            expect(res.status).toHaveBeenCalledWith(mockResponse.status);
            expect(res.send).toHaveBeenCalledWith({ msg: mockResponse.error });
        });
    });

    describe('getUserCommentsController', () => {
        afterEach(() => {
            jest.clearAllMocks();
        });

        it('should get user comments successfully with valid userId and service response', async () => {
            const req = {
                params: {
                    userId: 'validUserId'
                }
            } as any;
            const res = {
                status: jest.fn().mockReturnThis(),
                send: jest.fn(),
                locals: {}
            } as unknown as Response;
            const next = jest.fn();

            const comment1: CommentType = {
                _id: new Types.ObjectId(),
                usuarioId: 'validUserId',
                texto: 'Valid comment',
                date: new Date()
            };
            const comment2: CommentType = {
                _id: new Types.ObjectId(),
                usuarioId: 'validUserId',
                texto: 'Valid comment',
                date: new Date()
            };
            const comment3: CommentType = {
                _id: new Types.ObjectId(),
                usuarioId: 'validUserId',
                texto: 'Valid comment',
                date: new Date()
            };

            site1.comentarios = [comment1, comment2];
            site2.comentarios = [comment3];
            const mockResponse = { sites: [site1, site2] as any };

            mockedUserService.getUserCommentsService.mockResolvedValue(mockResponse);

            await userController.getUserCommentsController(req, res, next);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.locals.sitios).toEqual(mockResponse.sites);
            expect(res.locals.mensaje).toEqual("Comentarios obtenidos correctamente");
        });

        it('should return error if service responds with an error', async () => {
            const req = {
                params: {
                    userId: 'validUserId'
                }
            } as any;

            const res = {
                status: jest.fn().mockReturnThis(),
                send: jest.fn(),
            } as unknown as Response;
            const next = jest.fn();

            const mockResponse = { error: 'Error message', status: 500 };

            mockedUserService.getUserCommentsService.mockResolvedValue(mockResponse);

            await userController.getUserCommentsController(req, res, next);

            expect(res.status).toHaveBeenCalledWith(mockResponse.status);
            expect(res.send).toHaveBeenCalledWith({ msg: mockResponse.error });
        });
    });

    describe('getUserPhotosController', () => {
        afterEach(() => {
            // Limpia todos los mocks después de cada test
            jest.clearAllMocks();
        });

        it('should return a 200 status and a list of photos on successful retrieval', async () => {
            const req = {
                params: { userId: 'validUserId' }
            } as any;
            const res = {
                status: jest.fn().mockReturnThis(),
                send: jest.fn(),
                locals: {}
            } as unknown as Response;
            const next = jest.fn();

            const photo1: Photo = {
                usuarioId: 'validUserId',
                base64: 'validBase64',
                alternativeText: 'Valid alternative text',
            };
            const photo2: Photo = {
                usuarioId: 'validUserId',
                base64: 'validBase64',
                alternativeText: 'Valid alternative text',
            };
            const photo3: Photo = {
                usuarioId: 'validUserId',
                base64: 'validBase64',
                alternativeText: 'Valid alternative text',
            };

            site1.fotos = [photo1, photo2];
            site2.fotos = [photo3];

            const mockResponse = { sites: [site1, site2] as any };
            mockedUserService.getUserPhotosService.mockResolvedValue(mockResponse);

            await userController.getUserPhotosController(req, res, next);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.locals.sitios).toEqual(mockResponse.sites);
            expect(res.locals.mensaje).toEqual("Fotos obtenidas correctamente");
        });

        it('should return an error status and message if the service throws an error', async () => {
            const req = {
                params: { userId: 'invalidUserId' }
            } as any;
            const res = {
                status: jest.fn().mockReturnThis(),
                send: jest.fn(),
            } as unknown as Response;
            const next = jest.fn();

            const mockError = { message: 'Error message', status: 500 };
            mockedUserService.getUserPhotosService.mockRejectedValue(mockError);

            await userController.getUserPhotosController(req, res, next);

            expect(res.status).toHaveBeenCalledWith(mockError.status);
            expect(res.send).toHaveBeenCalledWith({ msg: "Error en obtencion de fotos del usuario: " + mockError.message });
        });
    });

    describe('getUserRatingsController', () => {
        afterEach(() => {
            // Limpia todos los mocks después de cada test
            jest.clearAllMocks();
        });

        it('should return a 200 status and a list of ratings with their respective sites on successful retrieval', async () => {
            const req = {
                params: { userId: 'validUserId' }
            } as any;
            const res = {
                status: jest.fn().mockReturnThis(),
                send: jest.fn(),
                locals: {}
            } as unknown as Response;
            const next = jest.fn();

            const rating1 = {
                placeId: 'validPlaceId1',
                userId: 'userId',
                fisica: {
                    entrada: 4,
                    taza_bano: 3,
                    rampas: 5,
                    ascensores: 4,
                    pasillos: 4,
                    banos_adaptados: 5,
                    senaletica_clara: 4
                },
                sensorial: {
                    senaletica_braille: 3,
                    sistemas_amplificacion: 2,
                    iluminacion_adecuada: 4,
                    informacion_accesible: 5,
                    pictogramas_claros: 4
                },
                psiquica: {
                    informacion_simple: 5,
                    senaletica_intuitiva: 3,
                    espacios_tranquilos: 4,
                    interaccion_personal: 4
                }
            };

            const rating2 = {
                placeId: 'validPlaceId2',
                userId: 'userId',
                fisica: {
                    entrada: 2,
                    taza_bano: 2,
                    rampas: 3,
                    ascensores: 3,
                    pasillos: 3,
                    banos_adaptados: 2,
                    senaletica_clara: 3
                },
                sensorial: {
                    senaletica_braille: 5,
                    sistemas_amplificacion: 4,
                    iluminacion_adecuada: 3,
                    informacion_accesible: 2,
                    pictogramas_claros: 5
                },
                psiquica: {
                    informacion_simple: 3,
                    senaletica_intuitiva: 5,
                    espacios_tranquilos: 4,
                    interaccion_personal: 5
                }
            };

            const mockRatings = [
                { valoracion: rating1, site: site1 },
                { valoracion: rating2, site: site2 }
            ] as any[];
            mockedUserService.getUserRatingsService.mockResolvedValue({ sitesWithValoracion: mockRatings });

            await userController.getUserRatingsController(req, res, next);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.locals.sitiosConValoracion).toEqual(mockRatings);
            expect(res.locals.mensaje).toEqual("Valoraciones obtenidas correctamente");
        });

        it('should return an error status and message if the service throws an error', async () => {
            const req = {
                params: { userId: 'invalidUserId' }
            } as any;
            const res = {
                status: jest.fn().mockReturnThis(),
                send: jest.fn(),
            } as unknown as Response;
            const next = jest.fn();

            const mockError = { message: 'Error message', status: 500 };
            mockedUserService.getUserRatingsService.mockRejectedValue(mockError);

            await userController.getUserRatingsController(req, res, next);

            expect(res.status).toHaveBeenCalledWith(mockError.status);
            expect(res.send).toHaveBeenCalledWith({ msg: "Error en obtencion de valoraciones del usuario: " + mockError.message });
        });
    });

    describe('editUserController', () => {
        afterEach(() => {
            // Limpia todos los mocks después de cada test
            jest.clearAllMocks();
        });

        // Caso positivo: Editar usuario con body correcto y servicio responde exitosamente.
        it('should edit user successfully with correct body and service response', async () => {
            const req = {
                body: {
                    person: {
                        _id: 'userId',
                        nombre: 'Test User Updated',
                        apellidos: 'User Updated',
                        email: 'updated@example.com',
                        tipoDiscapacidad: 'Ninguna'
                    }
                }
            } as Request;
            const res = {
                status: jest.fn().mockReturnThis(),
                send: jest.fn()
            } as unknown as Response;
            const next = jest.fn();

            // Mock del servicio para simular una respuesta exitosa
            mockedUserService.editUserService.mockResolvedValue({ status: 200 });

            await userController.editUserController(req, res, next);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.send).toHaveBeenCalledWith({ msg: 'Usuario editado correctamente' });
        });

        // Caso negativo: No proporcionar información completa de usuario en el body.
        it('should return 400 if not all user information is provided in body', async () => {
            const req = {
                body: {
                    person: {
                        _id: 'userId',
                        nombre: 'Test User Updated',
                        apellidos: 'User Updated',
                    }
                },
            } as Request;
            const res = {
                status: jest.fn().mockReturnThis(),
                send: jest.fn()
            } as unknown as Response;
            const next = jest.fn();

            await userController.editUserController(req, res, next);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.send).toHaveBeenCalledWith({ msg: 'Faltan datos en el body' });
        });

        // Caso negativo: Servicio responde que no pudo actualizar el usuario.
        it('should return 500 if service cannot update the user', async () => {
            const req = {
                body: {
                    person: {
                        _id: 'userId',
                        nombre: 'Test User Updated',
                        apellidos: 'User Updated',
                        email: 'updated@example.com',
                        tipoDiscapacidad: 'Ninguna'
                    }
                },
            } as Request;
            const res = {
                status: jest.fn().mockReturnThis(),
                send: jest.fn()
            } as unknown as Response;
            const next = jest.fn();

            const errorMessage = 'Servicio no disponible'
            // Mock del servicio para simular un fallo al actualizar
            mockedUserService.editUserService.mockRejectedValue(new Error(errorMessage));

            await userController.editUserController(req, res, next);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.send).toHaveBeenCalledWith({ msg: 'Error en edición del usuario: ' + errorMessage });
        });
    });

    describe('editPasswordController', () => {
        afterEach(() => {
            // Limpia todos los mocks después de cada test
            jest.clearAllMocks();
        });

        // Caso positivo: Cambiar contraseña con body correcto y servicio responde exitosamente.
        it('should change password successfully with correct body and service response', async () => {
            const req = {
                params: { userId: 'userId' },
                body: {
                    oldPassword: 'oldPassword1',
                    newPassword: 'newPassword2',
                    confirmNewPassword: 'newPassword2'
                }
            } as any;
            const res = {
                status: jest.fn().mockReturnThis(),
                send: jest.fn()
            } as unknown as Response;
            const next = jest.fn();

            mockedUserService.editPasswordService.mockResolvedValue({ status: 200 });

            await userController.editPasswordController(req, res, next);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.send).toHaveBeenCalledWith({ msg: 'Contraseña editada correctamente' });
        });

        // Caso negativo: No proporcionar oldPassword o newPassword en el body.
        it('should return 400 if oldPassword or newPassword is not provided', async () => {
            const req = {
                body: {},
                params: { userId: 'userId' }
            } as any;
            const res = {
                status: jest.fn().mockReturnThis(),
                send: jest.fn()
            } as unknown as Response;
            const next = jest.fn();

            await userController.editPasswordController(req, res, next);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.send).toHaveBeenCalledWith({ msg: 'Faltan datos en el body' });
        });

        // Caso negativo: Servicio responde que la contraseña actual es incorrecta.
        it('should return 401 if current password is incorrect', async () => {
            const req = {
                params: { userId: 'userId' },
                body: {
                    oldPassword: 'wrongOldPassword1',
                    newPassword: 'newPassword2',
                    confirmNewPassword: 'newPassword2'
                }
            } as any;
            const res = {
                status: jest.fn().mockReturnThis(),
                send: jest.fn()
            } as unknown as Response;
            const next = jest.fn();

            mockedUserService.editPasswordService.mockResolvedValue({ error: 'Contraseña actual incorrecta', status: 401 });

            await userController.editPasswordController(req, res, next);

            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.send).toHaveBeenCalledWith({ msg: 'Contraseña actual incorrecta' });
        });

        // Caso negativo: Las contraseñas no coinciden.
        it('should return 400 if passwords do not match', async () => {
            const req = {
                params: { userId: 'userId' },
                body: {
                    oldPassword: 'oldPassword1',
                    newPassword: 'newPassword2',
                    confirmNewPassword: 'newDifferentPassword2'
                }
            } as any;
            const res = {
                status: jest.fn().mockReturnThis(),
                send: jest.fn()
            } as unknown as Response;
            const next = jest.fn();

            await userController.editPasswordController(req, res, next);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.send).toHaveBeenCalledWith({ msg: 'Las contraseñas no coinciden' });
        });

        // Caso negativo: La nueva contraseña no cumple con las condiciones.
        it('should return 400 if new password does not meet requirements', async () => {
            const req = {
                params: { userId: 'userId' },
                body: {
                    oldPassword: 'oldPassword1',
                    newPassword: 'newpassword',
                    confirmNewPassword: 'newpassword'
                }
            } as any;
            const res = {
                status: jest.fn().mockReturnThis(),
                send: jest.fn()
            } as unknown as Response;
            const next = jest.fn();

            await userController.editPasswordController(req, res, next);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.send).toHaveBeenCalledWith({ msg: "La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula y un número" });
        });
    });

});

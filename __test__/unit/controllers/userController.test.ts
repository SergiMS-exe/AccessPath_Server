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


    describe('logInUserController', () => {

        it('USCon1 -> Caso positivo: Iniciar sesión con body correcto y servicio responde exitosamente', async () => {
            req = {
                body: {
                    email: 'test@example.com',
                    password: '123456'
                }
            } as Request;

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

        it('USCon2 -> Caso negativo: No proporcionar email o contraseña en el body', async () => {
            req = {
                body: {}
            } as Request;

            // Llama a la función del controlador
            await userController.logInUserController(req, res, next);

            // Verifica que la respuesta sea la esperada
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.send).toHaveBeenCalledWith({ msg: "Faltan datos en el body" });
        });

        it('USCon3 -> Caso negativo: Servicio responde que no hay un usuario registrado con ese email', async () => {
            req = {
                body: {
                    email: 'unexistent@email.com',
                    password: '123456'
                }
            } as Request;

            const mockResponse = { error: 'No hay un usuario registrado con ese email', status: 404 };

            // Configura el mock del servicio para que devuelva una respuesta exitosa
            mockedUserService.logInUserService.mockResolvedValue(mockResponse);

            // Llama a la función del controlador
            await userController.logInUserController(req, res, next);

            // Verifica que la respuesta sea la esperada
            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.send).toHaveBeenCalledWith({ msg: mockResponse.error });
        });

        it('USCon4 -> Caso negativo: Servicio responde que la contraseña es incorrecta', async () => {
            req = {
                body: {
                    email: 'existent@email.com',
                    password: 'wrongPassword'
                }
            } as Request;

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

        const mockedUser: Person = {
            email: 'validuser@example.com',
            password: 'Valid123',
            nombre: 'Valid',
            apellidos: 'User',
            tipoDiscapacidad: 'Ninguna'
        };

        const confirmSamePassword = 'Valid123';

        it('USCon5 -> Caso positivo: Registro con datos válidos y servicio responde exitosamente', async () => {
            req = {
                body: { ...mockedUser, confirmPassword: confirmSamePassword }
            } as Request;

            // Configura el mock del servicio para que devuelva una respuesta exitosa
            mockedUserService.registerUsuarioService.mockResolvedValue({ usuario: mockedUser } as any);

            // Llama a la función del controlador
            await userController.registerUserController(req, res, next);

            // Verifica que la respuesta sea la esperada
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.send).toHaveBeenCalledWith({ msg: 'Usuario creado correctamente', user: mockedUser });
        });

        it('USCon6 -> Caso negativo: No proporcionar información completa de usuario en el body', async () => {
            req = {
                body: {}
            } as Request;

            // Llama a la función del controlador
            await userController.registerUserController(req, res, next);

            // Verifica que la respuesta sea la esperada
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.send).toHaveBeenCalledWith({ msg: "Faltan datos en el body" });
        });

        it('USCon7 -> Caso negativo: Servicio responde que ya existe un usuario con ese email', async () => {

            const mockedExistingUser: Person = {
                email: 'existinguser@example.com',
                password: 'Valid123',
                nombre: 'Existing',
                apellidos: 'User',
                tipoDiscapacidad: 'Ninguna'
            };
            req = {
                body: { ...mockedExistingUser, confirmPassword: confirmSamePassword }
            } as Request;

            const mockResponse = { error: 'Ya existe un usuario con ese email', status: 409 };

            // Configura el mock del servicio para que devuelva una respuesta de error
            mockedUserService.registerUsuarioService.mockResolvedValue(mockResponse);

            // Llama a la función del controlador
            await userController.registerUserController(req, res, next);

            // Verifica que la respuesta sea la esperada
            expect(res.status).toHaveBeenCalledWith(mockResponse.status);
            expect(res.send).toHaveBeenCalledWith({ msg: mockResponse.error });
        });

        it('USCon8 -> Caso negativo: Las contraseñas no coinciden', async () => {
            req = {
                body: {
                    ...mockedUser,
                    confirmPassword: 'Different123'
                }
            } as Request;

            // Llama a la función del controlador
            await userController.registerUserController(req, res, next);

            // Verifica que la respuesta sea la esperada
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.send).toHaveBeenCalledWith({ msg: 'Las contraseñas no coinciden' });
        });

        it('USCon9 -> Caso negativo: El email no cumple las restricciones', async () => {
            req = {
                body: {
                    ...mockedUser,
                    email: 'invalidemail',
                    confirmPassword: mockedUser.password
                }
            } as Request;

            // Llama a la función del controlador
            await userController.registerUserController(req, res, next);

            // Verifica que la respuesta sea la esperada
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.send).toHaveBeenCalledWith({ msg: "Introduzca un email válido" });
        });

        it('USCon10 -> Caso negativo: La contraseña no cumple las restricciones', async () => {
            req = {
                body: {
                    ...mockedUser,
                    password: 'short',
                    confirmPassword: 'short'
                }
            } as Request;

            // Llama a la función del controlador
            await userController.registerUserController(req, res, next);

            // Verifica que la respuesta sea la esperada
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.send).toHaveBeenCalledWith({ msg: "La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula y un número" });
        });
    });

    describe('deleteUserController', () => {

        it('USCon11 -> Caso positivo: Borrar usuario con id válido y servicio responde exitosamente', async () => {
            req = { params: { userId: 'validUserId' } } as unknown as Request;

            // Configura el mock del servicio para que devuelva una respuesta exitosa
            mockedUserService.deleteUsuarioService.mockResolvedValue({ status: 200 });

            // Llama a la función del controlador
            await userController.deleteUserController(req as any, res, next);

            // Verifica que la respuesta sea la esperada
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.send).toHaveBeenCalledWith({ msg: 'Usuario borrado correctamente' });
        });

        it('USCon12 -> Caso negativo: Servicio response que no hay un usuario con ese id', async () => {
            req = { params: { userId: 'nonExistentUserId' } } as unknown as Request;

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
        it('USCon13 -> Caso positivo: Guardar sitio con body correcto y servicio responde exitosamente', async () => {
            req = {
                body: {
                    userId: 'validUserId',
                    site: 'validSite'
                }
            } as Request;


            // Configura el mock del servicio para que devuelva una respuesta exitosa
            mockedUserService.saveSiteService.mockResolvedValue({ status: 200 });
            await userController.saveSiteController(req, res, next);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.send).toHaveBeenCalledWith({ msg: 'Sitio guardado correctamente' });
        });

        it('USCon14 -> Caso negativo: No proporcionar userId o site en el body', async () => {
            req = {
                body: {}
            } as Request;


            await userController.saveSiteController(req, res, next);
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.send).toHaveBeenCalledWith({ msg: 'Faltan datos en el body' });
        });

        it('USCon15 -> Caso negativo: Servicio responde que el sitio ya está guardado', async () => {
            req = {
                body: {
                    userId: 'validUserId',
                    site: 'alreadySavedSite'
                }
            } as Request;


            const mockResponse = { error: 'El sitio ya está guardado', status: 409 };
            mockedUserService.saveSiteService.mockResolvedValue(mockResponse);

            await userController.saveSiteController(req, res, next);

            expect(res.status).toHaveBeenCalledWith(mockResponse.status);
            expect(res.send).toHaveBeenCalledWith({ msg: mockResponse.error });
        });
    });

    describe('unsaveSiteController', () => {

        it('USCon16 -> Caso positivo: Eliminar sitio con body correcto y servicio responde exitosamente', async () => {
            req = {
                body: {
                    userId: 'validUserId',
                    placeId: 'validPlaceId'
                }
            } as Request;

            mockedUserService.unsaveSiteService.mockResolvedValue({ status: 200 });
            await userController.unsaveSiteController(req, res, next);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.send).toHaveBeenCalledWith({ msg: 'Sitio eliminado correctamente de la lista de guardados' });
        });

        it('USCon17 -> Caso negativo: No proporcionar userId o placeId en el body', async () => {
            req = {
                body: {}
            } as Request;

            await userController.unsaveSiteController(req, res, next);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.send).toHaveBeenCalledWith({ msg: 'Faltan datos en el body' });
        });

        it('USCon18 -> Caso negativo: Servicio responde que el sitio no está guardado o no esta en la lista', async () => {
            req = {
                body: {
                    userId: 'validUserId',
                    placeId: 'nonExistentPlaceId'
                }
            } as Request;

            const mockResponse = { error: 'El sitio ya ha sido eliminado o no está en la lista', status: 409 };
            mockedUserService.unsaveSiteService.mockResolvedValue(mockResponse);
            await userController.unsaveSiteController(req, res, next);

            expect(res.status).toHaveBeenCalledWith(mockResponse.status);
            expect(res.send).toHaveBeenCalledWith({ msg: mockResponse.error });
        });
    });

    describe('getSavedSitesController', () => {

        it('USCon19 -> Caso positivo: Obtener sitios guardados con userId válido y servicio responde exitosamente', async () => {
            req = {
                params: {
                    userId: 'validUserId'
                }
            } as any;

            const mockResponse = { savedSites: [site1, site2] as any };

            mockedUserService.getSavedSitesService.mockResolvedValue(mockResponse);

            await userController.getSavedSitesController(req, res, next);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.locals.sitios).toEqual(mockResponse.savedSites);
            expect(res.locals.mensaje).toEqual('Sitios guardados obtenidos correctamente');
        });

        it('USCon20 -> Caso negativo: Servicio responde que no hay un usuario registrado con ese id', async () => {
            req = {
                params: {
                    userId: 'invalidUserId'
                }
            } as any;

            const mockResponse = { error: "No hay un usuario registrado con ese id", status: 404 };

            mockedUserService.getSavedSitesService.mockResolvedValue(mockResponse);

            await userController.getSavedSitesController(req, res, next);

            expect(res.status).toHaveBeenCalledWith(mockResponse.status);
            expect(res.send).toHaveBeenCalledWith({ msg: mockResponse.error });
        });
    });

    describe('getUserCommentsController', () => {
        it('USCon21 -> Caso positivo: Obtener comentarios con userId válido y servicio responde exitosamente', async () => {
            req = {
                params: {
                    userId: 'validUserId'
                }
            } as any;

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

        it('USCon22 -> Caso negativo: Servicio responde con un error', async () => {
            req = {
                params: {
                    userId: 'validUserId'
                }
            } as any;

            const mockResponse = new Error('Error en el servicio');

            mockedUserService.getUserCommentsService.mockRejectedValue(mockResponse);

            await userController.getUserCommentsController(req, res, next);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.send).toHaveBeenCalledWith({ msg: "Error en obtencion de comentarios del usuario: " + mockResponse.message });
        });
    });

    describe('getUserPhotosController', () => {
        it('USCon23 -> Caso positivo: Obtener fotos con userId válido y servicio responde exitosamente', async () => {
            req = {
                params: { userId: 'validUserId' }
            } as any;

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

        it('USCon24 -> Caso negativo: Servicio responde con un error', async () => {
            req = {
                params: { userId: 'invalidUserId' }
            } as any;

            const mockError = new Error('Error en el servicio');
            mockedUserService.getUserPhotosService.mockRejectedValue(mockError);

            await userController.getUserPhotosController(req, res, next);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.send).toHaveBeenCalledWith({ msg: "Error en obtencion de fotos del usuario: " + mockError.message });
        });
    });

    describe('getUserRatingsController', () => {


        it('USCon25 -> Caso positivo: Obtener valoraciones con userId válido y servicio responde exitosamente', async () => {
            req = {
                params: { userId: 'validUserId' }
            } as any;

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

        it('USCon26 -> Caso negativo: Servicio responde con un error', async () => {
            req = {
                params: { userId: 'invalidUserId' }
            } as any;

            const mockError = new Error('Error en el servicio');
            mockedUserService.getUserRatingsService.mockRejectedValue(mockError);

            await userController.getUserRatingsController(req, res, next);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.send).toHaveBeenCalledWith({ msg: "Error en obtencion de valoraciones del usuario: " + mockError.message });
        });
    });

    describe('editUserController', () => {
        // Caso positivo: Editar usuario con body correcto y servicio responde exitosamente.
        it('USCon27 -> Caso positivo: Editar usuario con body correcto y servicio responde exitosamente', async () => {
            req = {
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

            // Mock del servicio para simular una respuesta exitosa
            mockedUserService.editUserService.mockResolvedValue({ status: 200 });

            await userController.editUserController(req, res, next);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.send).toHaveBeenCalledWith({ msg: 'Usuario editado correctamente' });
        });

        // Caso negativo: No proporcionar información completa de usuario en el body.
        it('USCon28 -> Caso negativo: No proporcionar información completa de usuario en el body', async () => {
            req = {
                body: {
                    person: {
                        _id: 'userId',
                        nombre: 'Test User Updated',
                        apellidos: 'User Updated',
                    }
                },
            } as Request;

            await userController.editUserController(req, res, next);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.send).toHaveBeenCalledWith({ msg: 'Faltan datos en el body' });
        });

        // Caso negativo: Servicio responde que no pudo actualizar el usuario.
        it('USCon29 -> Caso negativo: Servicio responde que no pudo actualizar el usuario', async () => {
            req = {
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

            const errorMessage = 'Servicio no disponible'
            // Mock del servicio para simular un fallo al actualizar
            mockedUserService.editUserService.mockRejectedValue(new Error(errorMessage));

            await userController.editUserController(req, res, next);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.send).toHaveBeenCalledWith({ msg: 'Error en edición del usuario: ' + errorMessage });
        });
    });

    describe('editPasswordController', () => {
        // Caso positivo: Cambiar contraseña con body correcto y servicio responde exitosamente.
        it('USCon30 -> Caso positivo: Cambiar contraseña con body correcto y servicio responde exitosamente', async () => {
            req = {
                params: { userId: 'userId' },
                body: {
                    oldPassword: 'oldPassword1',
                    newPassword: 'newPassword2',
                    confirmNewPassword: 'newPassword2'
                }
            } as any;

            mockedUserService.editPasswordService.mockResolvedValue({ status: 200 });

            await userController.editPasswordController(req, res, next);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.send).toHaveBeenCalledWith({ msg: 'Contraseña editada correctamente' });
        });

        // Caso negativo: No proporcionar oldPassword o newPassword en el body.
        it('USCon31 -> Caso negativo: No proporcionar oldPassword o newPassword en el body', async () => {
            req = {
                body: {},
                params: { userId: 'userId' }
            } as any;

            await userController.editPasswordController(req, res, next);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.send).toHaveBeenCalledWith({ msg: 'Faltan datos en el body' });
        });

        // Caso negativo: Servicio responde que la contraseña actual es incorrecta.
        it('USCon32 -> Caso negativo: Servicio responde que la contraseña actual es incorrecta', async () => {
            req = {
                params: { userId: 'userId' },
                body: {
                    oldPassword: 'wrongOldPassword1',
                    newPassword: 'newPassword2',
                    confirmNewPassword: 'newPassword2'
                }
            } as any;

            mockedUserService.editPasswordService.mockResolvedValue({ error: 'Contraseña actual incorrecta', status: 401 });

            await userController.editPasswordController(req, res, next);

            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.send).toHaveBeenCalledWith({ msg: 'Contraseña actual incorrecta' });
        });

        // Caso negativo: Las contraseñas no coinciden.
        it('USCon33 -> Caso negativo: Las contraseñas no coinciden', async () => {
            req = {
                params: { userId: 'userId' },
                body: {
                    oldPassword: 'oldPassword1',
                    newPassword: 'newPassword2',
                    confirmNewPassword: 'newDifferentPassword2'
                }
            } as any;

            await userController.editPasswordController(req, res, next);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.send).toHaveBeenCalledWith({ msg: 'Las contraseñas no coinciden' });
        });

        // Caso negativo: La nueva contraseña no cumple con las condiciones.
        it('USCon34 -> Caso negativo: La nueva contraseña no cumple con las condiciones', async () => {
            req = {
                params: { userId: 'userId' },
                body: {
                    oldPassword: 'oldPassword1',
                    newPassword: 'newpassword',
                    confirmNewPassword: 'newpassword'
                }
            } as any;

            await userController.editPasswordController(req, res, next);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.send).toHaveBeenCalledWith({ msg: "La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula y un número" });
        });
    });

});

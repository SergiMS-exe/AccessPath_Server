jest.mock('bcryptjs');
import bcrypt from 'bcryptjs';
const mockedBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;

jest.mock('../../../src/models/usuarioModel');
import UsuarioModel from '../../../src/models/usuarioModel';
const mockedUserModel = UsuarioModel as jest.Mocked<typeof UsuarioModel>;

jest.mock('../../../src/models/sitioModel');
import SitioModel from '../../../src/models/sitioModel';
const mockedSiteModel = SitioModel as jest.Mocked<typeof SitioModel>;

jest.mock('../../../src/models/valoracionModel');
import ValoracionModel from '../../../src/models/valoracionModel';
const mockedValoracionModel = ValoracionModel as jest.Mocked<typeof ValoracionModel>;

import * as userService from '../../../src/services/usuariosService';
import Person from '../../../src/interfaces/Person';
import { Site } from '../../../src/interfaces/Site';
import { Types } from 'mongoose';
import { Valoracion } from '../../../src/interfaces/Valoracion';

describe('userService', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    const user: Person = {
        _id: new Types.ObjectId(),
        nombre: 'Jane',
        apellidos: 'Doe',
        email: 'jane@example.com',
        password: 'securePassword123',
        tipoDiscapacidad: 'Ninguna'
    };

    const site1: Site = {
        placeId: 'site1',
        nombre: 'Site 1',
        location: {
            latitude: 0,
            longitude: 0,
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
            latitude: 0,
            longitude: 0,
        },
        direccion: 'Site 2 address',
        types: ['type1', 'type2'],
        calificacionGoogle: 5,
        fotos: [{
            usuarioId: '12345',
            base64: 'base64EncodedString',
            alternativeText: 'Site 2'
        },
        {
            usuarioId: '12345',
            base64: 'base64EncodedString',
            alternativeText: 'Site 2'
        }],
    };

    const rating1: Valoracion = {
        placeId: 'site1',
        userId: '12345',
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
    };

    const resultCorrectUpdated = {
        acknowledged: true,
        modifiedCount: 1,
        upsertedId: null,
        upsertedCount: 0,
        matchedCount: 1
    };

    describe('registerUsuarioService', () => {
        afterEach(() => {
            mockedBcrypt.compareSync.mockReset();
        });

        it('USSer1 -> Caso positivo: Registro de un nuevo usuario con datos válidos', async () => {
            mockedUserModel.findOne.mockResolvedValue(null);
            mockedUserModel.create = jest.fn().mockResolvedValue(user);

            const result = await userService.registerUsuarioService(user);

            expect(result).toEqual({ usuario: user });
        });

        it('USSer2 -> Caso negativo: Intento de registrar un usuario con un correo electrónico ya existente', async () => {
            mockedUserModel.findOne.mockResolvedValue(user);

            const response = await userService.registerUsuarioService(user);

            expect(response).toEqual({ error: "Ya hay un usuario con ese email", status: 409 });
        });

    });

    describe('logInUserService', () => {
        it('USSer4 -> Caso positivo: Inicio de sesión con credenciales válidas', async () => {

            mockedUserModel.findOne.mockResolvedValue(user);
            mockedBcrypt.compare = jest.fn().mockResolvedValue(true); //Mockeamos la función compare de bcrypt para que devuelva true

            const result = await userService.logInUserService({
                email: user.email,
                password: user.password!
            });

            expect(result).toEqual({ usuario: user });
        });

        it('USSer5 -> Caso negativo: Inicio de sesión con un correo electrónico inexistente', async () => {
            mockedUserModel.findOne.mockResolvedValue(null);

            const response = await userService.logInUserService({
                email: 'nonexistent@example.com',
                password: 'anyPassword'
            })

            expect(response).toEqual({ error: "No hay un usuario registrado con ese email", status: 404 });
        });

        it('USSer6 -> Caso negativo: Inicio de sesión con una contraseña incorrecta', async () => {
            mockedUserModel.findOne.mockResolvedValue(user);
            mockedBcrypt.compare = jest.fn().mockResolvedValue(false); //Mockeamos la función compare de bcrypt para que devuelva false

            const response = await userService.logInUserService({
                email: user.email,
                password: 'wrongPassword'
            })

            expect(response).toEqual({ error: "Contraseña incorrecta", status: 401 });
        });
    });

    describe('deleteUsuarioService', () => {
        it('USSer6 -> Caso positivo: Eliminación de un usuario existente usando su ID', async () => {
            // Mock para simular que se encontró y eliminó un usuario
            mockedUserModel.findOneAndDelete.mockResolvedValue(user);

            const result = await userService.deleteUsuarioService('userId');

            expect(result).toEqual({ status: 200 });
        });

        it('USSer7 -> Caso negativo: Intento de eliminar un usuario con un ID inexistente', async () => {
            // Mock para simular que no se encontró el usuario
            mockedUserModel.findOneAndDelete.mockResolvedValue(null);

            const result = await userService.deleteUsuarioService('nonexistentUserId');

            expect(result).toEqual({ error: "No hay un usuario registrado con ese id", status: 404 });
        });
    });

    describe('saveSiteService', () => {
        const site: Site = {
            placeId: 'uniquePlaceId123',
            nombre: 'Statue of Liberty',
            direccion: 'Liberty Island, New York, NY 10004, USA',
            calificacionGoogle: 4.5,
            location: {
                latitude: 40.748817,
                longitude: -73.985428
            },
            types: ['monument', 'historical'],
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
            },
            comentarios: [{
                _id: new Types.ObjectId(),
                usuarioId: '12345',
                texto: 'Great place to visit!',
                date: new Date()
            }],
            fotos: [{
                usuarioId: '12345',
                base64: 'base64EncodedString',
                alternativeText: 'Statue of Liberty'
            }]
        };

        it('USSer8 -> Caso positivo: Guardar un nuevo sitio para un usuario existente', async () => {
            // Mocks para simular un usuario encontrado sin el sitio ya guardado
            const siteToReturn = { ...site, placeId: 'newPlaceId' };

            mockedUserModel.updateOne.mockResolvedValue(resultCorrectUpdated);
            mockedUserModel.findOne.mockResolvedValue({ ...user, saved: [] });
            mockedSiteModel.findOneAndUpdate.mockResolvedValue(siteToReturn);

            const result = await userService.saveSiteService('userId', siteToReturn);

            expect(result).toEqual({ status: 200 });
        });

        it('USSer9 -> Caso negativo: Intento de guardar un sitio para un usuario con un ID inexistente', async () => {
            // Mock para simular que no se encontró el usuario
            mockedUserModel.findOne.mockResolvedValue(null);

            const siteToReturn = { ...site, placeId: 'newPlaceId' };
            const result = await userService.saveSiteService('nonexistentUserId', siteToReturn);

            expect(result).toEqual({ error: "No hay un usuario registrado con ese id", status: 404 });
        });

        it('USSer10 -> Caso negativo: Intento de guardar un sitio que ya ha sido guardado previamente por el usuario', async () => {
            // Mocks para simular un usuario encontrado con el sitio ya guardado
            mockedUserModel.findOne.mockResolvedValue({ ...user, saved: ['placeIdAlreadySaved'] });

            const siteToReturn = { ...site, placeId: 'placeIdAlreadySaved' };
            const result = await userService.saveSiteService('userId', siteToReturn);

            expect(result).toEqual({ error: "El sitio ya está guardado", status: 409 });
        });
    });

    describe('unsaveSiteService', () => {
        it('USSer11 -> Caso positivo: Eliminar un sitio guardado de la lista de un usuario existente', async () => {
            mockedUserModel.findOne.mockResolvedValue({ ...user, saved: ['siteId'] });
            mockedUserModel.updateOne.mockResolvedValue(resultCorrectUpdated);

            const result = await userService.unsaveSiteService('userId', 'siteId');

            expect(result).toEqual({ status: 200 });
        });

        it('USSer12 -> Caso negativo: Intento de eliminar un sitio de la lista de un usuario con un ID inexistente', async () => {
            mockedUserModel.findOne.mockResolvedValue(null);

            const result = await userService.unsaveSiteService('nonexistentUserId', 'siteId');

            expect(result).toEqual({ error: "No hay un usuario registrado con ese id", status: 404 });
        });

        it('USSer13 -> Caso negativo: Intento de eliminar un sitio que no está en la lista de guardados del usuario', async () => {
            mockedUserModel.findOne.mockResolvedValue({ ...user, saved: [] });

            const result = await userService.unsaveSiteService('userId', 'siteId');

            expect(result).toEqual({ error: "El sitio ya se ha eliminado de la lista de guardados", status: 409 });
        });
    });

    describe('getSavedSitesService', () => {
        it('USSer14 -> Caso positivo: Obtener sitios guardados de un usuario existente', async () => {
            mockedUserModel.findOne.mockResolvedValue({ ...user, saved: ['siteId'] });
            mockedSiteModel.find.mockResolvedValue([site1, site2]);

            const result = await userService.getSavedSitesService('userId');

            expect(result.savedSites).toEqual([site1, site2]);
        });

        it('USSer15 -> Caso negativo: Intento de obtener sitios guardados de un usuario con un ID inexistente', async () => {
            mockedUserModel.findOne.mockResolvedValue(null);

            const result = await userService.getSavedSitesService('nonexistentUserId');

            expect(result).toEqual({ error: "No hay un usuario registrado con ese id", status: 404 });
        });
    });

    describe('getUserCommentsService', () => {
        it('USSer16 -> Caso positivo: Obtener comentarios de un usuario existente', async () => {
            // Simulamos que encontramos un usuario y sus comentarios
            mockedUserModel.findOne.mockResolvedValue(user);
            mockedSiteModel.aggregate.mockResolvedValue([site1]);

            const result = await userService.getUserCommentsService('userId');

            expect(result).toEqual({ sites: [site1] });
        });

        it('USSer17 -> Caso negativo: Intento de obtener comentarios de un usuario con un ID inexistente', async () => {
            // Simulamos que no encontramos el usuario
            mockedUserModel.findOne.mockResolvedValue(null);

            const result = await userService.getUserCommentsService('nonexistentUserId');

            expect(result).toEqual({ error: "No hay un usuario registrado con ese id", status: 404 });
        });
    });

    describe('getUserRatingsService', () => {
        it('USSer18 -> Caso positivo: Obtener valoraciones de un usuario existente', async () => {
            // Simulamos que encontramos un usuario y sus valoraciones
            mockedUserModel.findOne.mockResolvedValue(user);
            mockedValoracionModel.find.mockResolvedValue([rating1]);
            mockedSiteModel.findOne.mockResolvedValue(site1);

            const result = await userService.getUserRatingsService('userId');

            expect(result.sitesWithValoracion).toEqual([{ valoracion: rating1, site: site1 }]);
        });

        it('USSer19 -> Caso negativo: Intento de obtener valoraciones de un usuario con un ID inexistente', async () => {
            // Simulamos que no encontramos el usuario
            mockedUserModel.findOne.mockResolvedValue(null);

            const result = await userService.getUserRatingsService('nonexistentUserId');

            expect(result).toEqual({ error: "No hay un usuario registrado con ese id", status: 404 });
        });
    });

    describe('getUserPhotosService', () => {
        it('USSer20 -> Caso positivo: Obtener fotos de un usuario existente', async () => {
            mockedUserModel.findOne.mockResolvedValue(user);
            mockedSiteModel.aggregate.mockResolvedValue([site2]);

            const result = await userService.getUserPhotosService('userId');

            expect(result).toEqual({ sites: [site2] });
        });

        it('USSer21 -> Caso negativo: Intento de obtener fotos de un usuario con un ID inexistente', async () => {
            mockedUserModel.findOne.mockResolvedValue(null);

            const result = await userService.getUserPhotosService('nonexistentUserId');

            expect(result).toEqual({ error: "No hay un usuario registrado con ese id", status: 404 });
        });
    });

    describe('editUserService', () => {
        it('USSer22 -> Caso positivo: Editar información de un usuario existente', async () => {

            mockedUserModel.findOne.mockResolvedValue(user);
            mockedUserModel.updateOne.mockResolvedValue(resultCorrectUpdated);

            const result = await userService.editUserService({ ...user, nombre: 'Pedro' });

            expect(result).toEqual({ status: 200 });
        });

        it('USSer23 -> Caso negativo: Intento de editar información de un usuario con un ID inexistente', async () => {
            mockedUserModel.findOne.mockResolvedValue(null);

            const result = await userService.editUserService({ ...user, nombre: 'Pedro' });

            expect(result).toEqual({ error: "No hay un usuario registrado con ese id", status: 404 });
        });
    });

    describe('editPasswordService', () => {
        beforeEach(() => {
            jest.clearAllMocks();
        });

        it('USSer24 -> Caso positivo: Cambiar contraseña de un usuario existente con contraseña actual correcta', async () => {
            mockedUserModel.findOne.mockResolvedValue(user);
            mockedBcrypt.compare = jest.fn().mockResolvedValue(true);
            mockedUserModel.updateOne.mockResolvedValue(resultCorrectUpdated);

            const result = await userService.editPasswordService('userId', 'oldPassword', 'newPassword');

            expect(mockedBcrypt.compare).toHaveBeenCalledWith('oldPassword', user.password);
            expect(mockedBcrypt.hash).toHaveBeenCalledWith('newPassword', expect.any(Number));
            expect(result).toEqual({ status: 200 });
        });

        it('USSer25 -> Caso negativo: Intento de cambiar contraseña de un usuario con un ID inexistente', async () => {
            mockedUserModel.findOne.mockResolvedValue(null);

            const result = await userService.editPasswordService('nonexistentUserId', 'oldPassword', 'newPassword');

            expect(result).toEqual({ error: "No hay un usuario registrado con ese id", status: 404 });
        });

        it('USSer26 -> Caso negativo: Cambiar contraseña de un usuario existente con contraseña actual incorrecta', async () => {
            mockedUserModel.findOne.mockResolvedValue(user);
            mockedBcrypt.compare = jest.fn().mockResolvedValue(false);

            const result = await userService.editPasswordService('userId', 'incorrectOldPassword', 'newPassword');

            expect(mockedBcrypt.compare).toHaveBeenCalledWith('incorrectOldPassword', user.password);
            expect(result).toEqual({ error: "Contraseña actual incorrecta", status: 401 });
        });
    });

});
import request from 'supertest';
import app from '../../src/app';
import { closeTestDb, initializeTestDb, setUpDBData, sitios, usuarios } from '../../src/utils/testDB';
import { ObjectId } from 'mongodb';

describe('Test de integración de los usuarios', () => {
    beforeAll(async () => {
        await initializeTestDb();
    });

    afterAll(async () => {
        await closeTestDb();
    });

    beforeEach(async () => {
        await setUpDBData();
    });

    describe('Registro', () => {

        it('USSer1 -> Caso positivo: Registro de un nuevo usuario con datos válidos', async () => {
            const newUser = {
                nombre: 'John',
                apellidos: 'Doe',
                email: 'john.doe@example.com',
                password: 'Password123',
                confirmPassword: 'Password123',
                tipoDiscapacidad: 'Ninguna'
            };

            const response = await request(app)
                .post('/users/register')
                .send(newUser);

            expect(response.statusCode).toBe(200);
            expect(response.body.user).toHaveProperty('_id');
            expect(response.body.user).toHaveProperty('email', newUser.email);
        });

        it('USSer2 -> Caso negativo: Intento de registrar un usuario con un correo electrónico ya existente', async () => {
            const existentUser = { ...usuarios[0], confirmPassword: usuarios[0].password };

            const response = await request(app)
                .post('/users/register')
                .send(existentUser)

            expect(response.statusCode).toBe(409);
            expect(response.body.msg).toBe('Ya hay un usuario con ese email');
        });
    });

    describe('Inicio de sesión', () => {
        it('InUs3 -> Caso positivo: Iniciar sesión con las credenciales del usuario recién registrado', async () => {
            const loginDetails = {
                email: usuarios[0].email,
                password: usuarios[0].password
            };

            const response = await request(app)
                .post('/users/login')
                .send(loginDetails);

            expect(response.statusCode).toBe(200);
            expect(response.body.user.email).toBe(usuarios[0].email);
            expect(response.body.user.nombre).toBe(usuarios[0].nombre);
        });

        it('InUs4 -> Caso negativo: Intentar iniciar sesión con un email que no existe', async () => {
            const loginDetails = {
                email: 'nonexistent@example.com',
                password: 'Password123'
            };

            const response = await request(app)
                .post('/users/login')
                .send(loginDetails);

            expect(response.statusCode).toBe(404);
            expect(response.body.msg).toBe('No hay un usuario registrado con ese email');
        });

        it('InUs5 -> Caso negativo: Iniciar sesión con el email correcto, pero contraseña incorrecta', async () => {
            const loginDetails = {
                email: usuarios[0].email,
                password: 'WrongPassword123'
            };

            const response = await request(app)
                .post('/users/login')
                .send(loginDetails);

            expect(response.statusCode).toBe(401);
            expect(response.body.msg).toBe('Contraseña incorrecta');
        });

    });

    describe('Edición de información del usuario', () => {

        it('InUs6 -> Caso positivo: Editar la información del usuario previamente registrado', async () => {
            const updatedUser = {
                _id: usuarios[0]._id,
                nombre: 'Jane',
                apellidos: 'Doe',
                email: 'jane.doe@example.com',
                tipoDiscapacidad: 'Física'
            };

            const response = await request(app)
                .put('/users/' + usuarios[0]._id)
                .send({ person: updatedUser });

            expect(response.statusCode).toBe(200);
            expect(response.body.msg).toBe('Usuario editado correctamente');
        });

        it('InUs7 -> Caso negativo: Intentar editar un usuario que no existe', async () => {
            const nonExistentUser = {
                _id: new ObjectId(), // ID que no existe en la base de datos
                nombre: 'Unknow',
                apellidos: 'User',
                email: 'unknown@example.com',
                tipoDiscapacidad: 'Ninguna'
            };

            const response = await request(app)
                .put('/users/' + usuarios[0]._id)
                .send({ person: nonExistentUser });

            expect(response.statusCode).toBe(404);
            expect(response.body.msg).toBe('No hay un usuario registrado con ese id');
        });

    });

    describe('Cambio de contraseña de usuario', () => {
        it('InUs8 -> Caso positivo: Cambiar la contraseña del usuario registrado correctamente', async () => {
            const passwordChangeDetails = {
                oldPassword: usuarios[0].password,
                newPassword: 'NewPassword123',
                confirmNewPassword: 'NewPassword123'
            };

            const response = await request(app)
                .put('/users/password/' + usuarios[0]._id)
                .send(passwordChangeDetails);

            expect(response.statusCode).toBe(200);
            expect(response.body.msg).toBe('Contraseña editada correctamente');
        });

        it('InUs9 -> Caso negativo: Intentar cambiar la contraseña de un usuario que no existe', async () => {
            const passwordChangeDetails = {
                oldPassword: 'Password_1',
                newPassword: 'NewPassword123',
                confirmNewPassword: 'NewPassword123'
            };
            const nonExistentId = '1234567890abcdef12345678';

            const response = await request(app)
                .put('/users/password/' + nonExistentId)
                .send(passwordChangeDetails);

            expect(response.statusCode).toBe(404);
            expect(response.body.msg).toBe('No hay un usuario registrado con ese id');
        });

        it('InUs10 -> Caso negativo: Intentar cambiar la contraseña utilizando una contraseña actual incorrecta', async () => {
            const passwordChangeDetails = {
                oldPassword: 'WrongPassword123',
                newPassword: 'NewPassword123',
                confirmNewPassword: 'NewPassword123'
            };

            const response = await request(app)
                .put('/users/password/' + usuarios[0]._id)
                .send(passwordChangeDetails);

            expect(response.statusCode).toBe(401);
            expect(response.body.msg).toBe('Contraseña actual incorrecta');
        });

    });

    describe('Guardar sitio', () => {

        it('InUs11 -> Caso positivo: Guardar un sitio para el usuario registrado', async () => {
            const siteToSave = sitios[0];
            const response = await request(app)
                .put('/users/saveSite')
                .send({ userId: usuarios[0]._id, site: siteToSave });

            expect(response.statusCode).toBe(200);
            expect(response.body.msg).toBe('Sitio guardado correctamente');
        });

        it('InUs12 -> Caso negativo: Intentar guardar un sitio para un usuario que no existe', async () => {
            const siteToSave = sitios[0];
            const nonExistentUserId = '1234567890abcdef12345678';
            const response = await request(app)
                .put('/users/saveSite')
                .send({ userId: nonExistentUserId, site: siteToSave });

            expect(response.statusCode).toBe(404);
            expect(response.body.msg).toBe('No hay un usuario registrado con ese id');
        });
    });

    describe('Obtener sitios guardados', () => {

        it('InUs13 -> Caso positivo: Obtener la lista de sitios guardados para el usuario registrado', async () => {
            const response = await request(app)
                .get('/users/savedSites/' + usuarios[0]._id);

            expect(response.statusCode).toBe(200);
            expect(response.body.msg).toBe('Sitios guardados obtenidos correctamente');
            // Verificar que la lista de sitios guardados es correcta
        });

        it('InUs14 -> Caso negativo: Intentar obtener la lista de sitios guardados de un usuario que no existe', async () => {
            const nonExistentUserId = '1234567890abcdef12345678';
            const response = await request(app)
                .get('/users/savedSites/' + nonExistentUserId);

            expect(response.statusCode).toBe(404);
            expect(response.body.msg).toBe('No hay un usuario registrado con ese id');
        });
    });

    describe('Eliminar usuario', () => {
        it('InUs15 -> Caso positivo: Eliminar el usuario previamente registrado', async () => {
            const response = await request(app)
                .delete('/users/' + usuarios[0]._id);

            expect(response.statusCode).toBe(200);
            expect(response.body.msg).toBe('Usuario borrado correctamente');
        });

        it('InUs16 -> Caso negativo: Intentar eliminar un usuario que no existe', async () => {
            const nonExistentUserId = '1234567890abcdef12345678';
            const response = await request(app)
                .delete('/users/' + nonExistentUserId);

            expect(response.statusCode).toBe(404);
            expect(response.body.msg).toBe('No hay un usuario registrado con ese id');
        });
    });

    describe('Obtener comentarios de usuario', () => {
        it('InUs17 -> Caso positivo: Obtener los comentarios realizados por el usuario registrado', async () => {
            const response = await request(app)
                .get('/users/comments/' + usuarios[0]._id);

            expect(response.statusCode).toBe(200);
            expect(response.body.msg).toBe('Comentarios obtenidos correctamente');
        });

        it('InUs18 -> Caso negativo: Intentar obtener los comentarios de un usuario que no existe', async () => {
            const nonExistentUserId = '1234567890abcdef12345678';
            const response = await request(app)
                .get('/users/comments/' + nonExistentUserId);

            expect(response.statusCode).toBe(404);
            expect(response.body.msg).toBe('No hay un usuario registrado con ese id');
        });
    });

    describe('Obtener valoraciones de usuario', () => {
        beforeEach(async () => {
            await setUpDBData();
        });

        it('InUs19 -> Caso positivo: Obtener las valoraciones realizadas por el usuario registrado', async () => {
            const response = await request(app)
                .get('/users/ratings/' + usuarios[0]._id);

            expect(response.statusCode).toBe(200);
            expect(response.body.msg).toBe('Valoraciones obtenidas correctamente');
        });

        it('InUs20 -> Caso negativo: Intentar obtener las valoraciones de un usuario que no existe', async () => {
            const nonExistentUserId = '1234567890abcdef12345678';
            const response = await request(app)
                .get('/users/ratings/' + nonExistentUserId);

            expect(response.statusCode).toBe(404);
            expect(response.body.msg).toBe('No hay un usuario registrado con ese id');
        });
    });

    describe('Obtener fotos de usuario', () => {
        beforeEach(async () => {
            await setUpDBData();
        });

        it('InUs21 -> Caso positivo: Obtener las fotos subidas por el usuario registrado', async () => {
            const response = await request(app)
                .get('/users/photos/' + usuarios[0]._id);

            expect(response.statusCode).toBe(200);
            expect(response.body.msg).toBe('Fotos obtenidas correctamente');
        });

        it('InUs22 -> Caso negativo: Intentar obtener las fotos de un usuario que no existe', async () => {
            const nonExistentUserId = '1234567890abcdef12345678';
            const response = await request(app)
                .get('/users/photos/' + nonExistentUserId);

            expect(response.statusCode).toBe(404);
            expect(response.body.msg).toBe('No hay un usuario registrado con ese id');
        });
    });

});
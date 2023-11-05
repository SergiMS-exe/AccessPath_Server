import request from 'supertest';
import app from '../../src/app';
import { closeTestDb, initializeTestDb, setUpDBData, usuarios } from '../../src/utils/testDB';

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
            expect(response.body.user).toBe(usuarios[0]); // Asegúrate de que se devuelva un token de sesión
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
});
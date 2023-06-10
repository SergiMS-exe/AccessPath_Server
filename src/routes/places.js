module.exports = function (app, gestorBD) {
    app.put('/save', async function (req, res) {
        console.log(req.body.site);
        const criterio = {
            placeId: req.body.site.placeId
        }

        const buscarSitio = await gestorBD.obtenerItem('sitios', criterio);
        if (buscarSitio.length == 0) {
            await gestorBD.insertarItem('sitios', req.body.site)
        }

        //Guardamos el sitio en la lista de guardados del usuario
        const criterioUsuario = {
            email: req.body.userEmail
        }
        const saving = await gestorBD.modificarItemPersonalizado('usuarios', criterioUsuario, { $push: { saved: req.body.site.placeId } })

        console.log(saving);
        res.send({ status: 200, data: { msg: "Sitio guardado" } })
    })

    app.put('/unSave', async function (req, res) {
        const criterioUsuario = {
            email: req.body.userEmail
        }
        const saving = await gestorBD.modificarItemPersonalizado('usuarios', criterioUsuario, { $pull: { saved: req.body.site.placeId } })

        console.log(saving);
        res.send({ status: 200, data: { msg: "Sitio desguardado" } })
    })

    app.get('/userSaved', async function (req, res) {
        const criterio = {
            _id: new gestorBD.mongo.ObjectId(req.query.userId),
        }

        const usuario = await gestorBD.obtenerItem('usuarios', criterio);
        console.log(usuario);
        if (usuario[0] && usuario[0].saved.length > 0) {
            const criterioSaved = {
                placeId: { $in: usuario[0].saved }
            }
            const saved = await gestorBD.obtenerItem('sitios', criterioSaved);

            console.log(saved);
            res.send({ status: 200, data: { msg: "Elementos guardados obtenidos", sitios: saved } })
        }
    })

    app.post('/comment', async function (req, res) {
        const critToFindSite = {
            placeId: req.body.placeId
        }
        const addCommentQuery = {
            $push: {
                comentarios: {
                    user: req.body.userId,
                    text: req.body.comment
                }
            }
        }
        const sitio = await gestorBD.obtenerItem('sitios', critToFindSite);

        //Llamar a controlador de errores de bd

        if (sitio.length == 0) {
            await gestorBD.insertarItem('sitios', req.body.site);
        }

        const comment = gestorBD.modificarItemPersonalizado('sitios', critToFindSite, addCommentQuery)
        console.log(comment);
        //Controlar si se ha hecho modificacion o no y notificarlo al usuario
        res.send({ status: 200, data: { msg: "Comentario enviado" } })
    })

    app.get('/comments', async function (req, res) {
        // Primero, encontrar el sitio
        const sitio = await gestorBD.obtenerItem("sitios", { "placeId": req.query.placeId });

        // Si no existe el sitio, regresar un error
        if (sitio.length == 0) {
            return res.send({ status: 404, data: { msg: "No se encontró el sitio con el placeId proporcionado." } })
        }

        // Extraer los ids de usuario de los comentarios
        const userIds = sitio[0].comentarios.map(comentario => new gestorBD.mongo.ObjectId(comentario.user));

        // Obtener la información de los usuarios
        const usuarios = await gestorBD.obtenerItem("usuarios", { "_id": { $in: userIds } });

        // Construir el objeto de comentarios con información del usuario
        const comentarios = sitio[0].comentarios.map(comentario => {
            const usuario = usuarios.find(user => user._id == comentario.user);
            return {
                texto: comentario.text,
                usuario: {
                    _id: usuario._id,
                    nombre: usuario.nombre,
                    apellidos: usuario.apellidos
                }
            };
        });

        // Enviar la respuesta
        res.send({ status: 200, data: { msg: "Comentarios y detalles del usuario obtenidos correctamente", comentarios } });
    });

}
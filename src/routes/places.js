const { ObjectId } = require('mongodb');

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
        const saving = await gestorBD.modificarItem('usuarios', criterioUsuario, { $push: { saved: req.body.site.placeId } })

        console.log(saving);
        res.send({ status: 200, data: { msg: "Sitio guardado" } })
    })

    app.put('/unSave', async function (req, res) {
        const criterioUsuario = {
            email: req.body.userEmail
        }
        const saving = await gestorBD.modificarItem('usuarios', criterioUsuario, { $pull: { saved: req.body.site.placeId } })

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
                    _id: nuevoComentario._id,
                    usuarioId: nuevoComentario.user,
                    texto: nuevoComentario.text
                }
            }
        }
        const sitio = await gestorBD.obtenerItem('sitios', critToFindSite);

        //Llamar a controlador de errores de bd

        if (sitio.length == 0) {
            await gestorBD.insertarItem('sitios', req.body.site);
        }

        const comment = gestorBD.modificarItem('sitios', critToFindSite, addCommentQuery)
        console.log(comment);
        //Controlar si se ha hecho modificacion o no y notificarlo al usuario
        res.send({ status: 200, data: { msg: "Comentario enviado", comment: nuevoComentario } })
    })

    app.put('/comment', async function (req, res) {
        const commentId = req.body.commentId;
        const newText = req.body.newText;

        try {
            // Primero, encontrar el sitio que contiene el comentario
            const sitio = await gestorBD.obtenerItem("sitios", { "placeId": req.body.placeId });

            // Si no existe el sitio, regresar un error
            if (sitio.length === 0) {
                return res.status(404).send({ msg: "No se encontró el sitio con el placeId proporcionado." });
            }

            // Encontrar el comentario en el array de comentarios
            const comment = sitio[0].comentarios.find(comment => comment._id.toString() === commentId);

            // Si no se encuentra el comentario, regresar un error
            if (!comment) {
                return res.status(404).send({ msg: "No se encontró el comentario con el ID proporcionado." });
            }

            comment.texto = newText;
    
            const criterio = {
                "placeId": sitio[0].placeId,
                "comentarios._id": comment._id
            }

            const cambios = {
                $set: {"comentarios.$": comment}
            };

            // Aplicar los cambios en la base de datos
            const modificacion = await gestorBD.modificarItem("sitios", criterio, cambios);
            console.log(modificacion)

            // Enviar la respuesta de éxito
            res.status(200).send({ msg: "Comentario editado correctamente", newComment: comment });
        } catch (error) {
            console.error("Error al editar el comentario:", error);
            res.status(500).send({ msg: "Error al editar el comentario", error: error });
        }
    });


    app.get('/comments', async function (req, res) {
        // Primero, encontrar el sitio
        const sitio = await gestorBD.obtenerItem("sitios", { "placeId": req.query.placeId });

        // Si no existe el sitio, regresar un error
        if (sitio.length == 0) {
            return res.send({ status: 404, data: { msg: "No se encontró el sitio con el placeId proporcionado." } })
        }

        if (!sitio[0].comentarios)
            return res.send({ data: { msg: 'No hay comentarios para este sitio' } });

        // Extraer los ids de usuario de los comentarios
        const userIds = sitio[0].comentarios.map(comentario => new gestorBD.mongo.ObjectId(comentario.usuarioId));

        // Obtener la información de los usuarios
        const usuarios = await gestorBD.obtenerItem("usuarios", { "_id": { $in: userIds } });
        // Construir el objeto de comentarios con información del usuario
        const comentarios = sitio[0].comentarios.map(comentario => {
            const usuario = usuarios.find(user => user._id.equals(comentario.usuarioId));
            return {
                _id: comentario._id,
                texto: comentario.texto,
                usuario: {
                    _id: usuario._id,
                    nombre: usuario.nombre,
                    apellidos: usuario.apellidos
                }
            };
        });


        // Enviar la respuesta
        res.send({ status: 200, data: { msg: "Comentarios obtenidos correctamente", comentarios } });
    });

}
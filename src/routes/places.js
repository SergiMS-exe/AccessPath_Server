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

    app.get('/userSaved', async function(req, res){
        const criterio = {
            _id: new gestorBD.mongo.ObjectId(req.query.userId),
        }

        const usuario = await gestorBD.obtenerItem('usuarios', criterio);
        console.log(usuario);
        if (usuario[0] && usuario[0].saved.length>0) {
            const criterioSaved = {
                placeId: {$in: usuario[0]. saved}
            }
            const saved = await gestorBD.obtenerItem('sitios', criterioSaved);

            console.log(saved);
            res.send({status: 200, data: { msg: "Elementos guardados obtenidos", sitios: saved}})
        }
    })
}
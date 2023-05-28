module.exports = function(app, gestorBD) {

    app.post('/login', function(req, res) {
        const hashedPswd = app.get("crypto").createHmac('sha256', app.get('clave'))
          .update(req.body.password).digest('hex'); //Hash de la contraseña
        const criterio = {
            email: req.body.email,
            password: hashedPswd
        }
        
        gestorBD.obtenerItem('usuarios', criterio).then(usuario => {
            if (usuario===null || usuario===undefined) {
                console.error("Error al iniciar sesión. Usuario: "+req.body.email);
                res.send({status: 500, data: { msg: "Error al iniciar sesión. Usuario: "+req.body.email, user: null}})
            } else {
                if (usuario.length == 0){
                    res.status(404);
                    res.send({status: 404, data: { msg: "Email o contraseña incorrectos", user: undefined}})
                }
                else 
                    res.send({status: 200, data: { msg: "Sesión iniciada correctamente", user: usuario[0]}})
            }
        })
    })

    app.post('/register', function (req, res) {
        const hashedPswd = app.get("crypto").createHmac('sha256', app.get('clave'))
          .update(req.body.password).digest('hex'); //Hash de la contraseña
        
        const userToRegister = {
            nombre: req.body.nombre,
            apellidos: req.body.apellidos,
            email: req.body.email,
            password: hashedPswd,
            tipoDiscapacidad: req.body.tipoDiscapacidad 
        }

        gestorBD.insertarItem('usuarios', userToRegister).then(result => {
            if (result===null || result===undefined) {
                console.error("Error al registrar un usuario. Usuario: "+req.body.email);
                res.send({status: 500, data: { msg: "Error al registrar un usuario. Usuario: "+req.body.email}})
            } else {
                console.log("Usuario registrado correctamente");
                res.send({status: 200, data: { msg: "Usuario registrado correctamente", user: userToRegister}})
            }
        })
    })
}
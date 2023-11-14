# Servidor AccessPath

Este es el servidor del proyecto AccessPath, el cuál se basa en una API REST que permite a cualquier cliente usar los servicios ofrecidos.

Este documento describe cómo funciona el servidor, las rutas disponibles, los endpoints y los requerimientos para cada uno.

## Rutas de Usuarios

### 1. Inicio de sesión
**Endpoint:** `/login`  
**Método:** POST  
**Cuerpo:**  
  - `email`: String (correo electrónico del usuario)  
  - `password`: String (contraseña del usuario)

### 2. Registro de usuario
**Endpoint:** `/register`  
**Método:** POST  
**Cuerpo:**  
  - `username`: String (nombre de usuario)  
  - `password`: String (contraseña)  
  - `email`: String (correo electrónico)

### 3. Cambiar contraseña
**Endpoint:** `/password/:userId`  
**Método:** PUT  
**Parámetros:**  
  - `userId`: String (identificador único del usuario)  
**Cuerpo:**  
  - `password`: String (nueva contraseña)

### 4. Guardar sitio
**Endpoint:** `/saveSite`  
**Método:** PUT  
**Cuerpo:**  
  - `siteId`: String (identificador del sitio a guardar)

### 5. Desguardar sitio
**Endpoint:** `/unsaveSite`  
**Método:** PUT  
**Cuerpo:**  
  - `siteId`: String (identificador del sitio a desguardar)

### 6. Sitios guardados
**Endpoint:** `/savedSites/:userId`  
**Método:** GET  
**Parámetros:**  
  - `userId`: String (identificador único del usuario)

### 7. Comentarios del usuario
**Endpoint:** `/comments/:userId`  
**Método:** GET  
**Parámetros:**  
  - `userId`: String (identificador único del usuario)

### 8. Valoraciones del usuario
**Endpoint:** `/ratings/:userId`  
**Método:** GET  
**Parámetros:**  
  - `userId`: String (identificador único del usuario)

### 9. Fotos del usuario
**Endpoint:** `/photos/:userId`  
**Método:** GET  
**Parámetros:**  
  - `userId`: String (identificador único del usuario)

### 10. Eliminar usuario
**Endpoint:** `/:userId`  
**Método:** DELETE  
**Parámetros:**  
  - `userId`: String (identificador único del usuario)

### 11. Editar usuario
**Endpoint:** `/:userId`  
**Método:** PUT  
**Parámetros:**  
  - `userId`: String (identificador único del usuario)  
**Cuerpo:**  
  - `userData`: Object (datos del usuario a actualizar)


## Rutas de Sitios (`/sites`)

### 1. Lugares Cercanos
**Endpoint:** `/close`  
**Método:** GET  
**Query Params:**  
  - `location`: String (ubicación para buscar lugares cercanos)

### 2. Búsqueda de Lugares
**Endpoint:** `/search`  
**Método:** GET  
**Query Params:**  
  - `query`: String (texto de búsqueda)

### 3. Obtener Comentarios de un Lugar
**Endpoint:** `/comments`  
**Método:** GET  
**Query Params:**  
  - `placeId`: String (identificador del lugar)

### 4. Publicar Comentario
**Endpoint:** `/comment`  
**Método:** POST  
**Cuerpo:**  
  - `placeId`: String (identificador del lugar)  
  - `content`: String (contenido del comentario)  
  - `authorId`: String (identificador del autor)

### 5. Editar Comentario
**Endpoint:** `/comment/:placeId`  
**Método:** PUT  
**Parámetros:**  
  - `placeId`: String (identificador del lugar)  
  - `commentId`: String (identificador del comentario)  
**Cuerpo:**  
  - `content`: String (contenido actualizado del comentario)

### 6. Eliminar Comentario
**Endpoint:** `/comment/:placeId/:commentId`  
**Método:** DELETE  
**Parámetros:**  
  - `placeId`: String (identificador del lugar)  
  - `commentId`: String (identificador del comentario)

### 7. Publicar Valoración
**Endpoint:** `/review`  
**Método:** POST  
**Cuerpo:**  
  - `placeId`: String (identificador del lugar)  
  - `rating`: Number (valoración del lugar)  
  - `content`: String (contenido de la valoración)  
  - `authorId`: String (identificador del autor)

### 8. Editar Valoración
**Endpoint:** `/review/:placeId`  
**Método:** PUT  
**Parámetros:**  
  - `placeId`: String (identificador del lugar)  
  - `reviewId`: String (identificador de la valoración)  
**Cuerpo:**  
  - `rating`: Number (nueva valoración)  
  - `content`: String (contenido actualizado de la valoración)

### 9. Eliminar Valoración
**Endpoint:** `/review/:placeId/:reviewId`  
**Método:** DELETE  
**Parámetros:**  
  - `placeId`: String (identificador del lugar)  
  - `reviewId`: String (identificador de la valoración)

### 10. Publicar Foto
**Endpoint:** `/photo`  
**Método:** POST  
**Cuerpo:**  
  - `placeId`: String (identificador del lugar)  
  - `imageUrl`: String (URL de la imagen)  
  - `authorId`: String (identificador del autor)

### 11. Eliminar Foto
**Endpoint:** `/photo/:placeId/:photoId`  
**Método:** DELETE  
**Parámetros:**  
  - `placeId`: String (identificador del lugar)  
  - `photoId`: String (identificador de la foto)
## Versiones

- Node: 18.16.0
- NPM: 9.5.1 

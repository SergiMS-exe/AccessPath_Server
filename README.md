# Servidor AccessPath

Este es el servidor del proyecto AccessPath, el cuál se basa en una API REST que permite a cualquier cliente usar los servicios ofrecidos.

Este documento describe cómo funciona el servidor, las rutas disponibles, los endpoints y los requerimientos para cada uno.

## Rutas de Usuarios (`/users`)

- **Login**:
  - Endpoint: `POST /login`
  - Body: `{ email: string, password: string }`

- **Registro**:
  - Endpoint: `POST /register`
  - Body: `{ email: string, password: string, nombre: string, apellidos: string, tipoDiscapacidad: string }`

- **Guardar Sitio**:
  - Endpoint: `PUT /saveSite`
  - Body: `{ userId: string, placeId: string }`

- **Eliminar Sitio Guardado**:
  - Endpoint: `PUT /unsaveSite`
  - Body: `{ userId: string, placeId: string }`

- **Obtener Sitios Guardados**:
  - Endpoint: `GET /savedSites/:userId`
  - Params: `userId: string`

## Rutas de Sitios (`/sites`)

- **Obtener Comentarios**:
  - Endpoint: `GET /comments`

- **Publicar Comentario**:
  - Endpoint: `POST /comment`

- **Editar Comentario**:
  - Endpoint: `PUT /comment/:placeId`
  - Params: `placeId: string`

- **Eliminar Comentario**:
  - Endpoint: `DELETE /comment/:placeId/:commentId`
  - Params: `placeId: string, commentId: string`



- **Publicar Comentario**:
  - Endpoint: `POST /comment`
  - Body: `{ userId: string, placeId: string, comentario: string }`


## Versiones

- Node: 18.16.0
- NPM: 9.5.1 

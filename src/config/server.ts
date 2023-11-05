import { connect } from 'mongoose';
import app from '../app';

const PORT = process.env.PORT || 3001;
let dbUri = process.env.DB_URI || '';

connect(dbUri, {
    dbName: 'AccessPath'
}).then(() => console.log("Conexion a base de datos establecida")).
    catch((e) => console.error("Error en la conexion a base de datos: " + e));

app.listen(PORT, () => console.log(`Listening on port ${PORT}`));

export default app;
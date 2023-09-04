import "dotenv/config";
import { connect } from "mongoose";

async function dbConnect(): Promise<void> {
    const DB_URI = "mongodb+srv://admin:admin@cluster0.xk8rxrb.mongodb.net/?retryWrites=true&w=majority";
    await connect(DB_URI, {dbName: 'AccessPath'});
}

export default dbConnect;
import express, {Express} from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDatabase from "./config/database";
import mongoose from "mongoose";
import credentialsMiddleware from "./middlewares/credentials.middleware";
import corsOptions from "./config/corsOptions";
import cookieParser from 'cookie-parser';
import router from "./routes";
import userAgent from 'express-useragent'

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 4000;

process.on('uncaughtException', function (err) {
    console.error(err);
    console.log("Node NOT Exiting...");
});


connectDatabase().then(() => console.log('Database connected'))

app.use(userAgent.express());
app.use(credentialsMiddleware)
app.use(cors(corsOptions)); /* NEW */
app.use(express.urlencoded({extended: false}));

app.use(express.json());
app.use(cookieParser())

app.use(router)

mongoose.connection.once('open', () => {
    app.listen(port, () => {
        console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
    });
})


module.exports = app;

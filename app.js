"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const database_1 = __importDefault(require("./config/database"));
const mongoose_1 = __importDefault(require("mongoose"));
const credentials_middleware_1 = __importDefault(require("./middlewares/credentials.middleware"));
const corsOptions_1 = __importDefault(require("./config/corsOptions"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const routes_1 = __importDefault(require("./routes"));
const express_useragent_1 = __importDefault(require("express-useragent"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const port = process.env.PORT || 4000;
process.on('uncaughtException', function (err) {
    console.error(err);
    console.log("Node NOT Exiting...");
});
(0, database_1.default)().then(() => console.log('Database connected'));
app.use(express_useragent_1.default.express());
app.use(credentials_middleware_1.default);
app.use((0, cors_1.default)(corsOptions_1.default)); /* NEW */
app.use(express_1.default.urlencoded({ extended: false }));
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)());
app.use(routes_1.default);
mongoose_1.default.connection.once('open', () => {
    app.listen(port, () => {
        console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
    });
});
module.exports = app;

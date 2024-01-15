import * as express from "express";
import * as bodyParser from "body-parser";
import * as cors from "cors";
import Router from "./routes/routes";
import {AppDataSource} from "./data-source";

AppDataSource.initialize()
.then(() => {
    
    const app = express();
    const PORT = 5000;
    
    app.use(cors());
    
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));
    
    app.use(express.json());
    app.use("/api/v1", Router);
    
    app.listen(PORT, () => {
        console.log(`server started at http://localhost:${PORT}`);
    })
}).
catch(error => console.log(error))
import * as express from "express";
import PaymentController from "../controllers/PaymentController";
import UserController from "../controllers/UserController";

const Router = express.Router();

Router.post("/payment", PaymentController.payment);
Router.post("/webhook", PaymentController.webhook);
Router.get("/test", PaymentController.test);

Router.get("/users", UserController.get);
Router.get("/users/:id", UserController.getById);
Router.post("/users", UserController.create);
Router.patch("/users/:id", UserController.update);
Router.delete("/users/:id", UserController.delete);

Router.post("/diamond/:id", UserController.addDiamond);



export default Router;
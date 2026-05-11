/**
 * @author Andrea Ponzio
 * @version 1.0.0
 */
import express, {Application, NextFunction} from "express";
import {engine} from "express-handlebars";
import helpers from "handlebars-helpers";
import * as parser from "body-parser";
import methodOverride from "method-override";
import path from "node:path";
import {port} from "./public/config.json";

import CRest, {IRest} from "./core/CRest";
import {router as routerInit} from "./routers/routeInit";
import {router as routerApp} from "./routers/routeApp";
import {router as routerCustomer} from "./routers/routeCustomer";
import {router as routerWbs} from "./routers/routeWbs";
import {router as routerActivity} from "./routers/routeActivity";
import {router as routerWorkday} from "./routers/routeWorkday";
import {router as routerReport} from "./routers/routeReport";
import {router as routerSearch} from "./routers/routeSearch";
import {router as routerTools} from "./routers/routeTools";
import {router as routerRequest} from "./routers/routeRequest";

/**
 * Inizializza applicazione.
 */
let app: Application = express();
app.engine("handlebars", engine({helpers: helpers()}));
app.set("view engine", "handlebars");
app.set("views", "./views");
app.use(parser.json());
app.use(parser.urlencoded({extended: false}));
app.use(express.static("public"));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, "./views")));

/**
 * Middleware per la modifica della proprietà METHOD presente nei form.
 */
app.use(methodOverride((request: express.Request, response: express.Response) => {
   if(request.body && typeof request.body === "object" && "_method" in request.body) {
      let method = request.body._method;
      delete request.body._method;
      return method;
   }
}));

/**
 * Middleware.
 */
app.use("/init", routerInit);
app.use("/", routerApp);
app.use("/customer", routerCustomer);
app.use("/wbs", routerWbs);
app.use("/activity", routerActivity);
app.use("/workday", routerWorkday);
app.use("/report", routerReport);
app.use("/search", routerSearch);
app.use("/tools", routerTools);
app.use("/request", routerRequest);

/**
 * Middleware eseguito quando:
 * - interrogazione del database da servizio REST;
 * - non viene trovata nessuna route valida, quindi riporta sulla pagina principale;
 */
app.use((request: express.Request, response: express.Response, next: express.NextFunction) => {
   let rest: IRest;

   if(request.originalUrl.substring(0, 5) === "/rest") {
      rest = CRest.make(request.originalUrl, request.method, request.body).process();
      response.status(rest.httpStatus).json({"data": rest.data, "error": rest.error});
   }
   else
      response.redirect("/");
});

/**
 * Avvia server.
 */
app.listen(port);
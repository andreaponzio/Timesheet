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
import {port, odata} from "./public/config.json";

import {router as routerInit} from "./routers/routeInit";
import {router as routerApp} from "./routers/routeApp";
import {router as routerCustomer} from "./routers/routeCustomer";
import {router as routerWbs} from "./routers/routeWbs";
import {router as routerActivity} from "./routers/routeActivity";
import {router as routerActivityGroup} from "./routers/routeActivityGroup";
import {router as routerWorkday} from "./routers/routeWorkday";
import {router as routerReport} from "./routers/routeReport";
import {router as routerSearch} from "./routers/routeSearch";
import {router as routerTools} from "./routers/routeTools";
import {router as routerRequest} from "./routers/routeRequest";
import {router as routerAccess} from "./routers/routeAccess";
import {router as routerRestv2} from "./routers/routeRestv2";
import {router as routerRestv4} from "./routers/routeRestv4";

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
 * Middleware dipendenti dal tipo di esecuzione.
 */
if(process.argv[2] === undefined) {
   app.use("/init", routerInit);
   app.use("/", routerApp);
   app.use("/customer", routerCustomer);
   app.use("/wbs", routerWbs);
   app.use("/activity", routerActivity);
   app.use("/activitygroup", routerActivityGroup);
   app.use("/workday", routerWorkday);
   app.use("/report", routerReport);
   app.use("/search", routerSearch);
   app.use("/tools", routerTools);
   app.use("/request", routerRequest);
   app.use("/access", routerAccess);
}
else {
   app.use((request: express.Request, response: express.Response, next: express.NextFunction) => {
      response.setHeader("Access-Control-Allow-Origin", "*");
      response.setHeader("Access-Control-Allow-Methods", "GET,POST,PATCH,DELETE,OPTIONS");
      response.setHeader("Access-Control-Allow-Headers", "Content-Type");
      next();
   });
   if(process.argv[2] === "--odatav2")
      app.use("/odata", routerRestv2);
   else
      app.use("/odata", routerRestv4);
}

/**
 * Middleware eseguito quando:
 * - non viene trovata nessuna route valida, quindi riporta sulla pagina principale;
 */
app.use((request: express.Request, response: express.Response, next: express.NextFunction) => {
   //if(process.argv[2] === undefined)
   //   response.redirect("/");
});

/**
 * Avvia server in modalità:
 * - utente se non è presente parametro --odata;
 * - servizio REST quando --odata è presente;
 */
if(process.argv[2] === undefined)
   app.listen(port);
else if(process.argv[2] === "--odatav2" || process.argv[2] === "--odatav4")
   app.listen(odata.port);
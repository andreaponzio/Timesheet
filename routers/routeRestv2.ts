/**
 * @author Andrea Ponzio
 * @version 1.0.0
 */
import express, {Router, Request, Response} from "express";
import fs from "node:fs";
import CCustomer, {ICustomer} from "../core/CCustomer";
import CRest, {IRest} from "../core/CRest";

/**
 * Dichiarazioni locali.
 */
export let router: Router = express.Router();

/**
 * Restituisce $metadata del servizio di accesso a SQLite.
 */
router.get("/$metadata", (request: Request, response: Response) => {
   response.send(fs.readFileSync("./public/metadata_v2.xml").toString());
});

/**
 * Restituisce tutti i clienti oppure i cliente che soddisfano l'eventuale filtro.
 */
router.get("/customer", (request: Request, response: Response) => {
   let o: CCustomer = new CCustomer();
   let rest: IRest = undefined;
   let data: ICustomer[] = [];

   // Se è presente un filtro, prepara condizione:
   rest = CRest.convertFilter(request.query);

   // Legge i clienti applicando un filtro (se necessario):
   if(rest.where.length)
      data = o.loadAll(rest.where);
   else
      data = o.loadAll([]);

   // Restituisce stato HTTP, tipo dato e dati al chiamante:
   response.status(200).type("application/json").json({d: {results: data}});
});

/**
 * Restituisce il cliente con l'identificativo specificato.
 */
router.get("/customer\\(:id\\)", (request: Request, response: Response) => {
   let o: CCustomer = new CCustomer();
   o.load(parseInt(request.params.id as string));
   response.status(200).type("application/json").json({d: {results: o.data}});
});

/**
 * .
 */
router.get("/wbs", (request: Request, response: Response) => {
   response.send({value: []});
});

/**
 * .
 */
router.get("/activity", (request: Request, response: Response) => {
   response.send({value: []});
});

/**
 * .
 */
router.get("/workday", (request: Request, response: Response) => {
   response.send({value: []});
});
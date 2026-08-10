/**
 * @author Andrea Ponzio
 * @version 1.0.0
 */
import express, {Request, Response, Router} from "express";
import fs from "node:fs";
import COData from "../core/COData";
import CCustomer from "../core/CCustomer";

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
 * Estrae i customer in accordo ai parametri passati dal chiamate OData.
 */
router.get("/customer", (request: Request, response: Response) => {
   let o: CCustomer;
   let data: Object;
   let limit: string;
   let where: string;
   let orderBy: string;
   let sqlStatement: string;

   // Prepara istruzione LIMIT insieme ad OFFSET:
   limit = COData.limit(request);

   // Prepara istruzione di WHERE (1) (*_GET_ENTITYSET):
   where = COData.whereEntitySet(request);

   // Prepara istruzione di WHERE (2) (*_GET_ENTITY):
   if(!where.length)
      where = COData.whereEntity(request);

   // Il filtro contiene comandi speciali:
   where = COData.specialStatement(where);

   // Condizione di filtro di default:
   if(!where.length)
      where = "1 = 1";

   // Prepara ordinamento:
   orderBy = COData.orderBy(request);

   // Completa l'istruzione SQL:
   sqlStatement = `SELECT *
                   FROM main.customer
                   WHERE ${where} ${limit} ${orderBy}`;

   // Esegue l'istruzione SQL e restituisce il risultato:
   o = new CCustomer();
   data = o.executeAll(sqlStatement);
   response.status(200).send({
      return: {
         type: "S",
         message: "",
      },
      data: data
   });
});


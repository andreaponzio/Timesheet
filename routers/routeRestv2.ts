/**
 * @author Andrea Ponzio
 * @version 1.0.0
 */
import express, {Router, Request, Response} from "express";
import fs from "node:fs";
import CCustomer, {ICustomer} from "../core/CCustomer";
import CWbs, {IWbs} from "../core/CWbs";
import CActivity, {IActivity} from "../core/CActivity";
import CWorkday, {IWorkday} from "../core/CWorkday";
import CRequest, {IRequest} from "../core/CRequest";

/**
 * Dichiarazioni locali.
 */
export let router: Router = express.Router();

/**
 * Funzioni locali di utilità.
 */
let convFilterToWhere = (request: Request): string => {
   let listToken: string[] = [];
   let token: string;

   // Generazione condizione di WHERE:
   if(request.query["$filter"] !== undefined) {
      token = "";
      for(let c of request.query["$filter"] as string) {
         switch(c) {
            case " ":
               listToken.push(token);
               token = "";
               break;

            default:
               token += c;
         }
      }
      if(token.length)
         listToken.push(token);
   }

   // Genera condizione:
   listToken.forEach((token: string) => {
   })

   // restituisce condizione:
   console.log(listToken);
   return "";
};

/**
 * Restituisce $metadata del servizio di accesso a SQLite.
 */
router.get("/$metadata", (request: Request, response: Response) => {
   response.send(fs.readFileSync("./public/metadata_v2.xml").toString());
});

/**
 *
 */
router.get(/customer/i, (request: Request, response: Response) => {
   // Converte opzione $filter in condizione di Where:
   //convFilterToWhere(request);
   let o: CCustomer = new CCustomer();
   let data: ICustomer[];
   data = o.loadAll("1 = 1");
   response.status(200).type("application/json").json({d: {results: data}});
});

/**
 *
 */
router.get(/wbs/i, (request: Request, response: Response) => {
   let o: CWbs = new CWbs();
   let data: IWbs[];
   data = o.loadAll("1 = 1");
   response.status(200).type("application/json").json({d: {results: data}});
});

/**
 *
 */
router.get(/activity/i, (request: Request, response: Response) => {
   let o: CActivity = new CActivity();
   let data: IActivity[];
   data = o.loadAll("1 = 1");
   response.status(200).type("application/json").json({d: {results: data}});
});

/**
 *
 */
router.get(/workday/i, (request: Request, response: Response) => {
   let o: CWorkday = new CWorkday();
   let data: IWorkday[];
   data = o.loadAll("1 = 1");
   response.status(200).type("application/json").json({d: {results: data}});
});

/**
 *
 */
router.get(/request/i, (request: Request, response: Response) => {
   let o: CRequest = new CRequest();
   let data: IRequest[];
   data = o.loadAll("1 = 1");
   response.status(200).type("application/json").json({d: {results: data}});
});

/**
 *
 */
router.get(/search/i, (request: Request, response: Response) => {
});
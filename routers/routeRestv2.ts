/**
 * @author Andrea Ponzio
 * @version 1.0.0
 */
import express, {Request, Response, Router} from "express";
import fs from "node:fs";
import CAccess from "../core/CAccess";
import CActivity from "../core/CActivity";
import CActivityGroup from "../core/CActivityGroup";
import CCustomer from "../core/CCustomer";
import CDatabase from "../core/CDatabase";
import CRequest from "../core/CRequest";
import {SqlGen} from "../core/CSqlGen";
import CWbs from "../core/CWbs";
import CWorkday from "../core/CWorkday";
import IField = SqlGen.IField;
import IOption = SqlGen.IOption;
import Operator = SqlGen.Operator;
import Option = SqlGen.Option;
import Sign = SqlGen.Sign;

/**
 * Dichiarazioni locali.
 */
export let router: Router = express.Router();

/**
 * Funzioni locali.
 */
let get_data = (request: Request): object => {
   let customer: CCustomer;
   let wbs: CWbs;
   let activity: CActivity;
   let workday: CWorkday;
   let req: CRequest;
   let access: CAccess;
   let activity_group: CActivityGroup;
   let key: IField[];
   let data: object[];
   let dummy: object[];
   let single: boolean;

   // Prepara proprietà:
   data = [];
   key = [];

   // E' presente una chiave specifica:
   if(request.body["key"] !== undefined) {
      request.body["key"].forEach((k) => {
         key.push({
            name: k["name"],
            operator: Operator.NONE,
            value: [{sign: Sign.INCLUDE, option: Option.EQUAL, low: parseInt(k["value"])}]
         });
      });
   }

   // Legge i dati dell'oggetto richiesto:
   switch(request.body.entity_name) {
      case "CUSTOMER":
         customer = new CCustomer();
         data = customer.loadAll(key);
         customer = null;
         break;

      case "WBS":
         wbs = new CWbs();
         data = wbs.loadAll([]);
         wbs = null;
         break;

      case "ACTIVITY":
         activity = new CActivity();
         data = activity.loadAll([]);
         activity = null;
         break;

      case "WORKDAY":
         workday = new CWorkday();
         data = workday.loadAll([]);
         workday = null;
         break;

      case "REQUEST":
         req = new CRequest();
         data = req.loadAll([]);
         req = null;
         break;

      case "ACCESS":
         customer = new CCustomer();
         dummy = customer.loadAll([]);
         for(let cust of dummy) {
            access = new CAccess(cust["id"]);
            access.data.forEach(item => {
               data.push(item);
            });
            access = null;
         }
         break;

      case "ACTIVITY_GRP":
         activity_group = new CActivityGroup();
         data = activity_group.loadAll([]);
         activity = null;
         break;
   }

   // Restituisce i dati al chiamante:
   return data === undefined ? [] : data;
}

/**
 * Restituisce $metadata del servizio di accesso a SQLite.
 */
router.get("/$metadata", (request: Request, response: Response) => {
   response.send(fs.readFileSync("./public/metadata_v2.xml").toString());
});

/**
 * Permette di gestire le informazioni sui clienti.
 */
router.get(/customer/, (request: Request, response: Response) => {
   response.status(200).send({
      return: {
         type: "S",
         message: "",
      },
      data: get_data(request)
   });
});
router.post("/customer", (request: Request, response: Response) => {
   let obj: CCustomer;

   try {
      obj = new CCustomer();
      obj.description = request.body["data"]["description"];
      obj.save();
      response.status(200).send({
         return: {
            type: "S",
            message: "",
         },
         data: obj.data
      });
   }
   catch(e) {
      response.status(400).send({
         return: {
            type: "E",
            message: e.message,
         },
         data: get_data(request)
      });
   }
   finally {
      obj = null;
   }
});
router.delete("/customer", (request: Request, response: Response) => {

});

/**
 * Permette di gestire le informazioni sulle commesse.
 */
router.get(/wbs/, (request: Request, response: Response) => {
   response.status(200).send({
      return: {
         type: "S",
         message: "",
      },
      data: get_data(request)
   });
});
router.post("/wbs", (request: Request, response: Response) => {

});
router.delete("/wbs", (request: Request, response: Response) => {

});

/**
 * Permette di gestire le informazioni sulle attività.
 */
router.get(/activity/, (request: Request, response: Response) => {
   response.status(200).send({
      return: {
         type: "S",
         message: "",
      },
      data: get_data(request)
   });
});
router.post("/activity", (request: Request, response: Response) => {

});
router.delete("/aactivity", (request: Request, response: Response) => {

});

/**
 * Permette di gestire le informazioni sulle consuntivazioni.
 */
router.get(/workday/, (request: Request, response: Response) => {
   response.status(200).send({
      return: {
         type: "S",
         message: "",
      },
      data: get_data(request)
   });
});
router.post("/workday", (request: Request, response: Response) => {

});
router.delete("/workday", (request: Request, response: Response) => {

});

/**
 * Permette di gestire le informazioni sulle richieste di trasporto.
 */
router.get(/request/, (request: Request, response: Response) => {
   response.status(200).send({
      return: {
         type: "S",
         message: "",
      },
      data: get_data(request)
   });
});
router.post("/request", (request: Request, response: Response) => {

});
router.delete("/request", (request: Request, response: Response) => {

});

/**
 * Permette di gestire le informazioni di accesso.
 */
router.get(/access/, (request: Request, response: Response) => {
   response.status(200).send({
      return: {
         type: "S",
         message: "",
      },
      data: get_data(request)
   });
});
router.post("/access", (request: Request, response: Response) => {

});
router.delete("/access", (request: Request, response: Response) => {

});

/**
 * Permette di ottenere un nuovo identificativo per l'entità specificata nel corpo
 * del messaggio.
 */
router.post("/newid", (request: Request, response: Response) => {
   let db: CDatabase;
   let id: number;

   db = new CDatabase();
   id = db.getId(request.body["key"][0]["value"]);
   db = null;

   response.status(200).send({
      return: {
         type: "S",
         message: "",
      },
      data: {id: id}
   });
});
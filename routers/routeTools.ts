/**
 * @author Andrea Ponzio
 * @version 1.0.0
 */
import express, {Router, Request, Response} from "express";
import CCustomer, {ICustomer} from "../core/CCustomer";
import CWbs, {IWbs} from "../core/CWbs";
import CActivity, {IActivity} from "../core/CActivity";
import {objectType} from "../core/CBase";
import CRequest, {IRequest} from "../core/CRequest";

/**
 * Dichiarazioni locali.
 */
export let router: Router = express.Router();

/**
 * Pagina principale per rigenerazione indici di ricerca.
 */
router.get("/index", (request: Request, response: Response) => {
   response.render("app", {
      view: objectType.index
   });
});

/**
 * Rigenera gli indici selezionati.
 */
router.post("/index", (request: Request, response: Response) => {
   let customer: CCustomer;
   let wbs: CWbs;
   let activity: CActivity;
   let tr: CRequest;
   let customer_data: ICustomer[];
   let wbs_data: IWbs[];
   let activity_data: IActivity[];
   let tr_data: IRequest[];

   customer = new CCustomer();
   wbs = new CWbs();
   activity = new CActivity();
   tr = new CRequest();

   // Aggiornamento clienti:
   if(request.body.customer === "on") {
      customer.executeRun("DELETE FROM main.search WHERE type = 1;");
      customer_data = customer.loadAll();
      customer_data.forEach(d => {
         customer = new CCustomer();
         customer.load(d.id);
         customer.search();
         customer = undefined;
      });
   }

   // Aggiornamento commesse:
   if(request.body.wbs === "on") {
      wbs.executeRun("DELETE FROM main.search WHERE type = 2;");
      wbs_data = wbs.loadAll();
      wbs_data.forEach(d => {
         wbs = new CWbs();
         wbs.load(d.id);
         wbs.search();
         wbs = undefined;
      });
   }

   // Aggiornamento attività:
   if(request.body.activity === "on") {
      activity.executeRun("DELETE FROM main.search WHERE type = 3;");
      activity_data = activity.loadAll();
      activity_data.forEach(d => {
         activity = new CActivity();
         activity.load(d.id);
         activity.search();
         activity = undefined;
      });
   }

   // Aggiornamento richiesta di trasporto:
   if(request.body.request === "on") {
      tr.executeRun("DELETE FROM main.search WHERE type = 4;");
      tr_data = tr.loadAll();
      tr_data.forEach(d => {
         tr = new CRequest();
         tr.load(d.id);
         tr.search();
         tr = undefined;
      });
   }

   // Riporta sulla pagina principale:
   response.redirect("/");
});

/**
 * Pagina principale per gestione sistemi finali TR.
 */
router.get("/prodsys", (request: Request, response: Response) => {
   let tr: CRequest;
   let prodsys: string[];

   tr = new CRequest();

   // Legge sistemi finali da passare alla pagina:
   prodsys = tr.executeAll("SELECT * FROM main.prod_system") as string[];

   // Disegna la pagina con l'elenco dei sistemi finali:
   response.render("app", {
      view: objectType.prodsys,
      data: prodsys
   });
});

/**
 * Aggiunge i sistemi finali alla tabella.
 */
router.post("/prodsys", (request: Request, response: Response) => {
   let tr: CRequest;
   let prodsys: string[];

   tr = new CRequest();

   // Aggiunge i sistemi finali alla tabella:
   prodsys = request.body.prodsys.split(";");
   prodsys.forEach(d => {
      try {
         tr.executeRun(`INSERT INTO main.prod_system (systemid)
                        VALUES ('${d.toUpperCase().trim()}');`);
      }
      catch(e) {
      }
   });

   // Riporta sulla pagina principale:
   response.redirect("/tools/prodsys");
});

/**
 * Rimuove i sistemi finali selezionati.
 */
router.delete("/prodsys", (request: Request, response: Response) => {
   let tr: CRequest;
   let key: string;

   tr = new CRequest();

   // Elimina i sistemi finali dalla tabella:
   for(let d in request.body) {
      if(request.body[d] === "on")
         try {
            key = d.slice(1);
            tr.executeRun(`DELETE
                           FROM main.prod_system
                           WHERE systemid = '${key}';`);
         }
         catch(e) {
         }
   }

   // Riporta sulla pagina principale:
   response.redirect("/tools/prodsys");
});
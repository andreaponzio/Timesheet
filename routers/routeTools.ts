/**
 * @author Andrea Ponzio
 * @version 1.0.0
 */
import express, {Router, Request, Response} from "express";
import CCustomer, {ICustomer} from "../core/CCustomer";
import CWbs, {IWbs} from "../core/CWbs";
import CActivity, {IActivity} from "../core/CActivity";
import CRequest, {IRequest} from "../core/CRequest";
import {objectType} from "../core/CBase";

/**
 * Dichiarazioni locali.
 */
export let router: Router = express.Router();

/**
 * Pagina principale per rigenerazione indici di ricerca.
 */
router.get("/index", (request: Request, response: Response) => {
   response.render("app", {
      view: objectType.tools
   });
});

/**
 * Rigenera gli indici selezionati.
 */
router.post("/index", (request: Request, response: Response) => {
   let customer: CCustomer;
   let wbs: CWbs;
   let activity: CActivity;
   let transport: CRequest;
   let customer_data: ICustomer[];
   let wbs_data: IWbs[];
   let activity_data: IActivity[];
   let transport_data: IRequest[];

   customer = new CCustomer();
   wbs = new CWbs();
   activity = new CActivity();
   transport = new CRequest();

   // Aggiornamento clienti:
   if(request.body.customer === "on") {
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
      activity_data = activity.loadAll();
      activity_data.forEach(d => {
         activity = new CActivity();
         activity.load(d.id);
         activity.search();
         activity = undefined;
      });
   }

   // Aggiornamento richieste di trasporto:
   if(request.body.request === "on") {
      transport_data = transport.loadAll();
      transport_data.forEach(d => {
         transport = new CRequest();
         transport.load(d.id);
         transport.search();
         transport = undefined;
      });
   }

   // Riporta sulla pagina principale:
   response.redirect("/");
});
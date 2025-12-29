/**
 * @author Andrea Ponzio
 * @version 1.0.0
 */
import express, {Request, Response, Router} from "express";
import CActivity from "../core/CActivity";
import CWbs, {IWbs} from "../core/CWbs";
import CCustomer from "../core/CCustomer";
import CRequest from "../core/CRequest";
import CWorkday from "../core/CWorkday";
import {extraInfo, objectType} from "../core/CBase";

/**
 * Funzioni locali.
 */
let listOfWbs = (object: CActivity): IWbs[] => {
   return object.executeAll("SELECT id, internal_ref, description1 FROM main.wbs") as IWbs[];
}

/**
 * Dichiarazioni locali.
 */
export let router: Router = express.Router();

/**
 * Pagina principale.
 */
router.get("/", (request: Request, response: Response) => {
   let o: CActivity;

   if(o === undefined)
      o = new CActivity();
   o.clean();

   response.render("app", {
      view: objectType.activity_list,
      data: o.summarize()
   });
});

/**
 * Permette di creare un'attività' se l'identificativo passato è zero, altrimenti
 * visualizza il dettaglio con le relative consuntivazioni e richieste di trasporto.
 */
router.get("/:id", (request: Request, response: Response) => {
   let o: CActivity;
   let w: CWbs;
   let c: CCustomer;

   o = new CActivity();
   w = new CWbs();
   c = new CCustomer();

   switch(parseInt(request.params.id)) {
      case 0:
         response.render("app", {
            view: objectType.activity_create,
            data: {
               id: 0,
               wbs_list: listOfWbs(o)
            }
         });
         break;

      default:
         o.load(parseInt(request.params.id));
         w.load(o.wbs);
         c.load(w.customer);
         response.render("app", {
            view: objectType.activity_details,
            data: {
               id: o.id,
               internal_ref: o.internal_ref,
               external_ref: o.external_ref,
               type: o.type,
               description: o.description,
               functional: o.functional,
               technical: o.technical,
               hour: o.hour,
               status: o.status,
               note: o.note,
               wbs_id: w.id,
               customer_id: c.id,
               customer_description: c.description,
               request: o.getRequest(),
               workday: o.getWorkday(),
               wbs_list: listOfWbs(o),
               rdate: o.convertDate(new Date(), 3),
            }
         });
   }
});

/**
 * Effettua la creazione o l'aggiornamento di un'attività.
 */
router.post("/:id", (request: Request, response: Response) => {
   let o: CActivity;
   let w: CWbs;
   let c: CCustomer;

   o = new CActivity();
   w = new CWbs();
   c = new CCustomer();

   try {
      if(parseInt(request.params.id))
         o.load(parseInt(request.params.id));
      o.internal_ref = request.body.internal_ref;
      o.external_ref = request.body.external_ref;
      o.type = parseInt(request.body.type);
      o.description = request.body.description;
      o.wbs = parseInt(request.body.wbs);
      o.functional = request.body.functional;
      o.technical = request.body.technical;
      o.hour = parseInt(request.body.hour);
      o.status = parseInt(request.body.status);
      o.note = request.body.note;
      o.save();
      response.redirect("/activity");
   }
   catch(e) {
      w.load(o.wbs);
      c.load(w.customer);
      response.render("app", {
         view: objectType.activity_create,
         data: {
            id: o.id,
            internal_ref: o.internal_ref,
            external_ref: o.external_ref,
            type: o.type,
            description: o.description,
            functional: o.functional,
            technical: o.technical,
            hour: o.hour,
            status: o.status,
            note: o.note,
            wbs_id: w.id,
            customer_id: c.id,
            customer_description: c.description,
            request: o.getRequest(),
            wbs_list: listOfWbs(o),
            error: e.message
         }
      });
   }
});

/**
 * Elimina l'attività solo se questa non ha abbinate delle richieste di trasporto.
 */
router.delete("/:id", (request: Request, response: Response) => {
   let o: CActivity;
   let c: CRequest;

   o = new CActivity();
   c = new CRequest();
   o.load(parseInt(request.params.id));
   c.load(o.wbs);
   if(!o.getRequest().length) {
      o.delete();
      response.redirect("/activity");
   }
   else
      response.render("app", {
         view: objectType.activity_details,
         data: {
            id: o.id,
            internal_ref: o.internal_ref,
            external_ref: o.external_ref,
            type: o.type,
            description: o.description,
            functional: o.functional,
            technical: o.technical,
            hour: o.hour,
            status: o.status,
            note: o.note,
            wbs_list: listOfWbs(o),
            error: "L'attività ha richieste di trasporto assegnate."
         }
      });
});

/**
 * Inserimenti rapido di una consuntivazione.
 */
router.post("/workday/:id", (request: Request, response: Response) => {
   let o: CWorkday;

   o = new CWorkday();
   try {
      o.activity = parseInt(request.params.id);
      o.date = new Date(request.body.rwdate);
      o.hour = parseInt(request.body.rwhour);
      o.place = request.body.rwplace;
      o.extrainfo = extraInfo.normale;
      o.note = request.body.rwnote;
      o.save();
      response.redirect(`/activity/${request.params.id}`);
   }
   catch(e) {
   }
});

/**
 * Inserimenti rapido di una richiesta di trasporto.
 */
router.post("/request/:id", (request: Request, response: Response) => {
   let o: CRequest;

   o = new CRequest();

   try {
      o.activity = parseInt(request.params.id);
      o.request = request.body.rrrequest;
      o.type = parseInt(request.body.rrtype);
      o.description = request.body.rrdescription;
      o.owner = "";
      o.date = new Date(request.body.rrdate);
      o.note = "";
      o.save();
      o.transport();
      o.saveTransport();
      response.redirect(`/activity/${request.params.id}`);
   }
   catch(e) {
      console.error(e);
   }
});
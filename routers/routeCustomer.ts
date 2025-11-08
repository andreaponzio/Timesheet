/**
 * @author Andrea Ponzio
 * @version 1.0.0
 */
import express, {Request, Response, Router} from "express";
import CCustomer from "../core/CCustomer";
import {objectType} from "../core/CBase";

/**
 * Funzioni locali.
 */

/**
 * Dichiarazioni locali.
 */
export let router: Router = express.Router();

/**
 * Pagina principale.
 */
router.get("/", (request: Request, response: Response) => {
   let o: CCustomer;

   if(o === undefined)
      o = new CCustomer();
   o.clean();

   response.render("app", {
      view: objectType.customer_list,
      data: o.summarize()
   });
});

/**
 * Permette di creare un cliente se l'identificativo passato è zero, altrimenti
 * visualizza il dettaglio e relative commesse.
 */
router.get("/:id", (request: Request, response: Response) => {
   let o: CCustomer;

   switch(parseInt(request.params.id)) {
      case 0:
         response.render("app", {
            view: objectType.customer_create
         });
         break;

      default:
         o = new CCustomer();
         o.load(parseInt(request.params.id));
         response.render("app", {
            view: objectType.customer_details,
            data: {
               id: o.id,
               description: o.description,
               wbs: o.getWbs()
            }
         });
   }
});

/**
 * Effettua la creazione o l'aggiornamento di un cliente.
 */
router.post("/:id", (request: Request, response: Response) => {
   let o: CCustomer;

   try {
      o = new CCustomer();
      if(parseInt(request.params.id))
         o.load(parseInt(request.params.id));
      o.description = request.body.description.toUpperCase();
      o.save();
      response.redirect("/customer");
   }
   catch(e) {
      response.render("app", {
         view: objectType.customer_create,
         data: {
            id: o.id,
            description: o.description,
            error: e.message
         }
      });
   }
});

/**
 * Elimina il cliente solo se questo non ha abbinato delle commesse.
 */
router.delete("/:id", (request: Request, response: Response) => {
   let o: CCustomer;

   try {
      o = new CCustomer();
      o.load(parseInt(request.params.id));
      if(!o.getWbs().length) {
         o.delete();
         response.redirect("/customer");
      }
      else
         response.render("app", {
            view: objectType.customer_details,
            data: {
               id: o.id,
               description: o.description,
               wbs: o.getWbs(),
               error: "Il cliente ha commesse assegnate."
            }
         });
   }
   catch(e) {
      response.redirect("/customer");
   }
});
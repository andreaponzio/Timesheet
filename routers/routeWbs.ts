/**
 * @author Andrea Ponzio
 * @version 1.0.0
 */
import express, {Request, Response, Router} from "express";
import CWbs from "../core/CWbs";
import {objectType} from "../core/CBase";
import CCustomer, {ICustomer} from "../core/CCustomer";

/**
 * Funzioni locali.
 */
let listOfCustomer = (object: CWbs): ICustomer[] => {
   return object.executeAll("SELECT id, description FROM main.customer") as ICustomer[];
}

/**
 * Dichiarazioni locali.
 */
export let router: Router = express.Router();

/**
 * Pagina principale.
 */
router.get("/", (request: Request, response: Response) => {
   let o: CWbs;

   if(o === undefined)
      o = new CWbs();
   o.clean();

   response.render("app", {
      view: objectType.wbs_list,
      data: o.summarize()
   });
});

/**
 * Permette di creare una commessa se l'identificativo passato è zero, altrimenti
 * visualizza il dettaglio con le relative attività.
 */
router.get("/:id", (request: Request, response: Response) => {
   let o: CWbs;
   let c: CCustomer;

   o = new CWbs();
   c = new CCustomer();

   switch(parseInt(request.params.id as string)) {
      case 0:
         response.render("app", {
            view: objectType.wbs_create,
            data: {
               id: 0,
               customer_list: listOfCustomer(o)
            }
         });
         break;

      default:
         o.load(parseInt(request.params.id as string));
         c.load(o.customer);
         response.render("app", {
            view: objectType.wbs_details,
            data: {
               id: o.id,
               internal_ref: o.internal_ref,
               customer_id: c.id,
               description: c.description,
               description1: o.description1,
               description2: o.description2,
               activity: o.getActivity(),
               customer_list: listOfCustomer(o)
            }
         });
   }
});

/**
 * Effettua la creazione o l'aggiornamento di una commessa.
 */
router.post("/:id", (request: Request, response: Response) => {
   let o: CWbs;

   o = new CWbs();
   try {
      if(parseInt(request.params.id as string))
         o.load(parseInt(request.params.id as string));
      o.internal_ref = request.body.internal_ref;
      o.customer = parseInt(request.body.customer);
      o.description1 = request.body.description1;
      o.description2 = request.body.description2;
      o.save();
      response.redirect("/wbs");
   }
   catch(e) {
      response.render("app", {
         view: objectType.wbs_create,
         data: {
            id: o.id,
            internal_ref: o.internal_ref,
            customer_id: o.customer,
            description1: o.description1,
            description2: o.description2,
            customer_list: listOfCustomer(o),
            error: e.message
         }
      });
   }
});

/**
 * Elimina la commessa solo se questa non ha abbinate delle attività.
 */
router.delete("/:id", (request: Request, response: Response) => {
   let o: CWbs;
   let c: CCustomer;

   try {
      o = new CWbs();
      c = new CCustomer();
      o.load(parseInt(request.params.id as string));
      c.load(o.customer);
      if(!o.getActivity().length) {
         o.delete();
         response.redirect("/wbs");
      }
      else
         response.render("app", {
            view: objectType.wbs_details,
            data: {
               id: o.id,
               internal_ref: o.internal_ref,
               customer: c.id,
               customer_description: c.description,
               description: c.description,
               description1: o.description1,
               description2: o.description2,
               activity: o.getActivity(),
               error: "La commessa ha attività assegnate."
            }
         });
   }
   catch(e) {
      response.redirect("/wbs");
   }
});
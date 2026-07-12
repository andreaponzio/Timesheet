/**
 * @author Andrea Ponzio
 * @version 1.0.0
 */
import express, {Request, Response, Router} from "express";
import {objectType} from "../core/CBase";
import CCustomer, {ICustomer} from "../core/CCustomer";
import CAccess, {IAccess} from "../core/CAccess";
import clipboard from 'clipboardy';

/**
 * Dichiarazioni locali.
 */
export let router: Router = express.Router();

/**
 * Pagina principale.
 */
router.get("/", (request: Request, response: Response) => {
   let listOfCustomer: ICustomer[];
   let c: CCustomer;

   c = new CCustomer();
   listOfCustomer = c.loadAll([]);

   response.render("app", {
      view: objectType.access_list,
      data: listOfCustomer
   });
});

/**
 * Pagina di dettaglio degli accessi del cliente.
 */
router.get("/:id", (request: Request, response: Response) => {
   let a: CAccess;
   let c: CCustomer;

   a = new CAccess(parseInt(request.params.id as string));
   c = new CCustomer();

   c.load(parseInt(request.params.id as string));

   response.render("app", {
      view: objectType.access_details,
      data: {
         customer: {
            id: c.id,
            description: c.description
         },
         value: a.data
      }
   });
});

/**
 * Copia il valore negli appunti.
 */
router.get("/copy/:id", (request: Request, response: Response) => {
   console.log("copy");
});

/**
 * Reindirizza sulla pagina degli accessi per il cliente selezionato.
 */
router.post("/", (request: Request, response: Response) => {
   response.redirect(`/access/${request.body.customer}`);
});

/**
 * Permette di:
 *  - creare un valore;
 *  - visualizzare un valore e poterli modificare.
 */
router.get("/edit/:customerid/:valueid", (request: Request, response: Response) => {
   let a: CAccess;
   let v: IAccess;

   if(parseInt(request.params.valueid as string)) {
      a = new CAccess(parseInt(request.params.customerid as string));
      v = a.get(parseInt(request.params.valueid as string));

      response.render("app", {
         view: objectType.access_create,
         data: {
            id: parseInt(request.params.customerid as string),
            valueid: v.valueid,
            description: v.description,
            value: v.value,
            secure: v.secure
         }
      });
   }
   else
      response.render("app", {
         view: objectType.access_create,
         data: {
            id: parseInt(request.params.customerid as string),
            valueid: parseInt(request.params.valueid as string)
         }
      });
});

/**
 * Verifica ed aggiunge un valore.
 */
router.post("/edit/:customerid/:valueid", (request: Request, response: Response) => {
   let a: CAccess;

   a = new CAccess(parseInt(request.params.customerid as string));
   a.add(parseInt(request.params.valueid as string), request.body.description, request.body.value, request.body.secure === "on" ? "1" : "0");
   a.save();

   response.redirect(`/access/${request.params.customerid}`);
});

/**
 * Permette di cancellare tutti i valori per un dato cliente.
 */
router.delete("/edit/:customerid", (request: Request, response: Response) => {
   let a: CAccess;

   a = new CAccess(parseInt(request.params.customerid as string));
   a.delete();

   response.redirect("/access");
});

/**
 * Permette di cancellare un valore di accesso.
 */
router.delete("/edit/:customerid/:valueid", (request: Request, response: Response) => {
   let a: CAccess;

   a = new CAccess(parseInt(request.params.customerid as string));
   a.del(parseInt(request.params.valueid as string));
   a.save();

   response.redirect(`/access/${request.params.customerid}`);
});

/**
 * Permette di copiare il valore negli appunti.
 */
router.get("/copy/:customerid/:valueid", async (request: Request, response: Response) => {
   let a: CAccess;
   let c: CCustomer;
   let v: IAccess;

   a = new CAccess(parseInt(request.params.customerid as string));
   c = new CCustomer();
   v = a.get(parseInt(request.params.valueid as string));

   c.load(a.customerid);
   await clipboard.write(v.value);

   response.render("app", {
      view: objectType.access_details,
      data: {
         customer: {
            id: c.id,
            description: c.description
         },
         value: a.data,
         success: "Valore copiato negli appunti"
      }
   });
});
/**
 * @author Andrea Ponzio
 * @version 1.0.0
 */
import express, {Request, Response, Router} from "express";
import CRequest from "../core/CRequest";
import {objectType} from "../core/CBase";
import CActivity, {IActivity} from "../core/CActivity";

/**
 * Funzioni locali.
 */
let listOfActivity = (object: CActivity): IActivity[] => {
   return object.executeAll("SELECT id, internal_ref, description FROM main.activity") as IActivity[];
}

/**
 * Dichiarazioni locali.
 */
export let router: Router = express.Router();

/**
 * Pagina principale.
 */
router.get("/", (request: Request, response: Response) => {
   let o: CRequest;

   if(o === undefined)
      o = new CRequest();
   o.clean();

   response.render("app", {
      view: objectType.request_list,
      data: o.summarize()
   });
});

/**
 * Permette di creare una richiesta di trasporto se l'identificativo passato è zero, altrimenti
 * visualizza il dettaglio.
 */
router.get("/:id", (request: Request, response: Response) => {
   let o: CRequest;
   let a: CActivity;

   o = new CRequest();
   a = new CActivity();

   switch(parseInt(request.params.id as string)) {
      case 0:
         response.render("app", {
            view: objectType.request_create,
            data: {
               id: 0,
               activity_list: listOfActivity(a)
            }
         });
         break;

      default:
         o.load(parseInt(request.params.id as string));
         a.load(o.activity);
         response.render("app", {
            view: objectType.request_details,
            data: {
               id: o.id,
               request: o.request,
               type: o.type,
               description: o.description,
               owner: o.owner,
               date: o.convertDate(o.date, 3),
               note: o.note,
               env: o.env,
               activity_id: a.id,
               activity_description: a.description,
               activity_list: listOfActivity(a),
            }
         });
   }
});

/**
 * Effettua la creazione o l'aggiornamento di una richiesta di trasporto.
 */
router.post("/:id", (request: Request, response: Response) => {
   let o: CRequest;
   let a: CActivity;

   o = new CRequest();
   a = new CActivity();

   try {
      if(parseInt(request.params.id as string))
         o.load(parseInt(request.params.id as string));
      o.activity = request.body.activity;
      o.request = request.body.request;
      o.type = parseInt(request.body.type);
      o.description = request.body.description;
      o.owner = request.body.owner;
      o.date = new Date(request.body.date);
      o.note = request.body.note;
      o.save();
      if(!parseInt(request.params.id as string)) {
         o.transport();
         o.saveTransport();
      }
      response.redirect("/request");
   }
   catch(e) {
      a.load(o.activity);
      response.render("app", {
         view: objectType.request_create,
         data: {
            id: o.id,
            request: o.request,
            type: o.type,
            description: o.description,
            owner: o.owner,
            date: o.date,
            note: o.note,
            env: o.env,
            activity_id: a.id,
            activity_description: a.description,
            activity_list: listOfActivity(a),
            error: e.message
         }
      });
   }
});

/**
 * Elimina la richiesta di trasporto.
 */
router.delete("/:id", (request: Request, response: Response) => {
   let o: CRequest;
   let a: CActivity;

   o = new CRequest();
   a = new CActivity();
   o.load(parseInt(request.params.id as string));
   a.load(o.activity);

   try {
      o.delete();
      response.redirect("/request");
   }
   catch(e) {
      response.render("app", {
         view: objectType.activity_details,
         data: {
            id: o.id,
            request: o.request,
            type: o.type,
            description: o.description,
            owner: o.owner,
            date: o.date,
            note: o.note,
            env: o.env,
            activity_id: a.id,
            activity_description: a.description,
            activity_list: listOfActivity(a),
            error: e.message
         }
      });
   }
});

/**
 * Effettua trasporto della richiesta.
 */
router.patch("/:id", (request: Request, response: Response) => {
   let o: CRequest;
   let a: CActivity;

   o = new CRequest();
   a = new CActivity();
   o.load(parseInt(request.params.id as string));
   a.load(o.activity);

   try {
      o.transport();
      o.saveTransport();
      response.redirect(`/request/${o.id}`);
   }
   catch(e) {
      response.render("app", {
         view: objectType.activity_details,
         data: {
            id: o.id,
            request: o.request,
            type: o.type,
            description: o.description,
            owner: o.owner,
            date: o.date,
            note: o.note,
            env: o.env,
            activity_id: a.id,
            activity_description: a.description,
            activity_list: listOfActivity(a),
            error: e.message
         }
      });
   }
});

/**
 * Resetta un trasporto della richiesta.
 */
router.put("/:id", (request: Request, response: Response) => {
   let o: CRequest;
   let a: CActivity;

   o = new CRequest();
   a = new CActivity();
   o.load(parseInt(request.params.id as string));
   a.load(o.activity);

   try {
      o.transport(undefined, true);
      o.saveTransport();
      response.redirect(`/request/${o.id}`);
   }
   catch(e) {
      response.render("app", {
         view: objectType.activity_details,
         data: {
            id: o.id,
            request: o.request,
            type: o.type,
            description: o.description,
            owner: o.owner,
            date: o.date,
            note: o.note,
            env: o.env,
            activity_id: a.id,
            activity_description: a.description,
            activity_list: listOfActivity(a),
            error: e.message
         }
      });
   }
});
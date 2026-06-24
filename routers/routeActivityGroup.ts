/**
 * @author Andrea Ponzio
 * @version 1.0.0
 */
import express, {Request, Response, Router} from "express";
import {objectType} from "../core/CBase";
import CActivityGroup, {IActivityGroupId} from "../core/CActivityGroup";
import {IActivity, IActivitySummarize} from "../core/CActivity";

/**
 * Dichiarazioni locali.
 */
export let router: Router = express.Router();

/**
 * Funzioni locali.
 */
let listOfActivity = (object: CActivityGroup): IActivitySummarize[] => {
   let id: string = "";

   object.activity.forEach((activity: IActivityGroupId) => {
      if(!id.length)
         id = activity.activity.toString();
      else
         id += "," + activity.activity.toString();
   });

   return object.executeAll(`SELECT *
                             FROM main.activity_summarize
                             WHERE id IN (${id});`) as IActivitySummarize[];
}

/**
 * Pagina principale.
 */
router.get("/", (request: Request, response: Response) => {
   let o: CActivityGroup;

   if(o === undefined)
      o = new CActivityGroup();
   o.clean();
   response.render("app", {
      view: objectType.activitygroup_list,
      data: o.summarize()
   });
});

/**
 * Permette di creare un gruppo di attività.
 */
router.get("/:id", (request: Request, response: Response) => {
   let o: CActivityGroup;

   switch(parseInt(request.params.id as string)) {
      case 0:
         response.render("app", {
            view: objectType.activitygroup_create
         });
         break;

      default:
         o = new CActivityGroup();
         o.load(parseInt(request.params.id as string));
         response.render("app", {
            view: objectType.activitygroup_details,
            data: {
               id: o.id,
               description: o.description,
               activity: listOfActivity(o)
            }
         });
   }
});

/**
 * Effettua la creazione o l'aggiornamento di un gruppo.
 */
router.post("/:id", (request: Request, response: Response) => {
   let o: CActivityGroup;

   try {
      o = new CActivityGroup();
      if(parseInt(request.params.id as string))
         o.load(parseInt(request.params.id as string));
      o.description = request.body.description;
      o.save();
      response.redirect("/activitygroup");
   }
   catch(e) {
      response.render("app", {
         view: objectType.activitygroup_create,
         data: {
            id: o.id,
            description: o.description,
            error: e.message
         }
      });
   }
});

/**
 * Aggiunge un'attività ad un gruppo.
 */
router.post("/group/:id", (request: Request, response: Response) => {
   let g: CActivityGroup;

   try {
      g = new CActivityGroup();
      g.load(parseInt(request.body.group));
      g.addActivity(parseInt(request.params.id as string));
      g.save();
      response.redirect("/activitygroup");
   }
   catch(e) {
      response.render("app", {
         view: objectType.activitygroup_list,
         data: {error: e.message}
      });
   }
});

/**
 * Rimuove l'attività dal gruppo..
 */
router.delete("/group/:id", (request: Request, response: Response) => {
   let g: CActivityGroup;
   let id: number;

   try {
      g = new CActivityGroup();
      id = g.getActivityGroup(parseInt(request.params.id as string));
      g.load(id);
      g.delActivity(parseInt(request.params.id as string));
      g.save();
      response.redirect(`/activity/${request.params.id}`);
   }
   catch(e) {
      response.render("app", {
         view: objectType.activitygroup_list,
         data: {error: e.message}
      });
   }
});

/**
 * Elimina un intero gruppo.
 */
router.delete("/:id", (request: Request, response: Response) => {
   let o: CActivityGroup;

   try {
      o = new CActivityGroup();
      o.load(parseInt(request.params.id as string));
      o.delete();
      response.redirect("/activitygroup");
   }
   catch(e) {
      response.redirect("/activitygroup");
   }
});
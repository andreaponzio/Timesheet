/**
 * @author Andrea Ponzio
 * @version 1.0.0
 */
import express, {Request, Response, Router} from "express";
import {objectType} from "../core/CBase";
import CWorkday, {IWorkday, IWorkdaySummarize} from "../core/CWorkday";
import CActivity, {IActivity} from "../core/CActivity";

/**
 * Funzioni locali.
 */
let listOfActivity = (object: CActivity): IActivity[] => {
   return object.executeAll("SELECT id, internal_ref, description FROM main.activity ORDER BY description;") as IActivity[];
}

/**
 * Dichiarazioni locali.
 */
export let router: Router = express.Router();

/**
 * Pagina principale.
 */
router.get("/", (request: Request, response: Response) => {
   let o: CWorkday;

   o = new CWorkday();
   response.render("app", {
      view: objectType.workday_list,
      data: o.summarize()
   });
});

/**
 * Permette di creare una consuntivazione se l'identificativo passato è zero, altrimenti
 * visualizza il dettaglio.
 */
router.get("/:id", (request: Request, response: Response) => {
   let o: CWorkday;
   let a: CActivity;

   o = new CWorkday();
   a = new CActivity();

   switch(parseInt(request.params.id)) {
      case 0:
         response.render("app", {
            view: objectType.workday_create,
            data: {
               id: 0,
               date: o.convertDate(new Date(), 3),
               activity_list: listOfActivity(a)
            }
         });
         break;

      default:
         o.load(parseInt(request.params.id));
         a.load(o.activity);
         response.render("app", {
            view: objectType.workday_details,
            data: {
               id: o.id,
               activity: o.activity,
               activity_description: a.description,
               date: o.convertDate(o.date, 3),
               hour: o.hour,
               extrainfo: o.extrainfo,
               place: o.place,
               note: o.note,
               activity_list: listOfActivity(a)
            }
         });
   }
});

/**
 * Visualizza le consuntivazioni riferita a una specifica data.
 */
router.get("/group/:id", (request: Request, response: Response) => {
   let o: CWorkday;

   o = new CWorkday();

   response.render("app", {
      view: objectType.workday_group,
      data: o.getGroupData(parseInt(request.params.id))
   });
});

/**
 * Effettua la creazione o l'aggiornamento di un'attività.
 */
router.post("/:id", (request: Request, response: Response) => {
   let o: CWorkday;
   let a: CActivity;

   o = new CWorkday();
   a = new CActivity();
   try {
      if(parseInt(request.params.id))
         o.load(parseInt(request.params.id));
      o.activity = parseInt(request.body.activity);
      o.date = new Date(request.body.date);
      o.hour = parseInt(request.body.hour);
      o.extrainfo = request.body.extrainfo;
      o.place = request.body.place;
      o.note = request.body.note;
      o.save();
      response.redirect("/workday");
   }
   catch(e) {
      o.load(parseInt(request.params.id));
      o.activity = parseInt(request.body.activity);
      response.render("app", {
         view: objectType.workday_list,
         data: {
            id: o.id,
            activity: o.activity,
            activity_description: a.description,
            date: o.convertDate(o.date, 3),
            hour: o.hour,
            extrainfo: o.extrainfo,
            place: o.place,
            note: o.note,
            activity_list: listOfActivity(a)
         }
      });
   }
});

/**
 * Elimina la consuntivazione.
 */
router.delete("/:id", (request: Request, response: Response) => {
   let o: CWorkday;

   try {
      o = new CWorkday();
      o.load(parseInt(request.params.id));
      o.delete();
      response.redirect("/workday");
   }
   catch(e) {
      response.redirect("/workday");
   }
});
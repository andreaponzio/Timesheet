/**
 * @author Andrea Ponzio
 * @version 1.0.0
 */
import express, {Request, Response, Router} from "express";
import {objectType} from "../core/CBase";
import CTool from "../core/CTool";
import CActivity from "../core/CActivity";
import CRequest, {IRequestSummarize} from "../core/CRequest";

/**
 * Funzioni locali.
 */
let listOfRequest = (request: Request, tr: CRequest): IRequestSummarize[] => {
   let listOfRequest: IRequestSummarize[] = [];
   let prodsys: string[];
   let activity: number;
   let type: number;
   let filter: string = "";
   let where: string = "";

   // Recupera parametri di filtro:
   if(request.body !== undefined) {
      activity = parseInt(request.body.activity as string);
      type = parseInt(request.body.ftype as string);
   }
   else {
      activity = 0;
      type = 0;
   }

   // Legge sistemi finali e prepara filtro:
   try {
      prodsys = tr.executeAll("SELECT * FROM main.prod_system;") as string[];
      prodsys.forEach(s => {
         filter = filter + `,'${s["systemid"]}'`;
      });
      filter = filter.slice(1);
   }
   catch(e) {
   }

   // Aggiunge al filtro anche la parte riguardante l'attività:
   if(activity)
      where = `WHERE activity_id = ${activity} `;

   // Filtra le richieste in base al tipo filtro:
   switch(type) {
      case 0:
         listOfRequest = tr.executeAll(`SELECT *
                                        FROM main.request_status ${where}
                                        GROUP BY id;`) as IRequestSummarize[];
         break;

      case 1:
         filter = `HAVING SUM(COALESCE(systemid IN (${filter}), 0)) = 0`;
         listOfRequest = tr.executeAll(`SELECT *
                                        FROM main.request_status ${where}
                                        GROUP BY id ${filter};`) as IRequestSummarize[];
         break;

      case 2:
         filter = `HAVING SUM(COALESCE(systemid IN (${filter}), 0)) > 0`;
         listOfRequest = tr.executeAll(`SELECT *
                                        FROM main.request_status ${where}
                                        GROUP BY id ${filter};`) as IRequestSummarize[];
         break;
   }

   return listOfRequest;
}

/**
 * Dichiarazioni locali.
 */
export let router: Router = express.Router();
let error: string;

/**
 * Visualizza la lista delle richieste.
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
 * Visualizza i dettagli della richiesta selezionata:.
 */
router.get("/:id", (request: Request, response: Response) => {
   let tr: CRequest;
   let activity: CActivity;

   tr = new CRequest();

   // Gestisce sia la selezione di una TR sia quando viene selezionato il link allo stato
   // delle TR.
   // Stato delle TR:
   if(isNaN(parseInt(request.params.id as string)))
      response.render("app", {
         view: objectType.tr_status,
         data: {
            activity_list: CTool.getActivity(new CActivity()),
            activity: 0,
            request: listOfRequest(request, tr),
            checked: "0"
         }
      });

   // Specifica TR:
   else {
      activity = new CActivity();
      tr.load(parseInt(request.params.id as string));
      activity.load(tr.activity);

      response.render("app", {
         view: objectType.request_details,
         data: {
            request: tr.data,
            activity: activity.data
         }
      });
   }
});

/**
 * Aggiorna le note inserite.
 */
router.post("/:id", (request: Request, response: Response) => {
   let tr: CRequest;

   tr = new CRequest();

   // Gestisce il POST sia quando selezionata una specifica TR sia quando si è nella
   // pagina degli stati delle TR:
   try {
      if(isNaN(parseInt(request.params.id as string))) {
         response.render("app", {
            view: objectType.tr_status,
            data: {
               activity_list: CTool.getActivity(new CActivity()),
               activity: parseInt(request.body.activity as string),
               request: listOfRequest(request, new CRequest()),
               checked: request.body.ftype
            }
         });
      }
      else {
         tr.load(parseInt(request.params.id as string));
         tr.note = request.body.note;
         tr.saveNote();
         response.redirect("/request/");
      }
   }
   catch(e) {
      response.render(`/request/${request.params.id}`, {
            error: e.message
         }
      );
   }
   finally {
      tr = undefined;
   }
});

/**
 * Disegna la pagina per l'import massivo delle richieste di trasporto e per
 * la loro associazione all'attività. Quando l'attività passata è zero, significa
 * che dovrà essere selezionata, altrimenti la selezione sarà automatica.
 */
router.get("/import/:id", (request: Request, response: Response) => {
   response.render("app", {
      view: objectType.request_create,
      data: {
         id: parseInt(request.params.id as string),
         list_activity: CTool.getActivity(new CActivity()),
         error: error
      }
   });
});

/**
 * Importa un elenco di richieste di trasporto e le assegna all'attività selezionata.
 */
router.post("/import/:id", (request: Request, response: Response) => {
   let listOfRequest: string[];
   let activity: number;

   error = "";

   try {
      listOfRequest = (request.body.request as string).split(";");
      activity = parseInt(request.params.id as string);
      if(activity === 0)
         activity = parseInt(request.body.activity as string);
      CRequest.import(activity, listOfRequest);
      response.redirect(`/activity/${activity}`);
   }
   catch(e) {
      error = e.message;
      response.redirect(`/request/${request.params.id}`);
   }
});

/**
 * Effettua la cancellazione fisica della richiesta selezionata.
 */
router.delete("/:id", (request: Request, response: Response) => {
   let tr: CRequest;

   tr = new CRequest();
   try {
      tr.load(parseInt(request.params.id as string));
      tr.delete();
      response.redirect("/request");
   }
   catch(e) {
      response.render(`/request/${request.params.id}`, {
            error: e.message
         }
      );
   }
   finally {
      tr = undefined;
   }
});

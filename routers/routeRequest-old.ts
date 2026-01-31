/**
 * @author Andrea Ponzio
 * @version 1.0.0
 */
// import express, {Request, Response, Router} from "express";
// import * as fs from "node:fs";
// import * as pt from "node:path";
// import {objectType} from "../core/CBase";
// import CActivity, {IActivity} from "../core/CActivity";
//
// /**
//  * Funzioni locali.
//  */
// let listOfActivity = (object: CActivity): IActivity[] => {
//    return object.executeAll("SELECT id, internal_ref, description FROM main.activity") as IActivity[];
// }
//
// /**
//  * Dichiarazioni locali.
//  */
// export let router: Router = express.Router();
//
// /**
//  * Pagina principale.
//  */
// router.get("/", (request-old: Request, response: Response) => {
//    let o: CRequestOld;
//
//    if(o === undefined)
//       o = new CRequestOld();
//    o.clean();
//
//    response.render("app", {
//       view: objectType.request_list,
//       data: o.summarize()
//    });
// });
//
// /**
//  * Permette di creare una richiesta di trasporto se l'identificativo passato è zero, altrimenti
//  * visualizza il dettaglio.
//  */
// router.get("/:id", (request-old: Request, response: Response) => {
//    let o: CRequestOld;
//    let a: CActivity;
//
//    o = new CRequestOld();
//    a = new CActivity();
//
//    switch(parseInt(request-old.params.id as string)) {
//       case 0:
//          response.render("app", {
//             view: objectType.request_create,
//             data: {
//                id: 0,
//                activity_list: listOfActivity(a)
//             }
//          });
//          break;
//
//       default:
//          o.load(parseInt(request-old.params.id as string));
//          a.load(o.activity);
//          response.render("app", {
//             view: objectType.request_details,
//             data: {
//                id: o.id,
//                request-old: o.request-old,
//                type: o.type,
//                description: o.description,
//                owner: o.owner,
//                date: o.convertDate(o.date, 3),
//                note: o.note,
//                env: o.env,
//                activity_id: a.id,
//                activity_description: a.description,
//                activity_list: listOfActivity(a),
//             }
//          });
//    }
// });
//
// /**
//  * Effettua la creazione o l'aggiornamento di una richiesta di trasporto.
//  */
// router.post("/:id", (request-old: Request, response: Response) => {
//    let o: CRequestOld;
//    let a: CActivity;
//
//    o = new CRequestOld();
//    a = new CActivity();
//
//    try {
//       if(parseInt(request-old.params.id as string))
//          o.load(parseInt(request-old.params.id as string));
//       o.activity = request-old.body.activity;
//       o.request-old = request-old.body.request-old;
//       o.type = parseInt(request-old.body.type);
//       o.description = request-old.body.description;
//       o.owner = request-old.body.owner;
//       o.date = new Date(request-old.body.date);
//       o.note = request-old.body.note;
//       o.save();
//       if(!parseInt(request-old.params.id as string))
//          o.transport();
//       response.redirect("/request-old");
//    }
//    catch(e) {
//       a.load(o.activity);
//       response.render("app", {
//          view: objectType.request_create,
//          data: {
//             id: o.id,
//             request-old: o.request-old,
//             type: o.type,
//             description: o.description,
//             owner: o.owner,
//             date: o.date,
//             note: o.note,
//             env: o.env,
//             activity_id: a.id,
//             activity_description: a.description,
//             activity_list: listOfActivity(a),
//             error: e.message
//          }
//       });
//    }
// });
//
// /**
//  * Elimina la richiesta di trasporto.
//  */
// router.delete("/:id", (request-old: Request, response: Response) => {
//    let o: CRequestOld;
//    let a: CActivity;
//
//    o = new CRequestOld();
//    a = new CActivity();
//    o.load(parseInt(request-old.params.id as string));
//    a.load(o.activity);
//
//    try {
//       o.delete();
//       response.redirect("/request-old");
//    }
//    catch(e) {
//       response.render("app", {
//          view: objectType.activity_details,
//          data: {
//             id: o.id,
//             request-old: o.request-old,
//             type: o.type,
//             description: o.description,
//             owner: o.owner,
//             date: o.date,
//             note: o.note,
//             env: o.env,
//             activity_id: a.id,
//             activity_description: a.description,
//             activity_list: listOfActivity(a),
//             error: e.message
//          }
//       });
//    }
// });
//
// /**
//  * Effettua trasporto della richiesta.
//  */
// router.patch("/:id", (request-old: Request, response: Response) => {
//    let o: CRequestOld;
//    let a: CActivity;
//
//    o = new CRequestOld();
//    a = new CActivity();
//    o.load(parseInt(request-old.params.id as string));
//    a.load(o.activity);
//
//    try {
//       o.transport();
//       response.redirect(`/request-old/${o.id}`);
//    }
//    catch(e) {
//       response.render("app", {
//          view: objectType.activity_details,
//          data: {
//             id: o.id,
//             request-old: o.request-old,
//             type: o.type,
//             description: o.description,
//             owner: o.owner,
//             date: o.date,
//             note: o.note,
//             env: o.env,
//             activity_id: a.id,
//             activity_description: a.description,
//             activity_list: listOfActivity(a),
//             error: e.message
//          }
//       });
//    }
// });
//
// /**
//  * Resetta un trasporto della richiesta.
//  */
// router.put("/:id", (request-old: Request, response: Response) => {
//    let o: CRequestOld;
//    let a: CActivity;
//
//    o = new CRequestOld();
//    a = new CActivity();
//    o.load(parseInt(request-old.params.id as string));
//    a.load(o.activity);
//
//    try {
//       o.transport(undefined, true);
//       response.redirect(`/request-old/${o.id}`);
//    }
//    catch(e) {
//       response.render("app", {
//          view: objectType.activity_details,
//          data: {
//             id: o.id,
//             request-old: o.request-old,
//             type: o.type,
//             description: o.description,
//             owner: o.owner,
//             date: o.date,
//             note: o.note,
//             env: o.env,
//             activity_id: a.id,
//             activity_description: a.description,
//             activity_list: listOfActivity(a),
//             error: e.message
//          }
//       });
//    }
// });
//
// /**
//  * Visualizza pagina con l'elenco delle richieste di trasporto presenti
//  * nella cartella import valide per il system id specificato.
//  */
// router.get("/import/:id", (request-old: Request, response: Response) => {
//    let list_of_file: fs.Dirent[];
//
//    list_of_file = fs.readdirSync("./import/", {withFileTypes: true});
//    console.log(list_of_file);
// });
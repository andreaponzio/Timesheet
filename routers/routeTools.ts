/**
 * @author Andrea Ponzio
 * @version 1.0.0
 */
import express, {Request, Response, Router} from "express";
import CCustomer, {ICustomer} from "../core/CCustomer";
import CWbs, {IWbs} from "../core/CWbs";
import CActivity, {IActivity} from "../core/CActivity";
import {objectType} from "../core/CBase";
import CRequest, {IRequest} from "../core/CRequest";
import {sap} from "../public/config.json";
import {executeHttpRequest, HttpResponse} from '@sap-cloud-sdk/http-client';
import CWorkday, {IWorkday} from "../core/CWorkday";
import {SqlGen} from "../core/CSqlGen";
import IField = SqlGen.IField;
import Sign = SqlGen.Sign;
import IOption = SqlGen.IOption;
import Option = SqlGen.Option;

/**
 * Funzioni locali.
 */
let sendData = async(system: object, entrypoint: string, data: any) => {
   let httpResponse: HttpResponse;

   httpResponse = await executeHttpRequest({
         type: "HTTP",
         sapClient: system["client"],
         url: `${system["server"]}${entrypoint}`,
         authentication: "BasicAuthentication",
         username: "DEVELOPER",
         password: "Skynet"
      },
      {
         method: "POST",
         dataType: "json",
         data: data
      },
      {
         fetchCsrfToken: true
      });
}

/**
 * Dichiarazioni locali.
 */
export let router: Router = express.Router();

/**
 * Pagina principale per rigenerazione indici di ricerca.
 */
router.get("/index", (request: Request, response: Response) => {
   response.render("app", {
      view: objectType.index
   });
});

/**
 * Rigenera gli indici selezionati.
 */
router.post("/index", (request: Request, response: Response) => {
   let customer: CCustomer;
   let wbs: CWbs;
   let activity: CActivity;
   let tr: CRequest;
   let customer_data: ICustomer[];
   let wbs_data: IWbs[];
   let activity_data: IActivity[];
   let tr_data: IRequest[];

   customer = new CCustomer();
   wbs = new CWbs();
   activity = new CActivity();
   tr = new CRequest();

   // Aggiornamento clienti:
   if(request.body.customer === "on") {
      customer.executeRun("DELETE FROM main.search WHERE type = 1;");
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
      wbs.executeRun("DELETE FROM main.search WHERE type = 2;");
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
      activity.executeRun("DELETE FROM main.search WHERE type = 3;");
      activity_data = activity.loadAll();
      activity_data.forEach(d => {
         activity = new CActivity();
         activity.load(d.id);
         activity.search();
         activity = undefined;
      });
   }

   // Aggiornamento richiesta di trasporto:
   if(request.body.request === "on") {
      tr.executeRun("DELETE FROM main.search WHERE type = 4;");
      tr_data = tr.loadAll();
      tr_data.forEach(d => {
         tr = new CRequest();
         tr.load(d.id);
         tr.search();
         tr = undefined;
      });
   }

   // Riporta sulla pagina principale:
   response.redirect("/");
});

/**
 * Pagina principale per gestione sistemi finali TR.
 */
router.get("/prodsys", (request: Request, response: Response) => {
   let tr: CRequest;
   let prodsys: string[];

   tr = new CRequest();

   // Legge sistemi finali da passare alla pagina:
   prodsys = tr.executeAll("SELECT * FROM main.prod_system") as string[];

   // Disegna la pagina con l'elenco dei sistemi finali:
   response.render("app", {
      view: objectType.prodsys,
      data: prodsys
   });
});

/**
 * Aggiunge i sistemi finali alla tabella.
 */
router.post("/prodsys", (request: Request, response: Response) => {
   let tr: CRequest;
   let prodsys: string[];

   tr = new CRequest();

   // Aggiunge i sistemi finali alla tabella:
   prodsys = request.body.prodsys.split(";");
   prodsys.forEach(d => {
      try {
         tr.executeRun(`INSERT INTO main.prod_system (systemid)
                        VALUES ('${d.toUpperCase().trim()}');`);
      }
      catch(e) {
      }
   });

   // Riporta sulla pagina principale:
   response.redirect("/tools/prodsys");
});

/**
 * Rimuove i sistemi finali selezionati.
 */
router.delete("/prodsys", (request: Request, response: Response) => {
   let tr: CRequest;
   let key: string;

   tr = new CRequest();

   // Elimina i sistemi finali dalla tabella:
   for(let d in request.body) {
      if(request.body[d] === "on")
         try {
            key = d.slice(1);
            tr.executeRun(`DELETE
                           FROM main.prod_system
                           WHERE systemid = '${key}';`);
         }
         catch(e) {
         }
   }

   // Riporta sulla pagina principale:
   response.redirect("/tools/prodsys");
});

/**
 * Permette di trasferire a un sistema SAP i dati delle tabelle. I sistemi SAP
 * sono nel file di configurazione.
 */
router.get("/sendsap", (request: Request, response: Response) => {
   response.render("app", {
      view: objectType.sendsap,
      data: sap
   });
});

/**
 * Genera oggetti JSON da inviare al sistema SAP specificato.
 */
router.post("/sendsap", async(request: Request, response: Response) => {
   let system: object;
   let customer: CCustomer;
   let wbs: CWbs;
   let activity: CActivity;
   let tr: CRequest;
   let wk: CWorkday;

   let customer_data: ICustomer[];
   let wbs_data: IWbs[];
   let activity_data: IActivity[];
   let tr_data_all: IRequest[];
   let wk_data: IWorkday[];

   // Se non è stato selezionato un sistema non prosegue:
   if(request.body.sap.length > 0) {
      system = sap.find(s => s.id === request.body.sap);

      // Clienti:
      if(request.body.customer == "on") {
         customer = new CCustomer();
         customer_data = customer.loadAll();
         await sendData(system, "/customer/all", customer_data);
      }

      // Commesse:
      if(request.body.wbs == "on") {
         wbs = new CWbs();
         wbs_data = wbs.loadAll();
         await sendData(system, "/wbs/all", wbs_data);
      }

      // Attività:
      if(request.body.activity == "on") {
         activity = new CActivity();
         activity_data = activity.loadAll();
         await sendData(system, "/activity/all", activity_data);
      }

      // Trasporti:
      if(request.body.request == "on") {
         tr = new CRequest();
         tr_data_all = tr.loadAll();
         for await (let r of tr_data_all) {
            tr = new CRequest();
            tr.load(r.id);
            await sendData(system, "/request/all", [tr.data]);
         }
      }

      // Consuntivazione:
      if(request.body.workday == "on") {
         wk = new CWorkday();
         wk_data = wk.loadAll();
         await sendData(system, "/workday/all", wk_data);
      }
   }

   // Riporta alla pagina principale al termine:
   response.redirect("/");
});

/**
 * Permette di copiare o spostare i dati di un'attività su un'altra.
 */
router.get("/copyact", (request: Request, response: Response) => {
   let activity: CActivity;
   let activity_list: IActivity[];

   activity = new CActivity();
   activity_list = activity.loadAll([{
      name: "status",
      value: [{sign: Sign.EXCLUDE, option: Option.BETWEEN, low: 4, high: 5}] as IOption[]
   }] as IField[]);

   response.render("app", {
      view: objectType.copyact,
      data: activity_list
   });
});

/**
 * Copia o sposta i dati da un'attività a un'altra.
 */
router.post("/copyact", (request: Request, response: Response) => {
   let source: CActivity;
   let target: CActivity;
   let workday: CWorkday;
   let tr: CRequest;
   let workday_clone: CWorkday;
   let tr_clone: CRequest;

   source = new CActivity();
   target = new CActivity();

   source.load(parseInt(request.body.source));
   target.load(parseInt(request.body.target));

   // Copia consuntivazioni:
   source.getWorkday().forEach((w) => {
      workday = new CWorkday();
      workday.load(w.id);
      workday_clone = workday.clone();
      workday_clone.activity = target.id;
      workday_clone.save();
      if(request.body.move === "on")
         workday.delete();
      workday = workday_clone = undefined;
   });

   // Copia richieste di trasporto:
   source.getRequest().forEach((r) => {
      tr = new CRequest();
      tr.load(r.id);
      tr_clone = tr.clone(target.id);
      if(tr_clone !== undefined) {
         tr_clone.save();
         if(request.body.move === "on")
            tr.delete();
      }
      tr = tr_clone = undefined;
   });

   response.redirect("/activity");
});

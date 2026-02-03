/**
 * @author Andrea Ponzio
 * @version 1.0.0
 */
import CBase, {IBase, numericInterval} from "./CBase";
import * as fs from "node:fs";
import {Buffer} from "node:buffer";
import {SqlGen} from "./CSqlGen";
import CSqlGen = SqlGen.CSqlGen;
import Sign = SqlGen.Sign;
import Option = SqlGen.Option;
import IOption = SqlGen.IOption;
import IField = SqlGen.IField;
import {dirIn} from "../public/config.json";

export interface IRequestObject {
   as4pos: number;
   pgmid: string;
   object: string;
   obj_name: string;
   objfunc: string;
   lockfile: string;
   lang: string;
   activity: string;
}
export interface IRequestAttribute {
   pos: number;
   attribute: string;
   reference: string;
}
export interface IRequestCofile {
   systemid: string;
   stepid: string;
   pos: number;
   date: Date;
   system_rc: number;
   stepid_rc: number;
   action_rc: number;
}
export interface IRequest extends IBase {
   activity: number;
   request: string;
   type: string;
   status: string;
   description: string;
   owner: string;
   date: Date;
   object: IRequestObject[];
   attribute: IRequestAttribute[];
   cofile: IRequestCofile[];
}
export interface IRequestSummarize {
   id: number;
   request: string;
   description: string;
   activity: string;
   customer: string;
}

export default class CRequest extends CBase {
   /**
    * Proprietà protette.
    * @protected
    */
   protected _data: IRequest

   /**
    * Get & Set.
    */
   get activity(): number {
      return this._data.activity;
   }
   get request(): string {
      return this._data.request;
   }
   get type(): string {
      return this._data.type;
   }
   get status(): string {
      return this._data.status;
   }
   get description(): string {
      return this._data.description;
   }
   get owner(): string {
      return this._data.owner;
   }
   get date(): Date {
      return new Date(this._data.date);
   }
   get object(): IRequestObject[] {
      return this._data.object;
   }
   get attribute(): IRequestAttribute[] {
      return this._data.attribute;
   }
   get cofile(): IRequestCofile[] {
      return this._data.cofile;
   }

   /**
    * Converte la data e l'orario presente nel file della richiesta in un oggetto Date.
    * @param date data della richiesta.
    * @param time ora della richiesta.
    * @private
    */
   private convertRequestDate(date: string, time: String): Date {
      let day: number;
      let month: number;
      let year: number;
      let hour: number;
      let minute: number;
      let second: number;

      year = parseInt(date.slice(0, 4));
      month = parseInt(date.slice(5, 7));
      day = parseInt(date.slice(8, 10));
      hour = parseInt(time.slice(0, 2));
      minute = parseInt(time.slice(3, 5));
      second = parseInt(time.slice(6, 8));

      return new Date(year, month, day, hour, minute, second);
   }

   /**
    * Permette di importare un richiesta di trasporto nella base dati.
    * @param activity attività alla quale assegnare la CR.
    * @param listOfRequest
    */
   public static import(activity: number, listOfRequest: string[]): void {
      let tr: CRequest;
      let data: object;
      let filename: string;
      let rbin: Buffer;
      let kbin: Buffer;

      listOfRequest.forEach(r => {
         try {
            tr = new CRequest();
            tr.load(r.trim())
            if(tr.data !== undefined)
               tr.delete();
            tr.clean();

            // Inserisce json:
            filename = dirIn + r.trim() + ".json";
            data = JSON.parse(fs.readFileSync(filename, "utf8"));
            tr.fillFromJson(activity, data);
            tr.save();

            // Inserisce binari per file R e K:
            filename = dirIn + "R" + r.trim().slice(4) + "." + r.trim().slice(0, 3);
            rbin = fs.readFileSync(filename);
            filename = dirIn + "K" + r.trim().slice(4) + "." + r.trim().slice(0, 3);
            kbin = fs.readFileSync(filename);
            tr.execute("INSERT INTO request_binary (id, r, k) VALUES(?, ?, ?);", tr.id, rbin, kbin);
         }
         catch(e) {
         }
         finally {
            tr = undefined;
         }
      });
   }

   /**
    * Costruttore.
    */
   constructor() {
      super();
      this.clean();
   }

   /**
    * Inizializza proprietà.
    */
   public clean(): void {
      super._clean();
      this._data.activity = undefined;
      this._data.request = undefined;
      this._data.type = undefined;
      this._data.description = undefined;
      this._data.owner = undefined;
      this._data.date = undefined;
      this._data.object = [];
      this._data.attribute = [];
      this._data.cofile = [];
   }

   /**
    * Permette di caricare uno specifico trasporto.
    * @param id identificativo del trasporto.
    */
   public load(id: string | number): void {
      if(typeof id === "number")
         this._data = this._select("request", CSqlGen.allField, [{
            name: "id",
            value: [{sign: Sign.INCLUDE, option: Option.EQUAL, low: id}] as IOption[]
         }] as IField[])[0] as IRequest;
      else if(typeof id === "string")
         this._data = this._select("request", CSqlGen.allField, [{
            name: "request",
            value: [{sign: Sign.INCLUDE, option: Option.EQUAL, low: id}] as IOption[]
         }] as IField[])[0] as IRequest;
      else
         throw new Error();

      if(this._data !== undefined) {
         this._data.object = this._select("request_object", CSqlGen.allField, [{
            name: "id",
            value: [{sign: Sign.INCLUDE, option: Option.EQUAL, low: this.id}] as IOption[]
         }] as IField[]) as IRequestObject[];
         this._data.attribute = this._select("request_attribute", CSqlGen.allField, [{
            name: "id",
            value: [{sign: Sign.INCLUDE, option: Option.EQUAL, low: this.id}] as IOption[]
         }] as IField[]) as IRequestAttribute[];
         this._data.cofile = this._select("request_cofile", CSqlGen.allField, [{
            name: "id",
            value: [{sign: Sign.INCLUDE, option: Option.EQUAL, low: this.id}] as IOption[]
         }] as IField[], "ORDER BY date") as IRequestCofile[];
      }
   }

   /**
    * Restituisce una lista di trasporti che rispondono ai criteri di ricerca.
    * @param where condizione di ricerca.
    */
   public loadAll(where: SqlGen.IField[]): IRequest[] {
      return this._select("request", CSqlGen.allField, where) as IRequest[];
   }

   /**
    * Effettua il salvataggio dei dati del trasporto e aggiorna indice di ricerca.
    */
   public save(): void {
      try {

         // Se l'id è valorizzato, allora viene mantenuto e vengono cancellati tutti i
         // dati così da poterli sostituire:
         if(this.id === 0)
            super._save(numericInterval.change_request);

         // Inserisce informazioni nelle tabelle:
         this._insert("request",
            [
               {
                  name: "activity",
                  value: [{sign: Sign.INCLUDE, option: Option.EQUAL, low: this.activity}] as IOption[]
               },
               {
                  name: "request",
                  value: [{sign: Sign.INCLUDE, option: Option.EQUAL, low: this.request}] as IOption[]
               },
               {
                  name: "type",
                  value: [{sign: Sign.INCLUDE, option: Option.EQUAL, low: this.type}] as IOption[]
               },
               {
                  name: "status",
                  value: [{sign: Sign.INCLUDE, option: Option.EQUAL, low: this.status}] as IOption[]
               },
               {
                  name: "description",
                  value: [{sign: Sign.INCLUDE, option: Option.EQUAL, low: this.description}] as IOption[]
               },
               {
                  name: "owner",
                  value: [{sign: Sign.INCLUDE, option: Option.EQUAL, low: this.owner}] as IOption[]
               },
               {
                  name: "date",
                  value: [{sign: Sign.INCLUDE, option: Option.EQUAL, low: this.convertDate(this.date)}] as IOption[]
               },
            ] as IField[]);
         this.object.forEach(o => {
            this._insert("request_object",
               [
                  {
                     name: "id",
                     value: [{sign: Sign.INCLUDE, option: Option.EQUAL, low: this.id}] as IOption[]
                  },
                  {
                     name: "as4pos",
                     value: [{sign: Sign.INCLUDE, option: Option.EQUAL, low: o.as4pos}] as IOption[]
                  },
                  {
                     name: "pgmid",
                     value: [{sign: Sign.INCLUDE, option: Option.EQUAL, low: o.pgmid}] as IOption[]
                  },
                  {
                     name: "object",
                     value: [{sign: Sign.INCLUDE, option: Option.EQUAL, low: o.object}] as IOption[]
                  },
                  {
                     name: "obj_name",
                     value: [{sign: Sign.INCLUDE, option: Option.EQUAL, low: o.obj_name}] as IOption[]
                  },
                  {
                     name: "objfunc",
                     value: [{sign: Sign.INCLUDE, option: Option.EQUAL, low: o.objfunc}] as IOption[]
                  },
                  {
                     name: "lockflag",
                     value: [{sign: Sign.INCLUDE, option: Option.EQUAL, low: o.lockfile}] as IOption[]
                  },
                  {
                     name: "lang",
                     value: [{sign: Sign.INCLUDE, option: Option.EQUAL, low: o.lang}] as IOption[]
                  },
                  {
                     name: "activity",
                     value: [{sign: Sign.INCLUDE, option: Option.EQUAL, low: o.activity}] as IOption[]
                  }
               ] as IField[], true, true);
         });
         this.attribute.forEach(a => {
            this._insert("request_attribute",
               [
                  {
                     name: "id",
                     value: [{sign: Sign.INCLUDE, option: Option.EQUAL, low: this.id}] as IOption[]
                  },
                  {
                     name: "pos",
                     value: [{sign: Sign.INCLUDE, option: Option.EQUAL, low: a.pos}] as IOption[]
                  },
                  {
                     name: "attribute",
                     value: [{sign: Sign.INCLUDE, option: Option.EQUAL, low: a.attribute}] as IOption[]
                  },
                  {
                     name: "reference",
                     value: [{sign: Sign.INCLUDE, option: Option.EQUAL, low: a.reference}] as IOption[]
                  }
               ] as IField[], true, true);
         });
         this.cofile.forEach(c => {
            this._insert("request_cofile",
               [
                  {
                     name: "id",
                     value: [{sign: Sign.INCLUDE, option: Option.EQUAL, low: this.id}] as IOption[]
                  },
                  {
                     name: "systemid",
                     value: [{sign: Sign.INCLUDE, option: Option.EQUAL, low: c.systemid}] as IOption[]
                  },
                  {
                     name: "stepid",
                     value: [{sign: Sign.INCLUDE, option: Option.EQUAL, low: c.stepid}] as IOption[]
                  },
                  {
                     name: "pos",
                     value: [{sign: Sign.INCLUDE, option: Option.EQUAL, low: c.pos}] as IOption[]
                  },
                  {
                     name: "date",
                     value: [{sign: Sign.INCLUDE, option: Option.EQUAL, low: this.convertDate(c.date)}] as IOption[]
                  },
                  {
                     name: "system_rc",
                     value: [{sign: Sign.INCLUDE, option: Option.EQUAL, low: c.system_rc}] as IOption[]
                  },
                  {
                     name: "stepid_rc",
                     value: [{sign: Sign.INCLUDE, option: Option.EQUAL, low: c.stepid_rc}] as IOption[]
                  },
                  {
                     name: "action_rc",
                     value: [{sign: Sign.INCLUDE, option: Option.EQUAL, low: c.action_rc}] as IOption[]
                  }
               ] as IField[], true, true);
         });

         // Aggiorna indice di ricerca:
         this.search();
      }
      catch(e) {
         throw e;
      }
   }

   /**
    * Effettua la cancellazione fisica del trasporto.
    */
   public delete(): void {
      if(this.id) {
         this._delete("request", [{
            name: "id",
            value: [{sign: Sign.INCLUDE, option: Option.EQUAL, low: this.id}] as IOption[]
         }] as IField[]);
         this._delete("request_object", [{
            name: "id",
            value: [{sign: Sign.INCLUDE, option: Option.EQUAL, low: this.id}] as IOption[]
         }] as IField[]);
         this._delete("request_attribute", [{
            name: "id",
            value: [{sign: Sign.INCLUDE, option: Option.EQUAL, low: this.id}] as IOption[]
         }] as IField[]);
         this._delete("request_cofile", [{
            name: "id",
            value: [{sign: Sign.INCLUDE, option: Option.EQUAL, low: this.id}] as IOption[]
         }] as IField[]);
         this._delete("request_binary", [{
            name: "id",
            value: [{sign: Sign.INCLUDE, option: Option.EQUAL, low: this.id}] as IOption[]
         }] as IField[]);
      }
   }

   /**
    * Aggiorna l'indica di ricerca aggiungendo o modificando i dati.
    */
   public search(): void {
   }

   /**
    * Permette di aggiornare gli indici di ricerca.
    */
   public summarize(): IRequestSummarize[] {
      return this.executeAll("SELECT * FROM request_summarize;") as IRequestSummarize[];
   }

   /**
    * Popola le proprietà di una richiesta partendo dal suo Json.
    * @param activity identificativo attività.
    * @param data json della richiesta.
    */
   public fillFromJson(activity: number, data: object): void {
      let pos: number = 0;

      try {
         this._data.activity = activity;
         this._data.request = data["REQUEST"]["H"]["TRKORR"];
         this._data.type = data["REQUEST"]["H"]["TRFUNCTION"];
         this._data.status = data["REQUEST"]["H"]["TRSTATUS"];
         this._data.description = data["REQUEST"]["H"]["AS4TEXT"];
         this._data.owner = data["REQUEST"]["H"]["AS4USER"];
         this._data.date = this.convertRequestDate(data["REQUEST"]["H"]["AS4DATE"], data["REQUEST"]["H"]["AS4TIME"]);

         this._data.object = [];
         for(let o of data["REQUEST"]["OBJECTS"])
            this._data.object.push({
               as4pos: o["AS4POS"],
               pgmid: o["PGMID"],
               object: o["OBJECT"],
               obj_name: o["OBJ_NAME"],
               objfunc: o["OBJFUNC"],
               lockfile: o["LOCKFLAG"],
               lang: o["LANG"],
               activity: o["ACTIVITY"]
            } as IRequestObject);

         this._data.attribute = [];
         for(let a of data["REQUEST"]["ATTRIBUTES"])
            this._data.attribute.push({
               pos: a["POS"],
               attribute: a["ATTRIBUTE"],
               reference: a["REFERENCE"]
            } as IRequestAttribute);

         this._data.cofile = [];
         for(let s of data["COFILE"]["SYSTEMS"])
            for(let p of s["STEPS"])
               for(let a of p["ACTIONS"]) {
                  pos++;
                  this._data.cofile.push({
                     systemid: s["SYSTEMID"],
                     stepid: p["STEPID"],
                     pos: pos,
                     date: this.convertRequestDate(a["DATE"], a["TIME"]),
                     system_rc: s["RC"],
                     stepid_rc: p["RC"],
                     action_rc: a["RC"]
                  } as IRequestCofile);
               }
      }
      catch(e) {
         throw e;
      }
   }
}
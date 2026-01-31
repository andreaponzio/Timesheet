/**
 * @author Andrea Ponzio
 * @version 1.0.0
 */
import CBase, {IBase, numericInterval, objectType} from "./CBase";
import {IWorkday} from "./CWorkday";
import {SqlGen} from "./CSqlGen";
import CSqlGen = SqlGen.CSqlGen;
import IField = SqlGen.IField;
import IOption = SqlGen.IOption;
import Sign = SqlGen.Sign;
import Option = SqlGen.Option;

export interface IActivity extends IBase {
   wbs: number;
   internal_ref: string;
   external_ref: string;
   type: number;
   description: string;
   functional: string;
   technical: string;
   hour: number;
   status: number;
   note: string
}
export interface IActivitySummarize {
   id: number;
   internal_ref: string;
   external_ref: string;
   description1: string;
   wbs: number;
   request: number;
}
export interface IActivityRequest {
   request: string;
   description: string;
   date: Date;
}

export default class CActivity extends CBase {
   /**
    * Proprietà protette.
    * @protected
    */
   protected _data: IActivity;

   /**
    * Get & Set.
    */
   get wbs(): number {
      return this._data.wbs;
   }
   get internal_ref(): string {
      return this._data.internal_ref;
   }
   get external_ref(): string {
      return this._data.external_ref;
   }
   get type(): number {
      return this._data.type;
   }
   get description(): string {
      return this._data.description;
   }
   get functional(): string {
      return this._data.functional;
   }
   get technical(): string {
      return this._data.technical;
   }
   get hour(): number {
      return this._data.hour;
   }
   get status(): number {
      return this._data.status;
   }
   get note(): string {
      return this._data.note;
   }
   set wbs(value: number) {
      this._data.wbs = value;
   }
   set internal_ref(value: string) {
      this._data.internal_ref = value;
   }
   set external_ref(value: string) {
      this._data.external_ref = value;
   }
   set type(value: number) {
      this._data.type = value;
   }
   set description(value: string) {
      this._data.description = value;
   }
   set functional(value: string) {
      this._data.functional = value;
   }
   set technical(value: string) {
      this._data.technical = value;
   }
   set hour(value: number) {
      this._data.hour = value;
   }
   set status(value: number) {
      this._data.status = value;
   }
   set note(value: string) {
      this._data.note = value;
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
      this.wbs = undefined;
      this.internal_ref = undefined;
      this.external_ref = undefined;
      this.type = undefined;
      this.description = undefined;
      this.functional = undefined;
      this.technical = undefined;
      this.hour = undefined;
      this.status = undefined;
      this.note = undefined;
   }

   /**
    * Carica l'attività con l'identificativo specificato.
    * @param id identificativo.
    * @public
    */
   public load(id: string | number): void {
      if(typeof id === "number")
         this._data = (this._select("activity", CSqlGen.allField, [{
            name: "id",
            value: [{sign: Sign.INCLUDE, option: Option.EQUAL, low: id}] as IOption[]
         }] as IField[])[0]) as IActivity;
      else if(typeof id === "string")
         this._data = (this._select("activity", CSqlGen.allField, [{
            name: "internal_ref",
            value: [{sign: Sign.INCLUDE, option: Option.EQUAL, low: id}] as IOption[]
         }] as IField[])[0]) as IActivity;
      else
         throw new Error();
   }

   /**
    * Effettua caricamento multiplo di anagrafiche attività.
    * @param where condizione di filtro.
    * @public
    */
   public loadAll(where: IField[] = []): IActivity[] {
      return this._select("activity", CSqlGen.allField, where) as IActivity[];
   }

   /**
    * Aggiorna l'anagrafica in linea.
    * @public
    */
   public save(): void {
      try {
         if(this.id === 0) {
            super._save(numericInterval.activity);
            this._insert("activity",
               [
                  {
                     name: "wbs",
                     value: [{sign: Sign.INCLUDE, option: Option.EQUAL, low: this.wbs}] as IOption[]
                  },
                  {
                     name: "internal_ref",
                     value: [{sign: Sign.INCLUDE, option: Option.EQUAL, low: this.internal_ref}] as IOption[]
                  },
                  {
                     name: "external_ref",
                     value: [{sign: Sign.INCLUDE, option: Option.EQUAL, low: this.external_ref}] as IOption[]
                  },
                  {
                     name: "type",
                     value: [{sign: Sign.INCLUDE, option: Option.EQUAL, low: this.type}] as IOption[]
                  },
                  {
                     name: "description",
                     value: [{sign: Sign.INCLUDE, option: Option.EQUAL, low: this.description}] as IOption[]
                  },
                  {
                     name: "functional",
                     value: [{sign: Sign.INCLUDE, option: Option.EQUAL, low: this.functional}] as IOption[]
                  },
                  {
                     name: "technical",
                     value: [{sign: Sign.INCLUDE, option: Option.EQUAL, low: this.technical}] as IOption[]
                  },
                  {
                     name: "hour",
                     value: [{sign: Sign.INCLUDE, option: Option.EQUAL, low: this.hour}] as IOption[]
                  },
                  {
                     name: "status",
                     value: [{sign: Sign.INCLUDE, option: Option.EQUAL, low: this.status}] as IOption[]
                  },
                  {
                     name: "note",
                     value: [{sign: Sign.INCLUDE, option: Option.EQUAL, low: this.note}] as IOption[]
                  }
               ] as IField[]
            );
         }
         else {
            this._update("activity",
               [
                  {
                     name: "wbs",
                     value: [{sign: Sign.INCLUDE, option: Option.EQUAL, low: this.wbs}] as IOption[]
                  },
                  {
                     name: "external_ref",
                     value: [{sign: Sign.INCLUDE, option: Option.EQUAL, low: this.external_ref}] as IOption[]
                  },
                  {
                     name: "type",
                     value: [{sign: Sign.INCLUDE, option: Option.EQUAL, low: this.type}] as IOption[]
                  },
                  {
                     name: "description",
                     value: [{sign: Sign.INCLUDE, option: Option.EQUAL, low: this.description}] as IOption[]
                  },
                  {
                     name: "functional",
                     value: [{sign: Sign.INCLUDE, option: Option.EQUAL, low: this.functional}] as IOption[]
                  },
                  {
                     name: "technical",
                     value: [{sign: Sign.INCLUDE, option: Option.EQUAL, low: this.technical}] as IOption[]
                  },
                  {
                     name: "hour",
                     value: [{sign: Sign.INCLUDE, option: Option.EQUAL, low: this.hour}] as IOption[]
                  },
                  {
                     name: "status",
                     value: [{sign: Sign.INCLUDE, option: Option.EQUAL, low: this.status}] as IOption[]
                  },
                  {
                     name: "note",
                     value: [{sign: Sign.INCLUDE, option: Option.EQUAL, low: this.note}] as IOption[]
                  }
               ] as IField[]);
         }
      }
      catch(e) {
         throw e;
      }
   }

   /**
    * Elimina fisicamente l'anagrafica in linea.
    * @public
    */
   public delete(): void {
      if(this.id)
         this._delete("activity", [{
            name: "id", value: [{sign: Sign.INCLUDE, option: Option.EQUAL, low: this.id}] as IOption[]
         }] as IField[]);
   }

   /**
    * Restituisce una sintesi delle attività e del numero di richieste
    * di trasporto assegnate.
    * @public
    */
   public summarize(): IActivitySummarize[] {
      return this.executeAll("SELECT * FROM activity_summarize;") as IActivitySummarize[];
   }

   /**
    * Restituisce lista delle consuntivazioni dell'attività.
    */
   public getWorkday(): IWorkday[] {
      return this.executeAll(`SELECT *
                              FROM main.workday
                              WHERE activity = ${this.id}
                              ORDER BY date DESC;`) as IWorkday[];
   }

   /**
    * Restituisce lista delle richieste di trasporto associate all'attività.
    */
   public getRequest(): IActivityRequest[] {
      return this.executeAll(`SELECT request, description, date, id
                              FROM main.request
                              WHERE activity = ${this.id}
                              ORDER BY date DESC;`) as IActivityRequest[];
   }

   /**
    * Permette di aggiornare gli indici di ricerca.
    */
   public search(): void {
      // Elimina vecchi indici di ricerca:
      this._delete("search", [{
         name: "id",
         value: [{sign: Sign.INCLUDE, option: Option.EQUAL, low: this.id}] as IOption[]
      }] as IField[]);

      // Genera i nuovi indici di ricerca:
      this.executeRun(`INSERT INTO main.search (id, sequence, data, url, type)
                       VALUES (${this.id}, ${this.getId(numericInterval.search)}, '${this.internal_ref}',
                               '/activity/${this.id}', 3)`);
      this.executeRun(`INSERT INTO main.search (id, sequence, data, url, type)
                       VALUES (${this.id}, ${this.getId(numericInterval.search)}, '${this.description}',
                               '/activity/${this.id}', 3)`);
   }
}
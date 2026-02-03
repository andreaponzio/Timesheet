/**
 * @author Andrea Ponzio
 * @version 1.0.0
 */
import CBase, {IBase, numericInterval, objectType} from "./CBase";
import {SqlGen} from "./CSqlGen";
import CSqlGen = SqlGen.CSqlGen;
import IField = SqlGen.IField;
import IOption = SqlGen.IOption;
import Sign = SqlGen.Sign;
import Option = SqlGen.Option;

export interface IWbs extends IBase {
   customer: number;
   internal_ref: string;
   description1: string;
   description2: string;
}
export interface IWbsSummarize {
   id: number;
   internal_ref: string;
   description1: string;
   description2: string;
   activity: number;
   customer: string;
}

export default class CWbs extends CBase {
   /**
    * Proprietà protette.
    * @protected
    */
   protected _data: IWbs;

   /**
    * Get & Set.
    */
   get customer(): number {
      return this._data.customer;
   }
   get internal_ref(): string {
      return this._data.internal_ref;
   }
   get description1(): string {
      return this._data.description1;
   }
   get description2(): string {
      return this._data.description2;
   }
   set customer(value: number) {
      this._data.customer = value;
   }
   set internal_ref(value: string) {
      this._data.internal_ref = value;
   }
   set description1(value: string) {
      this._data.description1 = value;
   }
   set description2(value: string) {
      this._data.description2 = value;
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
      this.internal_ref = undefined;
      this.description1 = undefined;
      this.description2 = undefined;
   }

   /**
    * Carica la commessa con l'identificativo specificato.
    * @param id identificativo.
    * @public
    */
   public load(id: string | number): void {
      if(typeof id === "number")
         this._data = (this._select("wbs", CSqlGen.allField, [{
            name: "id",
            value: [{sign: Sign.INCLUDE, option: Option.EQUAL, low: id}] as IOption[]
         }] as IField[])[0]) as IWbs;
      else if(typeof id === "string")
         this._data = (this._select("wbs", CSqlGen.allField, [{
            name: "internal_ref",
            value: [{sign: Sign.INCLUDE, option: Option.EQUAL, low: id}] as IOption[]
         }] as IField[])[0]) as IWbs;
      else
         throw new Error();
   }

   /**
    * Effettua caricamento multiplo di anagrafiche commessa.
    * @param where condizione di filtro.
    * @public
    */
   public loadAll(where: IField[] = []): IWbs[] {
      return this._select("wbs", CSqlGen.allField, where) as IWbs[];
   }

   /**
    * Aggiorna l'anagrafica in linea e anche l'indice di ricerca.
    * @public
    */
   public save(): void {
      try {
         if(this.id === 0) {
            super._save(numericInterval.wbs);
            this._insert("wbs",
               [
                  {
                     name: "internal_ref",
                     value: [{sign: Sign.INCLUDE, option: Option.EQUAL, low: this.internal_ref}] as IOption[]
                  },
                  {
                     name: "customer",
                     value: [{sign: Sign.INCLUDE, option: Option.EQUAL, low: this.customer}] as IOption[]
                  },
                  {
                     name: "description1",
                     value: [{sign: Sign.INCLUDE, option: Option.EQUAL, low: this.description1}] as IOption[]
                  },
                  {
                     name: "description2",
                     value: [{sign: Sign.INCLUDE, option: Option.EQUAL, low: this.description2}] as IOption[]
                  }] as IField[]
            );
         }
         else {
            this._update("wbs",
               [
                  {
                     name: "customer",
                     value: [{sign: Sign.INCLUDE, option: Option.EQUAL, low: this.customer}] as IOption[]
                  },
                  {
                     name: "description1",
                     value: [{sign: Sign.INCLUDE, option: Option.EQUAL, low: this.description1}] as IOption[]
                  },
                  {
                     name: "description2",
                     value: [{sign: Sign.INCLUDE, option: Option.EQUAL, low: this.description2}] as IOption[]
                  }
               ] as IField[]);
         }

         // Aggiorna indice di ricerca:
         this.search();
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
         this._delete("wbs", [{
            name: "id",
            value: [{sign: Sign.INCLUDE, option: Option.EQUAL, low: this.id}] as IOption[]
         }] as IField[]);
   }

   /**
    * Restituisce una sintesi delle commesse e del numero di attività assegnate.
    * @public
    */
   public summarize(): IWbsSummarize[] {
      return this.executeAll("SELECT * FROM wbs_summarize;") as IWbsSummarize[];
   }

   /**
    * Restituisce lista delle attività associate alla commessa.
    */
   public getActivity(): IWbs[] {
      return this.executeAll(`SELECT *
                              FROM main.activity
                              WHERE wbs = ${this.id};`) as IWbs[];
   }

   /**
    * Permette di aggiornare i indici di ricerca.
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
                               '/wbs/${this.id}', 2)`);
      this.executeRun(`INSERT INTO main.search (id, sequence, data, url, type)
                       VALUES (${this.id}, ${this.getId(numericInterval.search)}, '${this.description1}',
                               '/wbs/${this.id}', 2)`);
      this.executeRun(`INSERT INTO main.search (id, sequence, data, url, type)
                       VALUES (${this.id}, ${this.getId(numericInterval.search)}, '${this.description2}',
                               '/wbs/${this.id}', 2)`);
   }
}
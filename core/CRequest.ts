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

export interface IRequest extends IBase {
   activity: number;
   request: string;
   type: number;
   description: string;
   owner: string;
   date: Date;
   note: string;
}
export interface IRequestEnv {
   env: number;
   date: Date;
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
   protected _data: IRequest;
   protected _env: IRequestEnv[];

   /**
    * Get & Set.
    */
   get activity(): number {
      return this._data.activity;
   }
   get request(): string {
      return this._data.request;
   }
   get type(): number {
      return this._data.type;
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
   get note(): string {
      return this._data.note;
   }
   get env(): IRequestEnv[] {
      return this._env;
   }
   set activity(value: number) {
      this._data.activity = value;
   }
   set request(value: string) {
      this._data.request = value;
   }
   set type(value: number) {
      this._data.type = value;
   }
   set description(value: string) {
      this._data.description = value;
   }
   set owner(value: string) {
      this._data.owner = value;
   }
   set date(value: Date) {
      this._data.date = value;
   }
   set note(value: string) {
      this._data.note = value;
   }

   /**
    * Costruttore.
    */
   constructor() {
      super();
      this.clean
      ();
   }

   /**
    * Inizializza proprietà.
    */
   public clean(): void {
      super._clean();
      this.activity = undefined;
      this.request = undefined;
      this.type = undefined;
      this.description = undefined;
      this.owner = undefined;
      this.date = undefined;
      this.note = undefined;
      this._env = [];
   }

   /**
    * Carica la richiesta di trasporto con l'identificativo specificato.
    * @param id identificativo.
    * @public
    */
   public load(id: string | number): void {
      let env: object[];

      // Legge richiesta di trasporto:
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

      // Legge e copia log di trasporto:
      env = this._select("requestenv", CSqlGen.allField, [{
         name: "id",
         value: [{sign: Sign.INCLUDE, option: Option.EQUAL, low: id}] as IOption[]
      }] as IField[]) as IRequestEnv[];
      env.forEach(e => {
         this._env.push({
            env: e["env"],
            date: e["date"]
         } as IRequestEnv);
      });
   }

   /**
    * Effettua caricamento multiplo di richieste di trasporto.
    * @param where condizione di filtro.
    * @public
    */
   public loadAll(where: IField[] = []): IRequest[] {
      return this._select("request", CSqlGen.allField, where) as IRequest[];
   }

   /**
    * Aggiorna la richiesta di trasporto in linea.
    * @public
    */
   public save(): void {
      try {
         if(this.id === 0) {
            super._save(numericInterval.change_request);
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
                  {
                     name: "note",
                     value: [{sign: Sign.INCLUDE, option: Option.EQUAL, low: this.note}] as IOption[]
                  }
               ] as IField[]
            );
         }
         else {
            this._update("request",
               [
                  {
                     name: "activity",
                     value: [{sign: Sign.INCLUDE, option: Option.EQUAL, low: this.activity}] as IOption[]
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
                     name: "owner",
                     value: [{sign: Sign.INCLUDE, option: Option.EQUAL, low: this.owner}] as IOption[]
                  },
                  {
                     name: "date",
                     value: [{
                        sign: Sign.INCLUDE,
                        option: Option.EQUAL,
                        low: this.convertDate(new Date(this.date))
                     }] as IOption[]
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
    * Elimina fisicamente la richiesta di trasporto in linea.
    * @public
    */
   public delete(): void {
      if(this.id) {
         this._delete("requestenv", [{
            name: "id",
            value: [{sign: Sign.INCLUDE, option: Option.EQUAL, low: this.id}] as IOption[]
         }] as IField[]);
         this._delete("request", [{
            name: "id",
            value: [{sign: Sign.INCLUDE, option: Option.EQUAL, low: this.id}] as IOption[]
         }] as IField[]);
      }
   }

   /**
    * Effettua trasporto verso sistema successivo, oppure resetta
    * l'ultimo.
    * @param date data trasporto.
    * @param reset trasporto o ripristino.
    * @public
    */
   public transport(date: Date = undefined, reset: boolean = false): void {
      let last: IRequestEnv;
      let env: number;

      // Imposta data del giorno:
      if(date === undefined)
         date = new Date();

      // Nel caso di trasporto verso nuovo sistema, viene dapprima preso
      // l'ultimo inserimento e lo incrementa di uno. Per il ripristino
      // del sistema, viene eliminato l'ultimo trasporto. Il limite è fissato
      // a tre sistemi (sviluppo, qualità e produzione):
      switch(reset) {
         case false:
            last = this._env.reverse()[0];

            if(last === undefined)
               this._env.push({
                  env: 1,
                  date: date,
               });
            else if(last.env < 4) {
               env = last.env + 1;
               this._env.push({
                  env: env,
                  date: date,
               });
            }
            break;

         default:
            this._env.splice(this._env.length - 1, 1);
      }
   }

   /**
    * Registra il log di trasporto per la richiesta in linea.
    * @public
    */
   public saveTransport(): void {
      try {

         // Cancella tutto lo storico:
         this._delete("requestenv", [{
            name: "id",
            value: [{sign: Sign.INCLUDE, option: Option.EQUAL, low: this.id}] as IOption[]
         }] as IField[]);

         // Aggiorna lo storico:
         this.env.forEach(e => {
            this._insert("requestenv", [
               {
                  name: "env",
                  value: [{sign: Sign.INCLUDE, option: Option.EQUAL, low: e.env}] as IOption[]
               },
               {
                  name: "date",
                  value: [{
                     sign: Sign.INCLUDE,
                     option: Option.EQUAL,
                     low: this.convertDate(new Date(e.date))
                  }] as IOption[]
               }
            ] as IField[]);
         });
      }
      catch(e) {
         throw e;
      }
   }

   /**
    * Restituisce una sintesi delle richieste di trasporto e della relativa attività.
    * @public
    */
   public summarize(): IRequestSummarize[] {
      return this.executeAll("SELECT * FROM request_summarize;") as IRequestSummarize[];
   }

   /**
    * Restituisce la storia della CR:
    */
   public getHistory(): IRequestEnv[] {
      return this.env;
   }
}
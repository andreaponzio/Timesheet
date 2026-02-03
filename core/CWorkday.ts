/**
 * @author Andrea Ponzio
 * @version 1.0.0
 */
import CBase, {IBase, numericInterval, objectType} from "./CBase";
import {SqlGen} from "./CSqlGen";
import IField = SqlGen.IField;
import IOption = SqlGen.IOption;
import CSqlGen = SqlGen.CSqlGen;
import Sign = SqlGen.Sign;
import Option = SqlGen.Option;

export interface IWorkday extends IBase {
   activity: number;
   date: Date;
   hour: number;
   extrainfo: number;
   place: number;
   note: string;
   idgroup: number;
}
export interface IWorkdaySummarize {
   id: number;
   idgroup: number;
   date: Date;
   hour: number;
   activity: number;
}
export interface IWeekWorkday {
   start: Date;
   end: Date;
   id: string;
   data: IWorkday[];
}

export default class CWorkday extends CBase {
   /**
    * Proprietà protette.
    * @protected
    */
   protected _data: IWorkday;

   /**
    * Get & Set.
    */
   get activity(): number {
      return this._data.activity;
   }
   get date(): Date {
      return new Date(this._data.date);
   }
   get idGroup(): number {
      return this._data.idgroup;
   }
   get hour(): number {
      return this._data.hour;
   }
   get extrainfo(): number {
      return this._data.extrainfo;
   }
   get place(): number {
      return this._data.place;
   }
   get note(): string {
      return this._data.note;
   }
   set activity(value: number) {
      this._data.activity = value;
   }
   set date(value: Date) {
      this._data.date = value;
   }
   set idGroup(value: number) {
      this._data.idgroup = value;
   }
   set hour(value: number) {
      this._data.hour = value;
   }
   set place(value: number) {
      this._data.place = value;
   }
   set extrainfo(value: number) {
      this._data.extrainfo = value;
   }
   set note(value: string) {
      this._data.note = value;
   }

   /**
    * Se esiste già la data di consuntivazione, restituisce lo stesso idgroup,
    * altrimenti ne genera uno.
    * @private
    */
   private getIdgroup(): number {
      let result: number = 0;

      try {
         result = this._select(
            "workday",
            ["idgroup"],
            [{
               name: "date",
               value: [{
                  sign: Sign.INCLUDE,
                  option: Option.LIKE,
                  low: `${this.convertDate(this.date, 2)}%`
               }] as IOption[]
            }] as IField[])[0]["idgroup"] as number;
      }
      catch(e) {
         result = 0
      }

      return result;
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
      this._data.date = undefined;
      this._data.hour = undefined;
      this._data.extrainfo = undefined;
      this.place = undefined;
      this._data.note = undefined;
   }

   /**
    * Carica la consuntivazione con l'id specificata.
    * @param id identificativo.
    * @public
    */
   public load(id: number): void {
      this._data = (this._select("workday", CSqlGen.allField, [{
         name: "id",
         value: [{sign: Sign.INCLUDE, option: Option.EQUAL, low: id}] as IOption[]
      }] as IField[])[0]) as IWorkday;
   }

   /**
    * Effettua caricamento multiplo di consuntivazioni.
    * @param where condizione di filtro.
    * @public
    */
   public loadAll(where: IField[] = []): IWorkday[] {
      return this._select("workday", CSqlGen.allField, where) as IWorkday[];
   }

   /**
    * Aggiorna la consuntivazione in linea.
    * @public
    */
   public save(): void {
      try {
         if(this.id === 0) {
            super._save(numericInterval.workday);
            if(this.getIdgroup() === 0 || this.getIdgroup() === undefined)
               this.idGroup = this.getId(numericInterval.workday_group);
            else
               this.idGroup = this.getIdgroup();
            this._insert("workday",
               [
                  {
                     name: "activity",
                     value: [{sign: Sign.INCLUDE, option: Option.EQUAL, low: this.activity}] as IOption[]
                  },
                  {
                     name: "date",
                     value: [{sign: Sign.INCLUDE, option: Option.EQUAL, low: this.convertDate(this.date)}] as IOption[]
                  },
                  {
                     name: "idgroup",
                     value: [{sign: Sign.INCLUDE, option: Option.EQUAL, low: this.idGroup}] as IOption[]
                  },
                  {name: "hour", value: [{sign: Sign.INCLUDE, option: Option.EQUAL, low: this.hour}] as IOption[]},
                  {
                     name: "extrainfo",
                     value: [{sign: Sign.INCLUDE, option: Option.EQUAL, low: this.extrainfo}] as IOption[]
                  },
                  {name: "place", value: [{sign: Sign.INCLUDE, option: Option.EQUAL, low: this.place}] as IOption[]},
                  {name: "note", value: [{sign: Sign.INCLUDE, option: Option.EQUAL, low: this.note}] as IOption[]}
               ] as IField[]);
         }
         else {
            this._update("workday",
               [
                  {name: "hour", value: [{sign: Sign.INCLUDE, option: Option.EQUAL, low: this.hour}] as IOption[]},
                  {
                     name: "extrainfo",
                     value: [{sign: Sign.INCLUDE, option: Option.EQUAL, low: this.extrainfo}] as IOption[]
                  },
                  {name: "place", value: [{sign: Sign.INCLUDE, option: Option.EQUAL, low: this.place}] as IOption[]},
                  {name: "note", value: [{sign: Sign.INCLUDE, option: Option.EQUAL, low: this.note}] as IOption[]}
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
         this._delete("workday", [{
            name: "id",
            value: [{sign: Sign.INCLUDE, option: Option.EQUAL, low: this.id}] as IOption[]
         }] as IField[]);
   }

   /**
    * Restituisce la somma delle ore per data.
    * @public
    */
   public summarize(): IWorkdaySummarize[] {
      return this.executeAll("SELECT * FROM workday_summarize GROUP BY DATE(date) ORDER BY date DESC;") as IWorkdaySummarize[];
   }

   /**
    * Restituisce la lista delle consuntivazioni associate a un gruppo.
    * @param idgroup numero del gruppo.
    */
   public getGroupData(idgroup: number): IWorkdaySummarize[] {
      return this.executeAll(`SELECT *
                              FROM main.workday_group
                              WHERE idgroup = ${idgroup};`) as IWorkdaySummarize[];
   }

   /**
    * Permette di aggiornare i indici di ricerca.
    */
   public search(): void {
   }
}
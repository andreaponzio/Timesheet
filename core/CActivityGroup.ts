/**
 * @author Andrea Ponzio
 * @version 1.0.0
 */
import CBase, {IBase, numericInterval} from "./CBase";
import {SqlGen} from "./CSqlGen";
import IField = SqlGen.IField;
import Sign = SqlGen.Sign;
import IOption = SqlGen.IOption;
import Option = SqlGen.Option;
import CSqlGen = SqlGen.CSqlGen;
import {IActivitySummarize} from "./CActivity";

export interface IActivityGroupId {
   id: number;
   activity: number;
}
export interface IActivityGroup extends IBase {
   description: string;
   activity: IActivityGroupId[];
}
export interface IActivityGroupSummarize extends IBase {
   id: number;
   description: string;
   activity: number;
   hour: number;
}

export default class CActivityGroup extends CBase {
   /**
    * Proprietà protette.
    * @protected
    */
   protected _data: IActivityGroup;

   /**
    * Get & Set.
    */
   get description(): string {
      return this._data.description;
   }
   get activity(): IActivityGroupId[] {
      return this._data.activity;
   }
   set description(value: string) {
      this._data.description = value;
   }

   /**
    * Costruttore.
    */
   constructor() {
      super();
      this.clean();
   }

   /**
    * Restituisce l'indice dell'attività cercata.
    * @param activity identificativo attività.
    * @private
    */
   private activityIndex(activity: number): number {
      return this._data.activity.findIndex(
         element => element.id === this._data.id && element.activity === activity
      );
   }

   /**
    * Inizializza proprietà.
    */
   public clean(): void {
      super._clean();
      this.description = undefined;
      this._data.activity = [];
   }

   /**
    *
    * @param id identificativo.
    * @public
    */
   public load(id: string | number): void {
      if(typeof id === "number")
         this._data = (this._select("activity_group", CSqlGen.allField, [{
            name: "id",
            value: [{sign: Sign.INCLUDE, option: Option.EQUAL, low: id}] as IOption[]
         }] as IField[])[0]) as IActivityGroup;
      else if(typeof id === "string")
         this._data = (this._select("activity_group", CSqlGen.allField, [{
            name: "description",
            value: [{sign: Sign.INCLUDE, option: Option.EQUAL, low: id}] as IOption[]
         }] as IField[])[0]) as IActivityGroup;
      else
         throw new Error();

      if(this._data !== undefined)
         this._data.activity = this._select("activity_group_id", CSqlGen.allField, [{
            name: "id",
            value: [{sign: Sign.INCLUDE, option: Option.EQUAL, low: this.id}] as IOption[]
         }] as IField[]) as IActivityGroupId[];
   }

   /**
    *
    * @param where condizione di filtro.
    * @public
    */
   public loadAll(where: IField[] | string): IActivityGroup[] {
      if(typeof where === "string")
         return this._select("activity_group", CSqlGen.allField, [], where, true) as IActivityGroup[];
      else
         return this._select("activity_group", CSqlGen.allField, where) as IActivityGroup[];
   }

   /**
    *
    * @public
    */
   public save(): void {
      try {
         if(this.id === 0) {
            super._save(numericInterval.activitygroup);
            this._insert("activity_group",
               [{
                  name: "description",
                  value: [{sign: Sign.INCLUDE, option: Option.EQUAL, low: this.description}] as IOption[]
               }] as IField[]);
         }
         else {
            this._update("activity_group",
               [{
                  name: "description",
                  value: [{sign: Sign.INCLUDE, option: Option.EQUAL, low: this.description}] as IOption[]
               }] as IField[]);
            this._delete("activity_group_id", [{
               name: "id", value: [{sign: Sign.INCLUDE, option: Option.EQUAL, low: this.id}] as IOption[]
            }] as IField[]);
            this.activity.forEach((activity: IActivityGroupId) => {
               this._insert("activity_group_id",
                  [{
                     name: "id",
                     value: [{sign: Sign.INCLUDE, option: Option.EQUAL, low: this.id}] as IOption[]
                  }, {
                     name: "activity",
                     value: [{sign: Sign.INCLUDE, option: Option.EQUAL, low: activity.activity}] as IOption[]
                  }] as IField[]);
            });
         }

         // Aggiorna indice di ricerca:
         this.search();
      }
      catch
         (e) {
         throw e;
      }
   }

   /**
    *
    * @public
    */
   public delete(): void {
      if(this.id) {
         this._delete("activity_group", [{
            name: "id",
            value: [{sign: Sign.INCLUDE, option: Option.EQUAL, low: this.id}] as IOption[]
         }] as IField[]);
         this._delete("activity_group_id", [{
            name: "id", value: [{sign: Sign.INCLUDE, option: Option.EQUAL, low: this.id}] as IOption[]
         }] as IField[]);
      }
   }

   /**
    *
    * @public
    */
   public summarize(): IActivityGroupSummarize[] {
      return this.executeAll("SELECT * FROM main.group_list_summarize") as IActivityGroupSummarize[];
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
      this.executeRun(`INSERT INTO main.search (id, sequence, data, description, url, type)
                       VALUES (${this.id}, ${this.getId(numericInterval.search)}, '${this.description}',
                               '${this.description}', '/activitygroup/${this.id}', 5)`);
   }

   /**
    * Permette di aggiungere un'attività al gruppo.
    * @param activity identificativo dell'attività.
    */
   public addActivity(activity: number): void {
      if(this.activityIndex(activity) === -1)
         this._data.activity.push({id: this.id, activity: activity});
   }

   /**
    * Permette di eliminare un'attività da un gruppo.
    * @param activity identificativo dell'attività.
    */
   public delActivity(activity: number): void {
      if(this.activityIndex(activity) !== -1)
         this._data.activity.splice(this.activityIndex(activity), 1);
   }

   /**
    * Restituisce il numero di gruppo in cui l'attività è presente.
    * @param activity identificativo dell'attività.
    */
   public getActivityGroup(activity: number): number {
      return this._select("activity_group_id", ["id"], [{
         name: "activity",
         value: [{sign: Sign.INCLUDE, option: Option.EQUAL, low: activity}] as IOption[]
      }] as IField[])[0]["id"];
   }
}
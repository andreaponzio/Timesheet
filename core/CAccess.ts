/**
 * @author Andrea Ponzio
 * @version 1.0.0
 */
import CBase, {IBase, numericInterval, objectType} from "./CBase";
import {SqlGen} from "./CSqlGen";
import {IWbs} from "./CWbs";
import CSqlGen = SqlGen.CSqlGen;
import IField = SqlGen.IField;
import IOption = SqlGen.IOption;
import Sign = SqlGen.Sign;
import Option = SqlGen.Option;
import {IActivity} from "./CActivity";
import {IActivityGroup, IActivityGroupId} from "./CActivityGroup";

export interface IAccess extends IBase {
   id: number;
   valueid: number;
   description: string;
   value: string;
   secure: string;
}

export interface IAccessSummarize extends IBase {
}

export default class CAccess extends CBase {
   /**
    * Proprietà private.
    */
   private _customerid: number;

   /**
    * Proprietà protette.
    * @protected
    */
   protected _data: IAccess[];

   /**
    * Get & Set.
    */
   get customerid(): number {
      return this._customerid;
   }

   /**
    * Restituisce l'indice dell'elemento cercato.
    * @param valueid
    * @private
    */
   private valueIndex(valueid: number): number {
      return this._data.findIndex(
         element => element.valueid === valueid
      );
   }

   /**
    * Costruttore.
    */
   constructor(customerid: number) {
      super();
      this.clean();
      this.load(customerid);
      this._customerid = customerid;
   }

   /**
    * Inizializza proprietà.
    */
   public clean(): void {
      super._clean();
      this._customerid = 0;
      this._data = undefined;
   }

   /**
    * Legge i dati i valori per il cliente specificato.
    * @param customerid identificativo cliente.
    * @public
    */
   public load(customerid: number): void {
      this._clean();
      this._data = (this._select("access", CSqlGen.allField, [{
         name: "id",
         value: [{sign: Sign.INCLUDE, option: Option.EQUAL, low: customerid}] as IOption[]
      }] as IField[])) as IAccess[];
   }

   /**
    * Non usato.
    * @param where condizione di filtro.
    * @public
    */
   public loadAll(where: IField[] | string): IAccess[] {
      return [];
   }

   /**
    * Registra nella base dati i valori.
    * @public
    */
   public save(): void {
      // Per prima cosa vengono cancellati tutti i valori per semplificare il salvataggio:
      this.delete();

      // Vengono riscritti i valori:
      try {
         this._data.forEach(d => {
            if(d.valueid < 100000)
               d.valueid = this.getId(numericInterval.access);
            this._insert("access",
               [
                  {
                     name: "id",
                     value: [{sign: Sign.INCLUDE, option: Option.EQUAL, low: d.id}] as IOption[]
                  },
                  {
                     name: "valueid",
                     value: [{sign: Sign.INCLUDE, option: Option.EQUAL, low: d.valueid}] as IOption[]
                  },
                  {
                     name: "description",
                     value: [{sign: Sign.INCLUDE, option: Option.EQUAL, low: d.description}] as IOption[]
                  },
                  {
                     name: "value",
                     value: [{sign: Sign.INCLUDE, option: Option.EQUAL, low: d.value}] as IOption[]
                  },
                  {
                     name: "secure",
                     value: [{sign: Sign.INCLUDE, option: Option.EQUAL, low: d.secure}] as IOption[]
                  }
               ] as IField[], true);
         });
      }
      catch(e) {
         throw e;
      }
   }

   /**
    * Elimina tutti i valori per uno specifico cliente.
    * @public
    */
   public delete(): void {
      let customerid: number = 0;

      customerid = this._data[0].id;

      if(customerid !== undefined)
         this._delete("access", [
            {
               name: "id",
               value: [{sign: Sign.INCLUDE, option: Option.EQUAL, low: this._customerid}] as IOption[]
            }
         ] as IField[]);
   }

   /**
    * Non usato.
    * @public
    */
   public summarize(): IAccessSummarize[] {
      return [];
   }

   /**
    * Non usato.
    */
   public search(): void {
   }

   /**
    * Aggiunge un valore di accesso o ne kodifica uno.
    * @param valueid identificativo valore da aggiornare.
    * @param description descrizione del valore.
    * @param value valore del valore.
    * @param secure indica se il valore deve essere cryptato.
    */
   public add(valueid: number, description: string, value: string, secure: string = "0"): void {
      if(description.length) {
         if(valueid === 0) {
            this._data.push({
               id: this._customerid,
               valueid: this._data.length + 1,
               description: description,
               value: value,
               secure: secure,
            } as IAccess);
         }
         else {
            this._data[this.valueIndex(valueid)].description = description;
            this._data[this.valueIndex(valueid)].value = value;
            this._data[this.valueIndex(valueid)].secure = secure;
         }
      }
   }

   /**
    * Permette di eliminare un valore.
    * @param valueid
    */
   public del(valueid: number): void {
      if(this.valueIndex(valueid) !== -1)
         this._data.splice(this.valueIndex(valueid), 1);
   }

   /**
    * Restituisce il valore con l'id specificato.
    * @param valueid identificativo.
    * @public
    */
   public get(valueid: number): IAccess {
      return this._data[this.valueIndex(valueid)];
   }
}
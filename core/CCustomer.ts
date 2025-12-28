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

export interface ICustomer extends IBase {
   description: string;
}
export interface ICustomerSummarize {
   id: number;
   description: string;
   wbs: number;
}

export default class CCustomer extends CBase {
   /**
    * Proprietà protette.
    * @protected
    */
   protected _data: ICustomer;

   /**
    * Get & Set.
    */
   get description(): string {
      return this._data.description;
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
    * Inizializza proprietà.
    */
   public clean(): void {
      super._clean();
      this.description = undefined;
   }

   /**
    * Carica il cliente con l'identificativo specificato.
    * @param id identificativo.
    * @public
    */
   public load(id: string | number): void {
      if(typeof id === "number")
         this._data = (this._select("customer", CSqlGen.allField, [{
            name: "id",
            value: [{sign: Sign.INCLUDE, option: Option.EQUAL, low: id}] as IOption[]
         }] as IField[])[0]) as ICustomer;
      else if(typeof id === "string")
         this._data = (this._select("customer", CSqlGen.allField, [{
            name: "description",
            value: [{sign: Sign.INCLUDE, option: Option.EQUAL, low: id}] as IOption[]
         }] as IField[])[0]) as ICustomer;
      else
         throw new Error();
   }

   /**
    * Effettua caricamento multiplo di anagrafiche cliente.
    * @param where condizione di filtro.
    * @public
    */
   public loadAll(where: IField[] = []): ICustomer[] {
      return this._select("customer", CSqlGen.allField, where) as ICustomer[];
   }

   /**
    * Aggiorna l'anagrafica in linea.
    * @public
    */
   public save(): void {
      try {
         if(this.id === 0) {
            super._save(numericInterval.workday);
            this._insert("customer",
               [{
                  name: "description",
                  value: [{sign: Sign.INCLUDE, option: Option.EQUAL, low: this.description}] as IOption[]
               }] as IField[]);
         }
         else {
            this._update("customer",
               [{
                  name: "description",
                  value: [{sign: Sign.INCLUDE, option: Option.EQUAL, low: this.description}] as IOption[]
               }] as IField[]);
         }
      }
      catch
         (e) {
         throw e;
      }
   }

   /**
    * Elimina fisicamente l'anagrafica in linea.
    * @public
    */
   public delete(): void {
      if(this.id)
         this._delete("customer", [{
            name: "id",
            value: [{sign: Sign.INCLUDE, option: Option.EQUAL, low: this.id}] as IOption[]
         }] as IField[]);
   }

   /**
    * Restituisce una sintesi del cliente e del numero di commesse assegnate.
    * @public
    */
   public summarize(): ICustomerSummarize[] {
      return this.executeAll("SELECT * FROM customer_summarize;") as ICustomerSummarize[];
   }

   /**
    * Restituisce lista delle commesse associate al cliente.
    */
   public getWbs(): IWbs[] {
      return this.executeAll(`SELECT *
                              FROM main.wbs
                              WHERE customer = ${this.id};`) as IWbs[];
   }
}
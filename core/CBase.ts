/**
 * @author Andrea Ponzio
 * @version 1.0.0
 */
import CDatabase from "./CDatabase";
import {SqlGen} from "./CSqlGen";
import CSqlGen = SqlGen.CSqlGen;
import IField = SqlGen.IField;
import IOption = SqlGen.IOption;
import Sign = SqlGen.Sign;
import Option = SqlGen.Option;

export enum objectType {
   customer_list = 1,
   wbs_list,
   activity_list,
   request_list,
   workday_list,

   customer_details,
   wbs_details,
   activity_details,
   request_details,
   workday_details,

   customer_create,
   wbs_create,
   activity_create,
   request_create,
   workday_create,

   workday_group
}

export enum activityType {
   change_request = 1,
   ams,
   other,
   internal
}

export enum activityStatus {
   open = 1,
   wip,
   test,
   closed,
   cancelled
}

export enum changeRequestType {
   customizing = 1,
   workbench,
   other
}

export enum systemType {
   developer = 1,
   quality,
   nrt,
   production
}

export enum numericInterval {
   customer = "CUSTOMER",
   wbs = "WBS",
   activity = "ACTVITY",
   workday = "WORKDAY",
   change_request = "REQUEST",
   workday_group = "WORKDAYGRP"
}

export enum extraInfo {
   normale = 0,
   reperibilita,
   ferie,
   attivitaExtra,
   permessi
}

export interface IBase {
   id: number;
   changed_on: Date;
}

export default abstract class CBase extends CDatabase {
   /**
    * Proprietà astratte.
    */
   protected abstract _data: any;

   /**
    * Proprietà protette.
    */
   protected sqlGen: CSqlGen;

   /**
    * Metodi astratti.
    */
   public abstract clean(): void;
   public abstract load(id: string | number | Date): void;
   public abstract loadAll(where: IField[]): unknown[];
   public abstract save(): void;
   public abstract delete(): void;
   public abstract index(create: boolean): void;
   public abstract summarize(): unknown[];

   /**
    * Get & Set.
    */
   get id(): number {
      return this._data.id;
   }
   get changed_on(): Date {
      return this._data.changed_on;
   }
   get data(): any {
      return this._data;
   }

   /**
    * Costruttore.
    */
   protected constructor() {
      super();
      this.sqlGen = new CSqlGen();
   }

   /**
    * Inizializza proprietà.
    */
   protected _clean(): void {
      this._data = {
         id: 0,
         changed_on: null
      };
   }

   /**
    * Valorizza proprietà comuni.
    * @param key chiave per la generazione di un identificativo.
    * @protected
    */
   protected _save(key: string): void {
      if(this._data.id === null || this._data.id === 0)
         this._data.id = this.getId(key);
      if(this._data.changed_on === null)
         this._data.changed_on = new Date();
   }

   /**
    * Esegue l'istruzione SELECT.
    * @param tablename nome della tabella.
    * @param output campi da esportare.
    * @param condition condizione di selezione.
    * @protected
    */
   protected _select(tablename: string, output: string[] = CSqlGen.allField, condition: IField[] = []): unknown[] {
      this.sqlGen.select("main." + tablename, output, condition);
      return this.executeAll(this.sqlGen.statement);
   }

   /**
    * Esegue istruzione INSERT.
    * @param tablename nome dalla tabella.
    * @param values lista campi-valore.
    * @param noid non aggiunge campo ID e CHANGED_ON.
    * @protected
    */
   protected _insert(tablename: string, values: IField[], noid: boolean = false): unknown {
      // Se richiesto viene aggiunto il tag sia per l'ID sia per la data di ultima modifica:
      if(!noid) {
         values.unshift({
            name: "id",
            value: [{sign: Sign.INCLUDE, option: Option.EQUAL, low: this.id}] as IOption[]
         } as IField);

         values.push({
            name: "changed_on",
            value: [{sign: Sign.INCLUDE, option: Option.EQUAL, low: this.getDatetime()}] as IOption[]
         } as IField);
      }

      // Genera ed esegue istruzione INSERT:
      this.sqlGen.insert("main." + tablename, values);
      return this.executeRun(this.sqlGen.statement);
   }

   /**
    * Esegue istruzione UPDATE.
    * @param tablename nome dalla tabella.
    * @param values lista campi-valore.
    * @param condition condizione di aggiornamento.
    * @protected
    */
   protected _update(tablename: string, values: IField[], condition: IField[] = []): unknown {
      // Aggiunge data ultima modifica:
      values.push({
         name: "changed_on",
         value: [{sign: Sign.INCLUDE, option: Option.EQUAL, low: this.getDatetime()}] as IOption[]
      } as IField);

      // Aggiunge condizione:
      if(!condition.length)
         condition.push({
            name: "id",
            value: [{sign: Sign.INCLUDE, option: Option.EQUAL, low: this.id}] as IOption[]
         } as IField);

      // Genera ed esegue istruzione UPDATE:
      this.sqlGen.update("main." + tablename, values, condition);
      return this.executeRun(this.sqlGen.statement);
   }

   /**
    * Esegue istruzione DELETE.
    * @param tablename nome dalla tabella.
    * @param condition condizione per selezione record.
    * @protected
    */
   protected _delete(tablename: string, condition: IField[] = []): unknown {
      this.sqlGen.delete("main." + tablename, condition);
      return this.executeRun(this.sqlGen.statement);
   }
}
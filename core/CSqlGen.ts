/**
 * @author Andrea Ponzio
 * @version 1.0.0
 */
export namespace SqlGen {

   /**
    * Enumerazioni.
    */
   export enum Option {
      BETWEEN = 'BT',
      CONTAINS_PATTERN = 'CP',
      EQUAL = '=',
      GREATER = '>',
      GREATER_EQUAL = '>=',
      LESS = '<',
      LESS_EQUAL = '=<',
      NOT_BETWEEN = 'NB',
      NOT_CONTAINS_PATTERN = 'NP',
      NOT_EQUAL = '<>',
      LIKE = 'LIKE'
   }
   export enum Sign {
      EXCLUDE = 'E',
      INCLUDE = 'I'
   }
   export enum Operator {
      AND = "AND",
      OR = "OR"
   }

   /**
    * Interfacce.
    */
   export interface IOption {
      sign: Sign;
      option: Option;
      low: string | number;
      high?: string | number;
   }
   export interface IField {
      name?: string;
      operator?: Operator;
      value?: IOption[];
   }

   /**
    * Classe di generazione SQL.
    */
   export class CSqlGen {
      /**
       * Proprietà private.
       */
      private _statement: string;

      /**
       * Proprietà pubbliche.
       */
      public static readonly allField: string[] = ["*"];

      /**
       * Get & Set.
       */
      get statement(): string {
         return this._statement;
      }

      /**
       * Costruisce la condizione di WHERE in base ai campi passati.
       * @param field lista campo-valore per la condizione di filtro.
       * @param semicolon aggiunge o non aggiunte punto e virgola finale;
       * @return condizione WHERE.
       * @private
       */
      private _generateWhere(field: IField[], semicolon: boolean = true): string {
         let conditionPart1: string;
         let conditionPart2: string;
         let result: string = "";
         let last: number;

         // Costruisce condizione di WHERE. Ogni campo sarà racchiuso tra parentesi tonde:
         field.forEach(f => {
            conditionPart1 = "";
            conditionPart2 = "";
            last = 0;

            // Aggiunge operatore tra le condizioni:
            if(f.operator)
               result += ` ${f.operator} `;

            // Prepara condizione:
            else {
               f.value.forEach(c => {
                  last++;

                  // Converte le stringhe aggiungendo gli apici (tranne quando si tratta di CP o NP perchè
                  // l'asterisco va inserito all'interno):
                  if(c.option !== Option.CONTAINS_PATTERN && c.option !== Option.NOT_CONTAINS_PATTERN) {
                     if(typeof c.low === "string")
                        c.low = `'${c.low}'`;
                     if(typeof c.high === "string")
                        c.high = `'${c.high}'`;
                  }

                  // Compone operatore e valori:
                  switch(c.option) {
                     case Option.BETWEEN:
                        conditionPart1 = `${f.name} BETWEEN ${c.low} AND ${c.high}`;
                        break;

                     case Option.CONTAINS_PATTERN:
                        conditionPart1 = `${f.name} LIKE ${(typeof c.low === "string" ? "'%" + c.low + "%'" : "%" + c.low + "%")}`;
                        break;

                     case Option.EQUAL:
                        conditionPart1 = `${f.name} = ${c.low}`;
                        break;

                     case Option.GREATER:
                        conditionPart1 = `${f.name} > ${c.low}`;
                        break;

                     case Option.GREATER_EQUAL:
                        conditionPart1 = `${f.name} => ${c.low}`;
                        break;

                     case Option.LESS:
                        conditionPart1 = `${f.name} < ${c.low}`;
                        break;

                     case Option.LESS_EQUAL:
                        conditionPart1 = `${f.name} =< ${c.low}`;
                        break;

                     case Option.NOT_BETWEEN:
                        conditionPart1 = `NOT ${f.name} BETWEEN ${c.low} AND ${c.high}`;
                        break;

                     case Option.NOT_CONTAINS_PATTERN:
                        conditionPart1 = `NOT ${f.name} LIKE *${c.low}*`;
                        break;

                     case Option.NOT_EQUAL:
                        conditionPart1 = `${f.name} <> ${c.low}`;
                        break;

                     case Option.LIKE:
                        conditionPart1 = `${f.name} LIKE ${c.low}`;
                        break;

                     default:
                        throw new Error();
                  }

                  // Aggiunge operatore logico solo se non si tratta dell'ultimo elemento:
                  if(last !== f.value.length) {
                     if(f.operator)
                        conditionPart1 += ` ${f.operator} `;
                     else
                        conditionPart1 += ` ${Operator.OR} `;
                  }

                  // Aggiunge condizione all'istruzione:
                  conditionPart2 += `${conditionPart1}`;
               });

               // Aggiunge condizione:
               result += `(${conditionPart2})`;
            }
         });

         // Se non viene passata nessuna condizione, per semplicità viene impostata
         // come sempre vera:
         if(!result.length)
            result = "1 = 1";

         // Elimina spazi superflui all'inizio e fine dell'istruzione:
         if(semicolon)
            return `${result.trim()};`;
         else
            return `${result.trim()}`;
      }

      /**
       * Costruisce i'istruzione SET campo-valore.
       * @param field lista campi-valore.
       * @return stringa per istruzione SET.
       * @private
       */
      private _generateSet(field: IField[]): string {
         let condition: string = "";
         let result: string = "";
         let last: number = 0;

         // Costruisce condizione di WHERE. Ogni campo sarà racchiuso tra parentesi tonde:
         field.forEach(f => {

            // Elabora solo il primo valore presente nella lista:
            f.value.forEach(c => {
               last++;

               // Converte le stringhe aggiungendo gli apici:
               if(typeof c.low === "string")
                  c.low = `'${c.low}'`;

               // Costruisce campo-valore da aggiornare:
               if(c.option === Option.EQUAL)
                  result += `${f.name} = ${c.low}`;
               else
                  throw Error();
               return;
            });

            // Aggiunge separatore tra i campi-valore da aggiornare:
            if(last < field.length)
               result += ", ";
         });

         // Elimina spazi superflui all'inizio e fine dell'istruzione:
         return result.trim();
      }

      /**
       * Genera lista campi per l'istruzione INSERT.
       * @param field lista campi-valore.
       * @private
       */
      private _generateFields(field: IField[]): string {
         let result: string = "";
         let last: number = 1;

         field.forEach(f => {
            result += f.name;
            if(last < field.length)
               result += ",";
            last++;
         });

         return result;
      }

      /**
       * Genera la condizione VALUES per l'istruzione INSERT.
       * @param field lista campi-valore.
       * @private
       */
      private _generateValues(field: IField[]): string {
         let result: string = "";
         let last: number = 1;

         field.forEach(f => {
            f.value.forEach(v => {
               if(typeof v.low === "string")
                  result += `'${v.low}'`;
               else
                  result += `${v.low}`;
               return;
            });
            if(last != field.length)
               result += ",";
            last++;
         });

         return result;
      }

      /**
       * Genera l'istruzione SELECT.
       * @param tablename nome della tabella sorgente.
       * @param output campi da esportare.
       * @param condition condizione da applicare alla selezione.
       * @param extension aggiunta all'istruzione SQL generata.
       */
      public select(tablename: string, output: string[] = CSqlGen.allField, condition: IField[] = [], extension: string = ""): void {
         this._statement = `SELECT ${output.join(", ")}
                            FROM ${tablename}
                            WHERE ${this._generateWhere(condition, extension.length === 0)}`;
         if(extension.length > 0)
            this._statement = `${this._statement} ${extension};`;
      }

      /**
       * Genera l'istruzione INSERT.
       * @param tablename nome della tabella.
       * @param value lista dei valori.
       */
      public insert(tablename: string, value: IField[]): void {
         let values = this._generateValues(value);
         this._statement = `INSERT INTO ${tablename} (${this._generateFields(value)})
                            VALUES (${this._generateValues(value)});`;
      }

      /**
       * Genera l'istruzione UPDATE.
       * @param tablename nome della tabella sorgente.
       * @param value campi-valore per la parte SET.
       * @param condition condizione di aggiornamento.
       */
      public update(tablename: string, value: IField[], condition: IField[] = []): void {
         this._statement = `UPDATE ${tablename}
                            SET ${this._generateSet(value)}
                            WHERE ${this._generateWhere(condition)}`;
      }

      /**
       * Genera l'istruzione DELETE.
       * @param tablename  nome della tabella sorgente.
       * @param condition condizione di cancellazione.
       */
      public delete(tablename: string, condition: IField[] = []): void {
         this._statement = `DELETE
                            FROM ${tablename}
                            WHERE ${this._generateWhere(condition)}`;
      }
   }
}
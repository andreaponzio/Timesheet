/**
 * @author Andrea Ponzio
 * @version 1.0.0
 */
import {DatabaseSync, StatementResultingChanges, StatementSync} from "node:sqlite";
import {filename} from "../public/config.json";

export default class CDatabase {
   /**
    * Proprietà private.
    */
   private static _db: DatabaseSync;
   private static _statement: StatementSync;
   private static _result: StatementResultingChanges;

   /**
    * Inizializza la struttura dei risultati di un'esecuzione SQL.
    * @private
    */
   private cleanResult(): void {
      CDatabase._result = {
         changes: 0,
         lastInsertRowid: 0
      };
   }

   /**
    * Get & Set.
    */
   get result(): StatementResultingChanges {
      return CDatabase._result;
   }

   /**
    * Costruttore.
    */
   constructor() {
      if(!filename)
         throw new Error();

      if(CDatabase._db == undefined) {
         CDatabase._db = new DatabaseSync(filename);
         CDatabase._statement = null;
         CDatabase._result = null;
      }
   }

   /**
    * Chiude la connessione con la base dati.
    * @protected
    */
   protected close(): void {
      if(CDatabase._db !== undefined) {
         CDatabase._db.close();
         CDatabase._db = null;
         CDatabase._statement = null;
         CDatabase._result = null;
      }
   }

   /**
    * Genera un identificativo numerico.
    * @protected
    * @return identificativo numerico.
    */
   public getId(key: string): number {
      let id: number = 0;

      // Legge ultimo identificativo:
      CDatabase._statement = CDatabase._db.prepare(
         `SELECT last_number
          FROM numberid
          WHERE id = '${key}';`
      );
      id = CDatabase._statement.get()["last_number"] as number;

      // Calcola successivo:
      id++;

      // Aggiorna tabella:
      CDatabase._statement = CDatabase._db.prepare(
         `UPDATE numberid
          SET last_number = ${id}
          WHERE id = '${key}';`
      );
      CDatabase._result = CDatabase._statement.run();

      // Restituisce identificativo:
      return id;
   }

   /**
    * Restituisce data e ora generate dq SQLITE.
    * @protected
    */
   public getDatetime(): string {
      CDatabase._statement = CDatabase._db.prepare("SELECT datetime(CURRENT_TIMESTAMP, 'localtime') as datetime;");
      return (CDatabase._statement.get())["datetime"] as string;
   }

   /**
    * Converte l'oggetto Date nel formato SQLite.
    * I valore del campo NOTIME sono:
    * - 0 = data completa di orario;
    * - 1 = data con orario azzerato;
    * - 2 = solo data senza orario;
    * - 3 = formato per la valorizzazione del controllo HTML;
    * @param date data da convertire.
    * @param notime imposta l'ora a "00:00:00".
    * @return data nel formato SQLite.
    */
   public convertDate(date: Date, notime: number = 0): string {
      let year: string;
      let month: string;
      let day: string;
      let hour: string;
      let minute: string;
      let second: string;
      let result: string = "";

      try {
         year = date.getFullYear().toString().padStart(2, "0");
         month = (date.getMonth() + 1).toString().padStart(2, "0");
         day = date.getDate().toString().padStart(2, "0");
         switch(notime) {
            case 0:
               hour = date.getHours().toString().padStart(2, "0");
               minute = date.getMinutes().toString().padStart(2, "0");
               second = date.getSeconds().toString().padStart(2, "0");
               result = `${year}-${month}-${day} ${hour}:${minute}:${second}`;
               break;

            case 1:
               hour = "00";
               minute = "00";
               second = "00";
               result = `${year}-${month}-${day} ${hour}:${minute}:${second}`;
               break;

            case 2:
               result = `${year}-${month}-${day}`;
               break;

            case 3:
               hour = date.getHours().toString().padStart(2, "0");
               minute = date.getMinutes().toString().padStart(2, "0");
               second = date.getSeconds().toString().padStart(2, "0");
               result = `${year}-${month}-${day}T${hour}:${minute}:${second}.000`;
               break;
         }

         return result;
      }
      catch(e) {
         throw e;
      }
   }

   /**
    * Esegue l'istruzione SQL che restituisce solo lo stato dell'operazione.
    * @param statement istruzione SQL.
    * @public
    */
   public executeRun(statement: string): void {
      CDatabase._statement = CDatabase._db.prepare(statement);
      CDatabase._result = CDatabase._statement.run();
   }

   /**
    * Esegue l'istruzione SQL che restituisce un solo record.
    * @param statement istruzione SQL.
    * @public
    */
   public executeGet(statement: string): unknown {
      CDatabase._statement = CDatabase._db.prepare(statement);
      return CDatabase._statement.get();
   }

   /**
    * Esegue l'istruzione SQL che restituisce un solo record.
    * @param statement istruzione SQL.
    * @public
    */
   public executeAll(statement: string): unknown[] {
      CDatabase._statement = CDatabase._db.prepare(statement);
      return CDatabase._statement.all();
   }
}
/**
 * @author Andrea Ponzio
 * @version 1.0.0
 */
import {Request} from "express";

export default class COData {
   /**
    * Scompone il dato IS_PAGING in arrivo dalla chiamata esterna.
    * @public
    * @static
    * @param request express.Request
    * @return istruzione LIMIT.
    */
   public static limit(request: Request): string {
      let result: string;
      let top: number;
      let skip: number;

      // Prepara l'istruzione LIMIT:
      top = parseInt(request.body["paging"]["top"]);
      skip = parseInt(request.body["paging"]["skip"]);
      if(top === 0)
         top = -1;
      if(skip === 0)
         skip = -1;

      // Prepara l'istruzione LIMIT:
      result = `LIMIT ${top} OFFSET ${skip}`;

      // Risultato:
      return result;
   }

   /**
    * Compone l'istruzione WHERE usando la stringa IV_FILTER_STRING.
    * @public
    * @static
    * @param request express.Request
    * @return istruzione WHERE.
    */
   public static whereEntitySet(request: Request): string {
      let where: string;

      // Compone l'istruzione WHERE effettuando al sostituzione degli operatori logici:
      // Condizione di filtro:
      where = request.body["filter"];
      where = where.split(" eq ").join(" = ");
      where = where.split(" ne ").join(" <> ");
      where = where.split(" gt ").join(" > ");
      where = where.split(" ge ").join(" >= ");
      where = where.split(" lt ").join(" < ");
      where = where.split(" le ").join(" =< ");

      // Risultato:
      return where === undefined ? "" : where;
   }

   /**
    * Compone l'istruzione WHERE usando la tabella IT_KEY_TAB.
    * @public
    * @static
    * @param request express.Request
    * @return istruzione WHERE.
    */
   public static whereEntity(request: Request): string {
      let where: string;

      // Compone l'istruzione WHERE effettuando al sostituzione degli operatori logici:
      // Condizione di filtro:
      try {
         where = `id = ${request.body["key"][0]["value"]}`;
      }
      catch(e) {
      }

      // Risultato:
      return where === undefined ? "" : where;
   }

   /**
    * Sostituisce i comandi speciali SAP OData con istruzioni compatibili.
    * @public
    * @static
    * @return istruzione di WHERE compatibile.
    * @param where
    */
   public static specialStatement(where: string): string {
      let operandPart: string[];
      let original: string;
      let operand: string;
      let value: string;
      let field: string;
      let result: string;
      let start: number;
      let end: number;

      // Copia l'istruzione WHERE:
      result = where;

      // Sostituisce tutti i comandi speciali:
      while(true) {

         // Verifica quale comando speciale è presente:
         if(result.includes("substringof")) {

            // Determina la posizione di partenza del comando speciale:
            start = new RegExp("substringof").exec(result).index;

            // Cerca la prima parentesi chiusa a partire dall'inizio del comando:
            end = result.indexOf(")", start);

            // L'intera istruzione del comando speciale viene mantenuta così da poter essere usata
            // per la sostituzione finale (l'ultima parentesi del comando viene mantenuta così da mantenere
            // la corrispondenza con la parentesi di apertura del comando):
            original = result.substring(start, end - 1);

            // Estrae gli operatori del comando:
            operand = result.substring(start + 14, end - 1);

            // Scompone il valore ed il nome del campo:
            operandPart = operand.split(",");

            // Valorizza valore e nome del campo (elimina anche gli spazi superflui):
            value = operandPart[0].trim();
            field = operandPart[1].trim();

            // Prepara l'operatore LIKE aggiungendo il carattere %:
            if(value.includes("'"))
               value = `'%${value.substring(1, value.length - 1)}%'`;

            // Sostituisce la parte originale con quella appena creata:
            result = result.replace(original, field + " LIKE " + value);
         }
         else
            break;
      }

      // Risultato:
      return result;
   }

   /**
    * Scompone i dati IT_ORDER così da generare l'istruzione ORDER BY.
    * @public
    * @static
    * @param request express.Request
    * @return istruzione ORDER BY.
    */
   public static orderBy(request: Request): string {
      let property: Object[];
      let result: string;

      // Copia la lista degli elementi di ordinamento in un array:
      property = request.body["order"];

      // Concatena le single proprietà nella stringa finale:
      for(let p of property) {
         if(!result.length)
            result = "ORDER BY ";
         result += `${p["property"]} ${p["order"]}`;
      }

      // Risultato:
      return result === undefined ? "" : result;
   }

   /**
    * Compone la condizioni di WHERE quando siamo all'interno di un'Associazione OData.
    * Questo metodo gestisce un solo livello.
    * @public
    * @static
    * @param request request express.Request.
    */
   public static whereAssociation(request: Request): string {
      let entityName: string;
      let sourceName: string;
      let ownerKey: number;
      let childKey: number;
      let where: string;

      // Ottiene il nome dell'entità insieme al nome del padre:
      entityName = request.body["entity_name"];
      sourceName = request.body["source_name"];
      if(sourceName.toLowerCase() !== entityName.toLowerCase()) {
         ownerKey = request.body["key"][0];
         childKey = request.body["navigation_path"][0]["key_tab"][0];

         // Associazione Customer/Wbs:
         if(request.url === "/wbs") {
            if(ownerKey && !childKey)
               where = `customer = ${ownerKey["value"]}`;
            else
               where = `id = ${childKey["value"]} AND customer = ${ownerKey["value"]}`;
         }

         // Associazione Wbs/Activity:
         else if(request.url === "/activity") {
            if(ownerKey && !childKey)
               where = `wbs = ${ownerKey["value"]}`;
            else
               where = `id = ${childKey["value"]} AND wbs = ${ownerKey["value"]}`;
         }

         // Associazione Activity/Workday:
         else if(request.url === "/workday") {
            if(ownerKey && !childKey)
               where = `activity = ${ownerKey["value"]}`;
            else
               where = `id = ${childKey["value"]} AND activity = ${ownerKey["value"]}`;
         }
      }

      // Risultato:
      return where === undefined ? "" : where;
   }
}
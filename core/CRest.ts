/**
 * @author Andrea Ponzio
 * @version 1.0.0
 */

import {isBooleanObject} from "node:util/types";
/**
 * Classe di gestione interazione REST.
 */
export default class CRest {
   /**
    * Proprietà private.
    */
   private readonly _url: string;
   private readonly _method: string;

   /**
    * Restituisce un'istanza della classe CRest.
    * @param url URL ricevuto dalla chiamata.
    * @param method metodo della chiamata.
    * @static
    */
   public static make(url: string, method: string): CRest {
      return new CRest(url, method);
   }

   /**
    * Analizza l'URL.
    * @private
    */
   private parse(): string[] {
      let listToken: string[] = [];
      let token: string = "";

      // Analizza singoli caratteri per costruire i singoli token:
      for(let c of [...this._url]) {
         if(c === "/") {
            if(token.length) {
               listToken.push(token);
               token = "";
            }
         }
         else if(c === "(" || c === ")" || c === "$" || c === "=") {
            if(token.length)
               listToken.push(token);
            token = "";
         }
         else if(c === "'")
            continue;
         else
            token += c;
      }

      // Aggiunge l'ultimo token:
      if(token.length)
         listToken.push(token);

      // Restituisce i token;
      return listToken;
   }

   private customer(token: string[]): void {
   }

   /**
    * Costruttore.
    */
   constructor(url: string, method: string) {
      this._url = url;
      this._method = method.toLowerCase();
   }

   /**
    * Permette di analizzare che l?URl sia relativo al servizio REST così
    * da rispondere alle chiamate esterne. L'URL dovrebbe avere la seguente forma:
    * - /rest/<entity>[(<id>][$top=n][$skip=n][$limit=n];
    * @return boolean se FALSE significa che non è un REST e quindi reindirizza.
    */
   public process(): boolean {
      let listToken: string[];
      let result: boolean = true;

      console.log(this._url);

      // Scompone l'URL in token:
      listToken = this.parse();

      // Gestisce eccezioni:
      try {

         // Il primo elemento deve essere la stringa REST:
         if(listToken[0].toUpperCase() !== "REST")
            result = false;

         // Il secondo elemento deve essere un'entità conosciuta:
         if(result) {
            switch(listToken[1].toLowerCase()) {
               case "customer":
                  this.customer(listToken);
                  break;

               case "wbs":
               case "activity":
               case "workday":
               case "request":
               case "search":
                  break;

               default:
                  result = false;
            }
         }
      }
      catch(error) {
         result = false;
      }

      // Restituisce esito:
      return result;
   }
}
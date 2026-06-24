/**
 * @author Andrea Ponzio
 * @version 1.0.0
 */
import {Request} from "express";

export interface IOData {
   entity: string;
   key: string;
   expand: string;
}

export default class COData {
   /**
    * Proprietà private.
    */
   private readonly _query: Map<string, string>;
   private readonly _entity: string[];
   private readonly _originalUrl: string;

   /**
    * Scompone l'URL originale per determinare la prima Entity con il suo
    * eventuale filtro.
    */
   private mainEntity(): string[] {
      let listToken: string[] = [];
      let token: string = "";
      let offset: number = 0;
      let c: string;

      while(this._originalUrl.charAt(offset) !== "?") {
         c = this._originalUrl.charAt(offset);
         switch(c) {
            case ')':
            case "(":
               if(token) {
                  listToken.push(token);
                  token = "";
               }
               listToken.push(c);
               break;

            case "/":
               if(token) {
                  listToken.push(token);
                  token = "";
               }
               listToken.push(c);
               break;

            case "?":
               if(token) {
                  listToken.push(token);
                  token = "";
               }
               break;

            default:
               token += c;
         }
         offset++;
      }

      // Aggiunge ultimo token:
      if(token)
         listToken.push(token);

      // Restituisce la lista dei token:
      return listToken;
   }

   /**
    * Costruttore.
    */
   constructor(request: Request) {
      this._query = new Map<string, string>();
      this._entity = [];

      // Memorizza URL:
      this._originalUrl = request.originalUrl;

      // Scompone l'URl original per determinare la prima entità:
      this._entity = this.mainEntity();

      // Crea una mappa dei parametri presenti nell'URL:
      for(let key in request.query)
         this._query.set(key, request.query[key] as string);

      // Analizza parametri presenti nell'URL:
      this._query.forEach((value, key) => {
         console.log(key, value);
      });

      console.log(this._entity);
   }
}
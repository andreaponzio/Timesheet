/**
 * @author Andrea Ponzio
 * @version 1.0.0
 */
import {StatusCodes} from 'http-status-codes';
import CCustomer from "./CCustomer";

export interface IRest {
   httpStatus: number;
   data: object[];
}
interface IOption {
   name: string;
   value: string;
}
interface IService {
   name: string;
   id: number;
   data: object;
   option: IOption[]
}

/**
 * Classe di gestione interazione REST.
 */
export default class CRest {
   /**
    * Proprietà private.
    */
   private readonly _url: string;
   private readonly _method: string;
   private _rest: IRest;
   private _service: IService;

   /**
    * Restituisce un'istanza della classe CRest.
    * @param url URL ricevuto dalla chiamata.
    * @param method metodo della chiamata.
    * @param data corpo della chiamata con metodo POST.
    * @static
    */
   public static make(url: string, method: string, data: object): CRest {
      return new CRest(url, method, data);
   }

   /**
    * Inizializza la struttura del servizio da richiamare.
    * @private
    */
   private clean(): void {
      // Inizializza il servizio:
      this._rest = {
         httpStatus: StatusCodes.OK,
         data: []
      };
      this._service = {
         name: "",
         id: 0,
         data: {},
         option: [] as IOption[]
      }
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

   /**
    * Verifica che l'entità sia una di quella valide.
    * @return TRUE se valida, altrimenti FALSE.
    * @private
    */
   private validName(): boolean {
      switch(this._service.name) {
         case "customer":
         case "wbs":
         case "activity":
         case "workday":
         case "search":
            return true;

         default:
            return false;
      }
   }

   /**
    * Restituisce l'identificativo dell'oggetto passato alla chiamata. Se si tratta
    * di una delle parole chiave, allora restituisce zero.
    * @param token token in posizione 2 (identificativo).
    * @return indentificativo oppure zero.
    * @private
    */
   private getId(token: string): number {
      switch(token) {
         case "top":
         case "skip":
         case "limit":
         case "filter":
            return 0;

         default:
            return token === undefined ? 0 : parseInt(token);
      }
   }

   /**
    * Prepara la lista delle opzioni presenti nella chiamata.
    * @param token lista dei token ricevuti.
    * @return lista di opzioni.
    * @private
    */
   private getOption(token: string[]): IOption[] {
      let option: IOption[] = [];
      let index = 0;

      // Analizza le opzioni:
      do {
         if(index > 1) {
            switch(token[index]) {
               case "top":
               case "skip":
               case "limit":
                  option.push({
                     name: token[index],
                     value: token[index + 1]
                  });
                  index++;
                  break;

               case "filter":
                  break;
            }
         }
         index++;
      } while(token[index] !== undefined);

      // restituisce opzioni:
      return option;
   }

   /**
    * Accede alla tabella dei customer.
    * @return lista oggetti Json.
    * @private
    */
   private customer(): object[] {
      let o: CCustomer;
      let data: object[] = [];

      o = new CCustomer();

      // Gestisce il metodo:
      switch(this._method) {
         case "get":
            if(this._service.id !== 0) {
               o.load(this._service.id);
               data.push(o.data);
            }
            else {
               data = o.loadAll();
            }
            break;

         case "post":
            o.clean()
            o.description = this._service.data["description"];
            o.save();
            data.push({
               id: o.id
            });
            break;

         case "delete":
            o.load(this._service.id);
            o.delete();
            break;
      }

      // Rilascia risorse:
      o = undefined;

      // Restituisce oggetto:
      return data;
   }

   /**
    * Costruttore.
    */
   constructor(url: string, method: string, data: object) {
      this._url = url;
      this._method = method.toLowerCase();
      this.clean();
      this._service.data = data;
   }

   /**
    * Permette di analizzare che l?URl sia relativo al servizio REST così
    * da rispondere alle chiamate esterne. L'URL dovrebbe avere la seguente forma:
    * - /rest/<entity>[(<id>][$top=n][$skip=n][$limit=n];
    * @return boolean se FALSE significa che non è un REST e quindi reindirizza.
    */
   public process(): IRest {
      let token: string[];

      // Scompone l'URL in una lista di token e prepara il servizio da richiamare:
      try {
         token = this.parse();
         this._service.name = token[1];
         this._service.id = this.getId(token[2]);
         this._service.option = this.getOption(token);
         if(!this.validName())
            this._rest.httpStatus = StatusCodes.SERVICE_UNAVAILABLE;
         else {
            switch(this._service.name) {
               case "customer":
                  this._rest.data = this.customer();
                  break;

               case "wbs":
               case "activity":
               case "workday":
               case "search":
                  break;
            }

            // Verifica risultato:
            if(this._rest.data === undefined || Object.keys(this._rest.data).length === 0)
               this._rest.httpStatus = StatusCodes.NO_CONTENT;
         }
      }
      catch(err) {
         this._rest.httpStatus = StatusCodes.BAD_REQUEST
      }

      // restituisce esito della richiesta come codice HTTP:
      return this._rest;
   }
}
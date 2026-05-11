/**
 * @author Andrea Ponzio
 * @version 1.0.0
 */
import CDatabase from "./CDatabase";
import {StatusCodes} from 'http-status-codes';
import CCustomer from "./CCustomer";
import CWbs from "./CWbs";
import CActivity from "./CActivity";
import CWorkday from "./CWorkday";

export interface IRest {
   httpStatus: number;
   data: object[];
   error: string;
}
interface IOption {
   name: string;
   value: string;
}
interface IService {
   name: string;
   id: number;
   data: object;
   option: IOption[];
}

/**
 * Classe di gestione interazione REST.
 */
export default class CRest extends CDatabase {
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
         data: [],
         error: ""
      };
      this._service = {
         name: "",
         id: 0,
         data: {},
         option: [] as IOption[]
      };
   }

   /**
    * Analizza l'URL.
    * @private
    */
   private parse(): string[] {
      let listToken: string[] = [];
      let token: string = "";

      // Viene esaminato un carattere alla volta per comporre i singoli token quando viene
      // incontrato un carattere speciale:
      for(let c of [...this._url]) {

         // Carattere di seprazione tra
         if(c === "/") {
            if(token.length) {
               listToken.push(token);
               token = "";
            }
         }
         else if(c === "(" || c === ")" || c === "?") {
            if(token.length) {
               listToken.push(token);
               token = "";
            }
         }
         else
            token += c;
      }

      // Aggiunge ultimo token:
      if(token.length)
         listToken.push(token);

      // Restituisce lista dei token:
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
   private getObjectId(token: string): number {
      let id: number;

      // Converte il secondo token in un identificativo, se non è possibile significa che
      // l'URL non contiene un id valido e quindi probabilmente delle opzioni:
      id = parseInt(token);
      if(isNaN(id))
         id = 0;

      // restituisce identificativo:
      return id;
   }

   /**
    * Prepara la lista delle opzioni presenti nella chiamata.
    * @param token lista dei token ricevuti.
    * @return lista di opzioni.
    * @private
    */
   private getOption(token: string[]): IOption[] {
      let listOption: IOption[] = [];
      let option: string[] = [];
      let value: string[] = [];
      let index: number;

      // Indentifica da quale indice iniziare l'analisi delle opzioni:
      if(this._service.id === 0)
         index = 2;
      else
         index = 3;

      // Le opzioni sono separate dal carattere di "&":
      if(token[index] !== undefined) {
         option = token[index].split("&");

         // Le opzioni vengono scomposte così da popolare la lista delle opzioni:
         option.forEach((o) => {
            value = o.split("=")
            switch(value[0]) {
               case "$top":
               case "$skip":
               case "$filter":
                  listOption.push({
                     name: value[0],
                     value: value[1]
                  });
                  break;
            }
         });
      }

      // restituisce opzioni:
      return listOption;
   }

   /**
    * Crea l'istruzione SQL SELECT quando sono presenti opzioni.
    * @param table tabella sulla quale eseguire la SELECT.
    * @return istruzione SQL SELECT.
    * @private
    */
   private createStatement(table: string): string {
      let statement: string = "";
      let top: number = 0;
      let skip: number = 0;
      let where: string = "";

      // Scompone le opzioni in valori:
      if(this._service.option.length) {
         this._service.option.forEach(o => {
            switch(o.name) {
               case "$top":
                  top = parseInt(o.value);
                  if(isNaN(top))
                     top = 0;
                  break;

               case "$skip":
                  skip = parseInt(o.value);
                  if(isNaN(skip))
                     skip = 0;
                  break;

               case "$filter":
                  where = o.value;
                  break;
            }
         });

         // Costruisce l'istruzione SQL:
         statement = "SELECT * FROM main.customer";
         if(where.length)
            statement = `${statement} WHERE ${where}`;
         if(top !== 0 && skip !== 0)
            statement = `${statement} LIMIT ${skip}, ${top}`;
         else if(top !== 0)
            statement = `${statement} LIMIT ${top}`;
         else if(skip !== 0)
            statement = `${statement} LIMIT ${skip}, -1`;

         // Restituisce istruzione SQL:
         return statement;
      }
   }

   /**
    * Accede alla tabella dei customer.
    * @private
    */
   private customer(): void {
      let o: CCustomer;
      let statement: string = "";

      o = new CCustomer();

      // Cattura eventuali eccezioni:
      try {

         // Gestisce il metodo HTTP ricevuto:
         switch(this._method) {
            case "get":
               if(this._service.id !== 0) {
                  o.load(this._service.id);
                  this._rest.data = o.data;
               }
               else if(this._service.option.length) {
                  statement = this.createStatement("main.customer");
                  this._rest.data.push(this.executeAll(statement));
               }
               else
                  this._rest.data.push(o.loadAll());
               break;

            case "post":
               o.clean();
               o.description = this._service.data["description"];
               o.save();
               this._rest.data.push({
                  id: o.id
               });
               break;

            case "delete":
               o.load(this._service.id);
               o.delete();
               break;
         }
      }
      catch(e) {
         this._rest.error = e.message;
      }
      finally {
         o = undefined;
      }
   }

   /**
    * Accede alla tabella delle commesse.
    * @private
    */
   private wbs(): void {
      let o: CWbs;
      let statement: string = "";

      o = new CWbs();

      // Cattura eventuali eccezioni:
      try {

         // Gestisce il metodo HTTP ricevuto:
         switch(this._method) {
            case "get":
               if(this._service.id !== 0) {
                  o.load(this._service.id);
                  this._rest.data.push(o.data);
               }
               else if(this._service.option.length) {
                  statement = this.createStatement("main.wbs");
                  this._rest.data.push(this.executeAll(statement));
               }
               else
                  this._rest.data.push(o.loadAll());
               break;

            case "post":
               o.clean();
               o.internal_ref = this._service.data["internal_ref"];
               o.customer = this._service.data["customer"];
               o.description1 = this._service.data["description1"];
               o.description2 = this._service.data["description2"];
               o.status = this._service.data["status"];
               o.save();
               this._rest.data.push({
                  id: o.id
               });
               break;

            case "delete":
               o.load(this._service.id);
               o.delete();
               break;
         }
      }
      catch(e) {
         this._rest.error = e.message;
      }
      finally {
         o = undefined;
      }
   }

   /**
    * Accede alla tabella delle attività.
    * @private
    */
   private activity(): void {
      let o: CActivity;
      let statement: string = "";

      o = new CActivity();

      // Cattura eventuali eccezioni:
      try {

         // Gestisce il metodo HTTP ricevuto:
         switch(this._method) {
            case "get":
               if(this._service.id !== 0) {
                  o.load(this._service.id);
                  this._rest.data.push(o.data);
               }
               else if(this._service.option.length) {
                  statement = this.createStatement("main.activity");
                  this._rest.data.push(this.executeAll(statement));
               }
               else
                  this._rest.data.push(o.loadAll());
               break;

            case "post":
               o.clean();
               o.internal_ref = this._service.data["internal_ref"];
               o.external_ref = this._service.data["external_ref"];
               o.type = this._service.data["type"];
               o.description = this._service.data["description"];
               o.wbs = this._service.data["wbs"];
               o.functional = this._service.data["functional"];
               o.technical = this._service.data["technical"];
               o.hour = this._service.data[".hour"];
               o.mergenote = this._service.data["mergenote"];
               o.status = this._service.data["status"];
               o.note = this._service.data["note"];
               o.save();
               this._rest.data.push({
                  id: o.id
               });
               break;

            case "delete":
               o.load(this._service.id);
               o.delete();
               break;
         }
      }
      catch(e) {
         this._rest.error = e.message;
      }
      finally {
         o = undefined;
      }
   }

   /**
    * Accede alla tabella delle consuntivazioni.
    * @private
    */
   private workday(): void {
      let o: CWorkday;
      let statement: string = "";

      o = new CWorkday();

      // Cattura eventuali eccezioni:
      try {

         // Gestisce il metodo HTTP ricevuto:
         switch(this._method) {
            case "get":
               if(this._service.id !== 0) {
                  o.load(this._service.id);
                  this._rest.data.push(o.data);
               }
               else if(this._service.option.length) {
                  statement = this.createStatement("main.activity");
                  this._rest.data.push(this.executeAll(statement));
               }
               else
                  this._rest.data.push(o.loadAll());
               break;

            case "post":
               o.clean();
               o.activity = this._service.data["activity"];
               o.date = new Date(this._service.data["date"]);
               o.hour = this._service.data["hour"];
               o.extrainfo = this._service.data["extrainfo"];
               o.place = this._service.data["place"];
               o.note = this._service.data["note"];
               o.save();
               this._rest.data.push({
                  id: o.id
               });
               break;

            case "delete":
               o.load(this._service.id);
               o.delete();
               break;
         }
      }
      catch(e) {
         this._rest.error = e.message;
      }
      finally {
         o = undefined;
      }
   }

   /**
    * Accede alla tabella delle richieste di trasporto.
    * @private
    */
   private request(): void {
   }

   /**
    * Accede alla tabella degli indici di ricerca. Questo metodo di aspetta solo
    * l'uso di $filter.
    * @private
    */
   private search(): void {
      let statement: string = "";

      // Perchè il metodo funzioni correttamente, nelle opzioni il primo elemento
      // dove essere $filter, altrimenti non restituisce nulla:
      if(this._service.option.length === 1 && this._service.option[0].name === "$filter") {
         statement = `SELECT id, data, description, url, type
                      FROM main.search
                      WHERE data LIKE '%${this._service.option[0].value}%'
                      GROUP BY url;`
         this._rest.data.push(this.executeAll(statement));
      }
      else
         throw new Error("Search accept only $filter option");
   }

   /**
    * Costruttore.
    */
   constructor(url: string, method: string, data: object) {
      super();
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
         this._service.id = this.getObjectId(token[2]);
         this._service.option = this.getOption(token);
         if(!this.validName())
            this._rest.httpStatus = StatusCodes.SERVICE_UNAVAILABLE;
         else {
            switch(this._service.name) {
               case "customer":
                  this.customer();
                  break;

               case "wbs":
                  this.wbs();
                  break;

               case "activity":
                  this.activity();
                  break;

               case "workday":
                  this.workday();
                  break;

               case "request":
                  break;

               case "search":
                  this.search();
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
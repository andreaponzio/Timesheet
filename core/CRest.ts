/**
 * @author Andrea Ponzio
 * @version 1.0.0
 */
export interface IRest {
   top: number;
   skip: number;
   where: string
}

export default class CRest {
   /**
    * Adatta le istruzione OData in istruzioni compatibili con SQL.
    * @param data istruzioni ODAta.
    * @return stringa SQL.
    * @private
    * @static
    */
   private static convertODataToSql(data: string): string {
      let list_of_token: string[] = [];
      let list_of_newToken: string[] = [];
      let result: string = "";
      let token: string = "";

      // Scompone l'istruzione in token:
      [...data].forEach(c => {
         switch(c) {
            case "(":
            case ")":
               list_of_token.push(token);
               list_of_token.push(c);
               token = "";
               break;

            case " ":
               list_of_token.push(token);
               token = "";
               break;

            default:
               token += c;
         }
      });

      // Inserisce ultimo token:
      list_of_token.push(token);

      // Analizza e converte i token:
      list_of_token.forEach((token: string) => {
         switch(token.toLowerCase()) {
            case "eq":
               token = "=";
               break;

            case "ne":
               token = "<>";
               break;

            case "gt":
               token = ">";
               break;

            case "ge":
               token = ">=";
               break;

            case "lt":
               token = "<";
               break;

            case "le":
               token = "<=";
               break;
         }
         list_of_newToken.push(token);
      });
      list_of_token = undefined;

      // Ricompone la condizione:
      list_of_newToken.forEach((token: string) => {
         result += ` ${token}`
      });
      list_of_newToken = undefined;

      // restituisce condizione di filtro:
      return result;
   }

   /**
    * Converte le istruzione OData in striga SQL per condizione WHERE.
    * @param data istruzioni OData.
    * @return condizione SQL WHERE.
    * @public
    * @static
    */
   public static convertFilter(data: any): IRest {
      let result: IRest = {
         top: -1,
         skip: -1,
         where: ""
      };

      // Analizza istruzioni OData per la loro conversione in SQL compatibile:
      for(let d in data) {
         switch(d) {
            case "$filter":
               result.where = CRest.convertODataToSql(data[d]);
               break;

            case "$top":
               result.top = parseInt(data[d]);
               break;

            case "$skip":
               result.skip = parseInt(data[d]);
               break;

            default:
         }
      }

      // Restituisce le istruzioni OData convertite in SQL:
      return result;
   }
}
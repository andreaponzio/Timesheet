/**
 * @author Andrea Ponzio
 * @version 1.0.0
 */
import express, {Router, Request, Response} from "express";
import {CInit} from "../core/CInit";

/**
 * Dichiarazioni locali.
 */
export let router: Router = express.Router();

/**
 * Pagina per il caricamento massivo dei dati.
 */
router.get("/", (request: Request, response: Response) => {
   let i: CInit = new CInit();

   try {
      i.deleteAll();
      i.customer();
      i.wbs();
      i.activity();
      i.request();
      i.requestenv();
      i.workday();
   }
   catch(error) {
      console.error('Error:', error);
   }

   response.send("Dati ripristinati");
});
/**
 * @author Andrea Ponzio
 * @version 1.0.0
 */
import express, {Router, Request, Response} from "express";
import fs from "node:fs";
import CCustomer, {ICustomer} from "../core/CCustomer";

/**
 * Dichiarazioni locali.
 */
export let router: Router = express.Router();

/**
 * Restituisce $metadata del servizio di accesso a SQLite.
 */
router.get("/$metadata", (request: Request, response: Response) => {
   ;
   response.send(fs.readFileSync("./public/metadata_v4.xml").toString());
});
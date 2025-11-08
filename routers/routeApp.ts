/**
 * @author Andrea Ponzio
 * @version 1.0.0
 */
import express, {Router, Request, Response} from "express";

/**
 * Dichiarazioni locali.
 */
export let router: Router = express.Router();

/**
 * Pagina principale.
 */
router.get("/", (request: Request, response: Response) => {
   response.render("app");
});
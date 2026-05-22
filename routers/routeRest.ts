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
 * .
 */
router.get("/$metadata", (request: Request, response: Response) => {
});

/**
 * .
 */
router.get("/Customer", (request: Request, response: Response) => {
});

/**
 * .
 */
router.get("/Wbs", (request: Request, response: Response) => {
});

/**
 * .
 */
router.get("/Activity", (request: Request, response: Response) => {
});

/**
 * .
 */
router.get("/Workday", (request: Request, response: Response) => {
});
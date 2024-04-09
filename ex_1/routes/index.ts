import { Request, Response, Router } from "express";

const router = Router();

router.use("/books", require("./books"));
router.use("/ratings", require("./ratings"));
router.use("/top", require("./top"));

module.exports = router;

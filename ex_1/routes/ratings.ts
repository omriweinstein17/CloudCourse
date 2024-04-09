import { Router, Request, Response } from "express";

const router = Router();

router.get("/", async (req: Request, res: Response) => {
  res.send("hello yossi ");
});

router.get("/:id", async (req: Request, res: Response) => {
  res.send("hello yossi ");
});

module.exports = router;

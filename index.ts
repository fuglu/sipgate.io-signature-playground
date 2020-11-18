import bodyParser from "body-parser";
import express from "express";
import { readFileSync } from "fs";
import NodeRSA from "node-rsa";

const app = express();
const port = 8080;

const PUBLIC_KEY = readFileSync("sipgate.pub");

app.use(
  bodyParser.urlencoded({
    extended: true,
    verify: (req, res, body) => {
      const header = req.headers["x-sipgate-signature"] as string;

      const key = new NodeRSA(PUBLIC_KEY, "public");
      try {
        const valid = key.verify(body, Buffer.from(header, "base64"));

        if (!valid) {
          console.error("Signature is invalid");
          throw new Error("Signature is invalid");
        }
      } catch (error) {
        throw new Error("Could not verify signature");
      }
    },
  })
);

app.post("/", (req, res) => {
  console.log("Got valid request");
  console.log(req.body);

  res.status(204).send();
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});

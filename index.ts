import express, {type Express, type Request, type Response} from 'express';
import multer from 'multer';
import {generateAuthURL, getAccessToken, searchAnime, refreshToken} from "./src/api"
import {initDB,insertAccessToken, isTokenExpired} from "./src/db"


const store = multer.memoryStorage();
const upload = multer({storage: store});

const app: Express = express();

const port = process.env.PORT || 8000;

app.listen(port, () => {
  console.log(`Listening on port ${port}...`);
  initDB();
});


app.get("/", (_req: Request, res: Response) => {
  res.send("Hello World!");
});

app.post("/event", upload.single("thumb"), async (req: Request, res: Response) =>{

  const payload = JSON.parse(req.body.payload);
  console.log(payload);
  if(payload.event !== "media.play") {
    res.send("ok");
  } 

  await handleMediaPlay(payload);
  
  res.send("ok");
});


async function handleMediaPlay(payload: any) {
  console.log("handling media play");
  console.log(payload.Metadata);

  const metadata = payload.Metadata;

  const title = metadata.grandparentTitle.replace(/[^\w\s]/gi, "");
  console.log({title});
  
}

app.get("/init", (_req: Request, res: Response) => {

  res.redirect(generateAuthURL().toString());
});

app.get("/oauth2/callback", async (req: Request, res: Response) => {
  console.log("callback");
  const code = req.query.code;
  const params = req.query;
  console.log(params);
  if(typeof code === "string") {
    const token = await getAccessToken(code);
    insertAccessToken(token);
  }
  res.send("ok");
});

app.get("/search", async (req: Request, res: Response) => {

  const query = req.query.q;
  console.log(query);
  if(typeof query === "string") {
    try{
      const results = await searchAnime(query);
      res.send(results);
    } catch(err) {
      res.send(err);
    }
  }
  res.send("ok");
});

app.get("/isTokenExpired", async (_req: Request, res: Response) => {
  try {
    const isExpired = await isTokenExpired();
    res.send(isExpired);
  }
  catch(err) {
    console.log(err);
    res.send(err);
  }
});

app.get("/refreshToken", async (_req: Request, res: Response) => {
  try{
    const response = await refreshToken();
    insertAccessToken(response);
    res.send(response);  

  }catch(err){
    console.log('error refreshing token');
    console.log(err);
    res.send(err);
  }
});





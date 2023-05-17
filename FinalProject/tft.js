let http = require("http");
let path = require("path");
let express = require("express");
let app = express();
let bodyParser = require("body-parser");
let portNum = process.argv[2];


app.set("views", path.resolve(__dirname,"templates"));
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: false}));
app.use('/photos/',express.static('./photos/'));

http.createServer(app).listen(portNum);

process.stdin.setEncoding("utf-8");
require("dotenv").config({path: path.resolve(__dirname, '.env')})

const user = process.env.MONGO_DB_USERNAME;
const pass = process.env.MONGO_DB_PASSWORD;

const dataBaseAndCollection = {db: process.env.MONGO_DB_NAME, collection: process.env.MONGO_DB_COLLECTION};


const {MongoClient, ServerApiVersion} = require('mongodb');
const { response } = require("express");


async function main(){
  
  const uri = `mongodb+srv://${user}:${pass}@cluster0.v6tqi8f.mongodb.net/?retryWrites=true&w=majority`;
  const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

  try{
    await client.connect();
  } catch (e) {
    console.error(e);
  } finally {
    await client.close();
  }

}

app.get("/", (req, res) => {
  res.render("index")
})

async function insert(information){
  const uri = `mongodb+srv://${user}:${pass}@cluster0.v6tqi8f.mongodb.net/?retryWrites=true&w=majority`;
  const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

  try{
      await client.connect();
      const result = await client.db(dataBaseAndCollection.db).collection(dataBaseAndCollection.collection).insertOne(information);
  } catch (e){
      console.error(e);
  } finally {
      await client.close();
  }
}
app.get("/vote", (req, res) => {
  res.render("vote", {portNum: portNum});
});

app.post("/voteData", async (req, res) => {
  let {name, email, first, second, third, top1, top2, additional} = req.body;

  let topPicSelection;

  if (top1 == null && top2 == null){
    topPicSelection = "Garen";
  }
  else if (top1 == null){
    topPicSelection = "Syndra";
  }
  else{
    topPicSelection = "Urgot";
  }

  let information = {
      name: name,
      email: email,
      first:first,
      second:second,
      third: third,
      topPicSelection: topPicSelection,
      additional: additional,
  };
  await insert(information);
  let variables = {
      name: name,
      first:first,
      second:second,
      email: email,
      third: third,
      topPicSelection: topPicSelection,
      additional: additional,
      portNum: portNum
  };

  res.render("voteData", variables);
});

async function remove() {
  const uri = `mongodb+srv://${user}:${pass}@cluster0.v6tqi8f.mongodb.net/?retryWrites=true&w=majority`;
  const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

  try{
      await client.connect();
      const result = await client.db(dataBaseAndCollection.db).collection(dataBaseAndCollection.collection).deleteMany({});
      return result.deletedCount;
  } catch (e){
      console.error(e);
  } finally {
      await client.close();
  }
}
app.get("/remove", (req, res) => {
  res.render("remove", {portNum: portNum});
});

app.post("/removeProcess", async (req, res) => {
  let removedNum = await remove();
  res.render("removeProcess", {portNum: portNum, removedNum: removedNum});
});

console.log(`Web server started and running at http://localhost:${portNum}`);
process.stdout.write("Type stop to shutdown the server: ");

process.stdin.on("readable", function(){
    let userInput = process.stdin.read().trim();

    if (userInput != null){
        if (userInput === "stop") {
            process.stdout.write("Shutting down the server\n");
            process.exit(0);
        }
        else {
            process.stdout.write(`Invalid command: ${userInput} \n`);
            process.stdout.write("Type stop to shutdown the server: ");
            process.stdin.read();
        }
    }
})

main().catch(console.error);
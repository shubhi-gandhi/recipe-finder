const http = require('http');
const fs = require('fs');
const express = require('express');
const axios = require('axios');
const app = express();
const path = require('path');
const bodyParser = require('body-parser');




process.stdin.setEncoding("utf8");
const portNumber = process.argv[2];
const PORT = process.env.PORT || portNumber || 3000;


require('dotenv').config();
const {MongoClient, ServerApiVersion} = require('mongodb');
const userName = process.env.MONGO_DB_USERNAME;
const password = process.env.MONGO_DB_PASSWORD;
const db = process.env.MONGO_DB_NAME;
const collect = process.env.MONGO_COLLECTION;


const databaseAndCollection = {
   db: db,
   collection: collect,
};


const uri = "mongodb+srv://" +userName +":" +password + "@cluster0.mjzma.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

const client = new MongoClient(uri, {serverApi: ServerApiVersion.v1, autoSelectFamily:false});
let database;


if (process.argv.length!=3){
   process.stdout.write(`Usage: node summerCampServer.js portNumber\n`);
   process.exit(1);
}
client.connect().then(()=>{
   database = client.db("campApplicants");
   console.log("connected to database\n");
   app.listen(portNumber);
   console.log(`Web server started and running at http://localhost:${portNumber}`);
   process.stdout.write(`stop to shutdown the server: `);
})
.catch(err=>console.log("failed to connect", err));




process.stdin.on('readable', ()=>{
   let inputData = process.stdin.read();
   if(inputData !== null){
       let command = inputData.toString().trim();
       if (command === "stop") {
           process.stdout.write("Shutting down the server\n")
           process.exit(0);
       }
   }
});


app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));


let recipes = [];
app.get('/', (req, res)=>{
   res.render('index', {recipes});
});




app.post("/randomrecipe", async (req, res)=>{
   try{
       const response = await axios.get("https://www.themealdb.com/api/json/v1/1/random.php");
       const recipe = response.data;
       console.log(recipe);
       recipes = recipe.meals.slice(0,5).map(item=>({
          strMeal:item.strMeal,
          strInstructions: item.strInstructions
       }))
       console.log(recipes);
       res.redirect('/');
   }
   catch(error){
       console.log(error);
       res.redirect('/');
   }
});


app.post("/feedback", (req, res)=>{
   const {recipeName, recipeInstruction, rating, feedback} = req.body;
   const form = {recipeName:recipeName, recipeInstruction:recipeInstruction, rating:rating, feedback:feedback};
   app_submit(form);
   res.redirect('/');


   /*console.log(recipeName);*/
});


async function app_submit(newForm){
       const result = await client.db(databaseAndCollection.db).collection(databaseAndCollection.collection);
       const collection = database.collection(databaseAndCollection.collection);
   try{
       await result.insertOne(newForm);
   }catch(error){
       console.log(error);
   }
}


app.get("/adminRemove", (req, res) => {
   const url = "http://localhost:"+portNumber+"/adminRemove";
   res.render("adminRemove", {url});
 });


 /*Route to handle the remove-all request*/
app.get("/adminRemove", (req, res) => {
   const url = "http://localhost:"+portNumber+"/adminRemove";
   res.render("adminRemove", {url});
});


 /*Route to handle the remove-all request*/
app.get("/adminRemove", (req, res) => {
   const url = "http://localhost:"+portNumber+"/adminRemove";
   res.render("adminRemove", {url});
});


 /*Route to handle the remove-all request*/
app.post("/adminRemove", async(req, res) => {
       try {
         
         await client.connect();
         const result = await client.db(databaseAndCollection.db).collection(databaseAndCollection.collection).deleteMany({});
         const count = result.deletedCount;
    
         // Render confirmation page
         res.render("adminRemove", { count });
       } catch (e) {
         console.error(e);
         res.status(500).send("An error occurred while removing applications.");
       }
});


  




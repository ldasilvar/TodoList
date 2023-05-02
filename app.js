//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require('mongoose');
const _ = require ('lodash');


 
main().catch(err => console.log(err));

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
async function main() {
  await mongoose.connect('mongodb://127.0.0.1:27017/todolistDB');
}

const itemsSchema = new mongoose.Schema({
  name: String,
  
});
const Item = mongoose.model("Item", itemsSchema);

const cook = new Item({
  name: "Cook food for Baby",
  
});
 
const clean = new Item({
  name: "Clean the house for Baby",
  
});

const cat = new Item({
  name: "Feed Minks"
})

const defaultItems = [cook, clean, cat];
const listSchema = new mongoose.Schema({
  name: String, 
  items: [itemsSchema]
});
const List = mongoose.model("List", listSchema);
 


app.get("/", function(req, res) {

  Item.find({}).then(
    function(foundItems){
      if (foundItems.length === 0){
        Item.insertMany(defaultItems).then (function () {
  console.log("Successfully saved all the chores to fruitsDB.");
}) .catch(function (err) {
  console.log(err);
});
res.redirect("/");
      }else {
        res.render("list", {listTitle: "Today", newListItems: foundItems});
      }
      
  }).catch(function(err){
    console.log(err);
  });
  

});

app.get("/:customListName", function(req,res){
 const customListName = _.capitalize(req.params.customListName);

  List.findOne({name:customListName})
  .then(function(foundList){
    if(foundList === null){
      const list = new List({
        name: customListName,
        items: defaultItems
       });
       list.save();
       res.redirect("/" + customListName)
    }else{
       res.render("list", {listTitle: foundList.name, newListItems: foundList.items});
    }
  })
  .catch(function(e){
    console.log(e);
  })

 

 
});



app.post("/", (req, res) => {

  let itemName = req.body.newItem

  let listName = req.body.list.trim()  // Remove leading/trailing spaces



  const item = new Item({

      name: itemName,

  })



  if (listName === "Today") {

      item.save()

      res.redirect("/")

  } else {

      List.findOne({ name: listName }).exec().then(foundList => {

          if (foundList) {

              foundList.items.push(item)

              foundList.save()

              res.redirect("/" + listName)

          } else {

              const newList = new List({

                  name: listName,

                  items: [item],

              })

              newList.save()

              res.redirect("/" + listName)

          }

      }).catch(err => {

          console.log(err);

      });

  }

})
  
  


app.post("/delete", async function(req,res){
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  if (listName === "Today"){
    if(checkedItemId != undefined){
      await Item.findByIdAndRemove(checkedItemId)
      .then(()=>
      res.redirect("/")
      )
      
      .catch((err) => console.log("Deletion Error: " + err));
  }
  }else {
    let doc =  List.findOneAndUpdate({name:listName}, {$pull: {items: {_id: checkedItemId}}}, {
      new: true
    }).then(function (foundList)
    {
      res.redirect("/" + listName);
    }).catch( err => console.log(err));
  }
  
});



app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});

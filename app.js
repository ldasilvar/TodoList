//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require('mongoose');
const _ = require ('lodash');

const PORT = process.env.PORT || 3000;


 
main().catch(err => console.log(err));

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
async function main() {
  await mongoose.connect('mongodb+srv://ldasilvar:zb2hggpwIxdubRRL@todo.w7chcan.mongodb.net/todolistDB');
}

const itemsSchema = new mongoose.Schema({
  name: String,
  
});
const Item = mongoose.model("Item", itemsSchema);

const cook = new Item({
  name: "Welcome to your To-do List Baby Mandy",
  
});
 
const clean = new Item({
  name: "To add a new item to your list, type it underneath and click the + sign",
  
});

const cat = new Item({
  name: "To delete an item of a list, tick the checkbox :)"
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

  let listName = req.body.list.trim()



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

app.listen(PORT, () => {
  console.log(`server started on port ${PORT}`);
});


// ldasilvar
// zb2hggpwIxdubRRL
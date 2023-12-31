//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

mongoose.connect("mongodb+srv://admin-gourav:test-123@cluster0.hnmzey6.mongodb.net/todolistDB", {useNewUrlParser: true},
                 mongoose.set('strictQuery', true));


app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));


const itemSchema = {
  name: String
};

const Item = mongoose.model("Item", itemSchema);

const item1 = new Item({
  name: "Welcome to your todolist."
});

const item2 = ({
  name: "Hit + button to add a new item in your todolist."
});

const item3 = ({
  name:"Try to follow the todolist every day."
});


const defaultItem = [item1, item2, item3];



const listSchema = {
  name: String,
  items: [itemSchema]
};

const List = mongoose.model("List", listSchema);



app.get("/", function(req, res) {

  Item.find({}, function(err, foundItems){

  if(foundItems.length === 0){

    Item.insertMany(defaultItem, function(err){
      if(err){
      console.log(err);
       } else {
        console.log("Successfully added default items into the DB");
       }
    }); 

    res.redirect("/");

  }
  else{
    
      // console.log(foundItems);
      res.render("list", {listTitle: "Today", newListItems: foundItems});
    };
 });

});




app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;
  

  const item = new Item({
    name: itemName
  });

  if(listName === "Today"){
    item.save();

  res.redirect("/");
  } else{
    List.findOne({name: listName}, function(err , foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName);
    });
  }
    
  

});



app.post("/delete", function(req, res){
  const checkboxItem = req.body.checkbox;
  const listName = req.body.listName;

  if(listName === "Today"){

    Item.deleteOne({_id: checkboxItem}, function(err){
      console.log(err);
    });
  
    res.redirect("/");
  } else{
    List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkboxItem}}}, function(err, foundList){
      if(!err){
        res.redirect("/" + listName);
      }
    });
  }

  

});




// this is express route parameter


app.get("/:customListName", function(req, res){

  const customListName = _.capitalize(req.params.customListName);

  List.findOne({name: customListName}, function(err, foundList){

    if(!err){
      if(!foundList){
        // if the foundList doesnt exist then create a new one.

        const list = new List({

          name: customListName,
          items: defaultItem
        });
      
        list.save();

        res.redirect("/" + customListName);

      } else{
        // if the foundList exist then show an existing list.

        res.render("list", {listTitle: foundList.name, newListItems: foundList.items});


      }
    }

    

  });


  
});




app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});

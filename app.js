
const express = require('express');
const bodyParser = require("body-parser");
const date =require(__dirname+"/date.js");
const mongoose = require('mongoose');
const _ = require('lodash');
//console.log(date());
const app=express();

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
app.set("view engine", "ejs");

mongoose.connect("mongodb://localhost:27017/todolistDB",{useNewUrlParser:true});
 const itemsSchema ={
   name:String
 };
 const Item = mongoose.model("item",itemsSchema);

const item1=new Item({
  name:"Welcome to TodoList"
});
const item2=new Item({
  name:"Hit + button to add a new line"
});
const item3=new Item({
  name:"<-- hit this to delete an item"
});
const defaultItems =[item1,item2,item3];
const listschema ={
  name:String,
  items:[itemsSchema]
}
const List =mongoose.model("list",listschema);
/*Item.insertMany(defaultItems,function(err){
  if(err){
    console.log("error");
  }
  else{
    console.log("its fine");
  }
});*/
app.get("/", function(req, res) {
 //var day =date();
 Item.find({},function(err,foundItems){
   //console.log();
   if(foundItems.length===0){
     Item.insertMany(defaultItems,function(err){
       if(err){
         console.log("error");
       }
       else{
         console.log("its fine");
       }
     });
     res.redirect("/");
   }
   else{
   res.render('list', {
      ListTitle: "Today",
      newListItems:foundItems
    });
  }
 });

});
app.post("/",function(req,res){
  var itemName = req.body.newItem;
  var listName = req.body.list;


  if(listName==="Today"){
    const item =new Item({
      name :itemName
    });
    item.save();
    res.redirect("/");
  }
  else{
    const list =new List({
      name :itemName,
      items: defaultItems
    });
    List.findOne({name:listName},function(err,foundList){
      foundList.items.push(list);
      foundList.save();
      res.redirect("/"+listName);
    });

  }

});
app.post("/delete",function(req,res){
  const checkboxId=req.body.checkbox;
  const listName = req.body.listName;
  //console.log(req.body);
  if(listName==="Today"){
    Item.findByIdAndRemove(checkboxId,function(err){
      if(err){console.log(err);}
      else{
        res.redirect("/");
      }
    });
  }
  else{
  List.findOneAndUpdate({name:listName},{$pull:{items:{_id:checkboxId}}},function(err,foundList){
    if(!err){
      res.redirect("/"+listName);
    }
  });
  }

});
app.get("/:CustomListName",function(req,res){
  const customListName=_.capitalize(req.params.CustomListName);
  List.findOne({name:customListName},function(err,foundList){
    if(!err){
      if(!foundList){
      //create anew List
      const list=new List({
        name:customListName,
        items: defaultItems
      });
      list.save();
      res.redirect("/"+customListName);
      }
      else{
        res.render("list",
      {ListTitle:foundList.name,newListItems:foundList.items});
      }
      //res.redirect("/"+CustomListName);
    }
  });


});
app.listen(5000, function() {
  console.log("Server started on port 5000");
});

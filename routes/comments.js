var express   = require("express");

// Here we are using express router insted of app itself.
// Here we have to use mergeParams: true in thr Router as if we not use this, 
// it will not read :id in the campgrounds page when we try to add comment and we will get the error
// cannot read property "name" of null.
var router     = express.Router({mergeParams: true});
var Campground = require("../model/campground"),
    Comment    = require("../model/comments")

var middleware = require("../middleware/index.js")    
// We can also include middleware as ->
// var middleware = require("../middleware"); 
// Since index.js is a special name of file so sometimes it need not be explicitly mentioned.


// Since a comment is associated with post so we can't directly create route as /comments/new ,
// we have to use a campground id , so the route will be /campground/:id/comments/new.

router.get("/new",middleware.isLoggedIn, function(req,res){
    
    // First find the campground with the id in the link and then pass it to the new.ejs
    Campground.findById(req.params.id,function(err,campground){
        if (err) {
            console.log(err)
        }else{
            res.render("comments/new",{campground : campground})        
        }
    })
    
;;})


// Creates comments
router.post("/", middleware.isLoggedIn,function(req,res){
    
    // First find the campground using ID, to which the comment will be associated.
    Campground.findById(req.params.id,function(err,campground){
        if (err) {
            console.log(err);
            res.redirect("/campgrounds");
        }else{
            
            // Now create a new comment.
            Comment.create(req.body.comment,function(err,comment){
                if (err) {
                    console.log(err);
                    req.flash("error" ,"Something went wrong!")
                    res.redirect("/campgrounds");
                }else{
                    
                    // Add username and ID to the comment.
                    comment.author.id= req.user._id;
                    comment.author.username= req.user.username;
                    
                    // Save comment
                    comment.save();
                    
                    
                    // Now add comment to the target campground.
                    campground.comments.push(comment);
                    
                    // Now save the campground.
                    campground.save();
                    req.flash("success" ,"Successfully added comment!")
                    
                    // Now redirect to show page with the updated comment.
                    res.redirect("/campgrounds/"+campground._id);                 
                }
            });
        }
    });
});


// EDIT comment route
router.get("/:comment_id/edit",middleware.checkCommentOwner, function(req,res){
    
    Comment.findById(req.params.comment_id,function(err,comm){
        if (err) {
            console.log(err)
            res.redirect("back");
        }else{
            res.render("comments/edit",{campground_id:req.params.id , comment:comm });
        }
    })
    
})


//Comment UPDATE route
router.put("/:comment_id",middleware.checkCommentOwner,function(req,res){
    
    // Find and update comment using commentId
    
    Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, function(err,updatedCampground){
        if (err) {
            res.redirect("back");
        }else{
            req.flash("success" ,"Successfully updated comment!")
            res.redirect("/campgrounds/"+req.params.id);
        }
    })
})

// Delete Comment route.
router.delete("/:comment_id",middleware.checkCommentOwner,function(req,res){
    
    // Find and delete comment
    Comment.findByIdAndRemove(req.params.comment_id,function(err){
        if (err) {
            res.redirect("back");
        }else{
            req.flash("success" ,"Successfully deleted comment!")
            // Find campground and pass it to show template
            res.redirect("/campgrounds/"+req.params.id)
        }
    })
    
})



module.exports= router;
const fs = require('fs');
const path = require('path');
const sidebar = require('../helpers/sidebar');
const Models = require('../models');
const md5 = require('md5');

module.exports ={
    index: (req,res)=>{
    //    res.send(`The image:index controller ${req.params.image_id}`);
        const viewModel ={
            image: {},
            comments: []
        };

        Models.Image.findOne({filename: { $regex: req.params.image_id }},(err,image) =>{
            if (err) { throw err;}
            if (image) {
                image.views = image.views + 1;
                viewModel.image = image;
                image.save();
                Models.Comment.find({ image_id: image._id},{},{ sort: {'timestamp': 1
                }},(err,comments)=>{
                    if (err) { throw err;}
                    viewModel.comments = comments;
                    sidebar(viewModel, (viewModel)=> {
                        res.render('image', viewModel);
                    });
                });
            }else {
                res.redirect('/');
            }
        });
    },

    create(req,res){
        const saveImage = function(){
            let possible = 'abcdefghijklmnopqrstuvwxyz0123456789';
            let imgUrl ='';
            for(let i=0; i <6; i+=1) {
                imgUrl += possible.charAt(Math.floor(Math.random()*possible.length));
            }
            Models.Image.find({filename: imgUrl}, (err,images) => {
                if (images.length >0) {
                    saveImage();
                } else {
                    const tempPath = req.file.path;
                    const ext = path.extname(req.file.originalname).toLowerCase();
                    const targetPath = path.resolve(`./public/upload/${imgUrl}${ext}`);
                    if(ext === '.png' || ext === '.jpg' || ext==='.jpeg' || ext==='.gif') {
                        fs.rename(tempPath, targetPath, (err) => {
                            if (err) {throw err;}
                            let newImg = new Models.Image({
                                title: req.body.title,
                                filename: imgUrl + ext,
                                description: req.body.description
                            });
                            newImg.save((err, image)=>{
                                res.redirect(`/images/${image.uniqueId}`);
                            });
                        });
                    } else {
                        fs.unlink(tempPath, () => {
                        if (err) {throw err;}

                        res.json(500, {error: 'Only image files are allowed.'});
                        });
                    }
                }
            });
        };
    saveImage();       
    },

    like(req,res){
        Models.Image.findOne({
            filename: { $regex: req.params.image_id}
        }, (err, image)=>{
            if(!err && image) {
                image.likes = image.likes + 1;
                image.save((err) => {
                    if (err) {
                        res.json(err);
                    } else {
                        res.json({ likes: image.likes});
                    }
                });
            }
        });
    },
    comment(req,res){
        Models.Image.findOne({
            filename: {$regex: req.params.image_id}
        },(err, image) =>{
            if(!err && image) {
                let newComment = new Models.Comment(req.body);
                newComment.gravatar = md5(newComment.email);
                newComment.image_id = image._id;
                newComment.save((err, comment) => {
                    if (err) { throw err;}
                    res.redirect(`/images/${image.uniqueId}#${comment._id}`);
                });
            } else {
                res.redirect('/');
            }
        });
    },
    remove(req,res){
        Models.Image.findOne({
            filename: { $regex: req.params.image_id}
        },
        (err, image) =>{
            if(err) {throw err; }
            fs.unlink(path.resolve(`./public/upload/${image.filename}`),
                (err)=> {
                    if(err) {throw err;}
                    Models.Comment.remove({ image_id: image._id},
                        (err) => {
                            image.remove((err)=> {
                                if(!err) {
                                    res.json(true);
                                }else {
                                    res.json(false);
                                }
                            });
                    });
            });
        })
    }
};
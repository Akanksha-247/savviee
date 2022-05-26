const express = require('express');
const multer = require('multer');
const app = express();
const fs = require('fs');
const path = require('path');
var Tesseract = require('tesseract.js');
var cons = require('consolidate');
app.engine('html', cons.swig)
app.set('views', path.join(__dirname, 'views'));
app.get("/", (req, res) => {
    res.sendFile("index.html");
});
app.use(express.urlencoded({ extended: true }));

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
// Set view engine as EJS
//app.engine('html', require('html').renderFile);
//app.set('view engine', 'html');
//app.set('views', __dirname + '/views');
const PORT = process.env.PORT | 5500;

var Storage = multer.diskStorage({
    destination: (req, file, callback) => {
        callback(null, __dirname + '/images');
    },
    filename: (req, file, callback) => {
        callback(null, file.originalname);
    }
});

var upload = multer({
    storage: Storage
}).single('image');
//route
app.get('/', (req, res) => {
    res.render('index');
});

app.post('/upload', (req, res) => {
    console.log(req.file);
    upload(req, res, err => {
        if (err) {
            console.log(err);
            return res.send('Something went wrong');
        }

        var image = fs.readFileSync(
            __dirname + '/images/' + req.file.originalname, {
                encoding: null
            }
        );
        Tesseract.recognize(image)
            .progress(function(p) {
                console.log('progress', p);
            })
            .then(function(result) {
                res.send(result.html);
            });
    });
});

app.get('/showdata', (req, res) => {});

app.listen(PORT, () => {
    console.log(`Server running on Port ${PORT}`);
});
import express from 'express';
import bodyParser from 'body-parser';
import { MongoClient } from 'mongodb';
import path from 'path';


const app = express();

app.use(express.static(path.join(__dirname, '/build')));
app.use(bodyParser.json());


// Connecting to the Mongo Db Function
const withDB = async (operations, res) => {
    try{
        const client = await MongoClient.connect('mongodb://localhost:27017' , 
        { useNewUrlParser: true});
        const db = client.db('my-blog');

        await operations(db);
        client.close();

    } catch(error){
        res.status(500).json({message: 'Error connecting to MongoDB', error});
    }
}

// Get request to Articles
app.get('/api/articles', async (req, res) => {
    withDB( async(db) => {
        const articleList = await db.collection('articles').find().toArray();
        res.status(200).json(articleList);
    }, res);

});

// Get request to Articles
app.get('/api/aboutus', async (req, res) => {
    withDB( async(db) => {
        const articleList = await db.collection('about').find().toArray();
        res.status(200).json(articleList);
    }, res);

});

// Get request to Categories
app.get('/api/categories', async (req, res) => {
    withDB( async(db) => {
        const categoryList = await db.collection('categories').find().toArray();
        res.status(200).json(categoryList);
    }, res);

});

// Get request to Banner
app.get('/api/banners', async (req, res) => {
    withDB( async(db) => {
        const bannerList = await db.collection('banner').find().toArray();
        res.status(200).json(bannerList);
    }, res);

});

// Get request to add Footer
app.get('/api/footer', async (req, res) => {
    withDB( async(db) => {
        const footers = await db.collection('footer').find().toArray();
        res.status(200).json(footers);
    }, res);

});

// Get Single Article
app.get('/api/articles/:name', async (req, res) => {
    withDB( async(db) => {
        const articleName = req.params.name;

        const articleInfo = await db.collection('articles').findOne({name: articleName});
        res.status(200).json(articleInfo);
    }, res);

});

// Add Article Endpoint
app.post('/api/articles/add-article', (req, res) => {
    const { name, title , banner, content, catid} = req.body;
    
    withDB( async (db) => {        
       const singleArticle =  await db.collection('articles').insertOne({
                catid: catid,
                name: name,
                title: title,
                upvotes: 0,
                banner: banner,
                content: content,
                video: [],
                comments: []
        });

        res.status(200).json(singleArticle);
    }, res);

});


// Post request to update upvotes
app.post('/api/articles/:name/upvote', async (req, res) => {
    withDB( async(db) =>{
        const articleName = req.params.name;

        const articleInfo = await db.collection('articles').findOne({name: articleName});
        await db.collection('articles').updateOne({name: articleName}, {
            $set: {
                upvotes: articleInfo.upvotes + 1,
            }
        });
        const updatedArticleinfo = await db.collection('articles').findOne({name: articleName});

        res.status(200).json(updatedArticleinfo);
    }, res);

});

// Post Request to update Comments
app.post('/api/articles/:name/add-comment', (req, res) => {
    const { username, text} = req.body;
    const articleName = req.params.name;

    withDB( async (db) => {
        const articleInfo = await db.collection('articles').findOne({name: articleName});
        
        await db.collection('articles').updateOne({name: articleName},{
            $set: {
                comments: articleInfo.comments.concat({username, text}),
            }
        });
        const updatedArticleinfo = await db.collection('articles').findOne({name: articleName});

        res.status(200).json(updatedArticleinfo);
    }, res);

});


// Post Request to update videos
app.post('/api/articles/:name/add-video', (req, res) => {
    const { videoId, name , thumbnail} = req.body;
    const articleName = req.params.name;

    withDB( async (db) => {
        const articleInfo = await db.collection('articles').findOne({name: articleName});
        
        await db.collection('articles').updateOne({name: articleName},{
            $set: {
                video: articleInfo.video.concat({videoId, name, thumbnail}),
            }
        });
        const updatedArticleinfo = await db.collection('articles').findOne({name: articleName});

        res.status(200).json(updatedArticleinfo);
    }, res);

});

// Post Request to add a new Banner
app.post('/api/banners/add-banner', (req, res) => {
    const { name, title , bannertext, pic} = req.body;
    
    withDB( async (db) => {        
       const singleBanner =  await db.collection('banner').insertOne({
                name: name,
                title: title,
                bannertext: bannertext,
                pic: pic
        });

        res.status(200).json(singleBanner);
    }, res);

});

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname + '/build/index.html'));
});

// Mongo db Listening Port
app.listen(8000, () => console.log('Listeningg on port 8000'));
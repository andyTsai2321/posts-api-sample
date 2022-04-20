const http = require('http');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const handleSuccess = require('./handleSuccess');
const handleError = require('./handleError');
const Posts = require('./model/post');
dotenv.config({ path: './config.env' })

const DB = process.env.DATABASE.replace('<password>', process.env.DATABASE_PWD)
mongoose.connect(DB)
  .then(() => {
    console.log('資料庫連接成功')
  }).catch((e) => {
  console.log(e)
})

const requestListener = async (req, res) => {
  let body = ""
  req.on("data", (chunk) => {
    body += chunk;
  });
  if (req.url == "/posts" && req.method === "GET") {
    const getPosts = await Posts.find();
    handleSuccess(res, getPosts);
  } else if (req.url == "/posts" && req.method === "POST") {
    req.on('end', async () => {
      try {
        const data = JSON.parse(body)
        const newPost = await Posts.create(
          {
            name: data.name,
            tags: data.tags,
            image: data.image,
            createAt: data.createAt,
            content: data.content,
            likes: data.likes,
            comments: data.comments,
          }
        )
        handleSuccess(res, newPost);
      } catch (e) {
        console.log(e)
        handleError(res, e)
      }
    })
  } else if (req.url == "/posts" && req.method === "DELETE") {
    await Posts.deleteMany({})
    handleSuccess(res);
  } else if (req.url.startsWith('/posts') && req.method === 'DELETE') {
    req.on('end', async () => {
      try {
        const id = req.url.split('/').pop()
        await Posts.findByIdAndDelete(id)
        const getPosts = await Posts.find();
        handleSuccess(res, getPosts);
      } catch (e) {
        // console.log(e)
        handleError(res)
      }
    })
  } else if (req.url.startsWith('/posts') && req.method === 'PATCH') {
    req.on('end', async () => {
      try {
        const id = req.url.split('/').pop()
        const updateContent = JSON.parse(body)
        await Posts.findByIdAndUpdate(id, updateContent)
        const getPosts = await Posts.find();
        handleSuccess(res, getPosts);
      } catch (e) {
        console.log(e)
        handleError(res, e)
      }
    })
  } else if (req.method === "OPTIONS") {
    handleSuccess(res);
  } else {
    handleError(res, {
      message: "404"
    })
  }
}


const server = http.createServer(requestListener);
server.listen(3006);


//模块引入
const Koa = require('koa');
const Router = require('koa-router');
//const mongoose = require('mongoose');
//const dburl = require('./config/keys').mongoURL;
const bodyParser = require('koa-bodyparser');
const passport = require('koa-passport')
//引入路由
const users = require('./routes/api/users');
const profile = require('./routes/api/profile');
const posts = require('./routes/api/posts');

//实例化
const app = new Koa();
const router = new Router();

//app使用
app.use(bodyParser());
app.use(passport.initialize())
app.use(passport.session())

//passport回调到config/passport.js文件中
require('./config/passport')(passport);

//配置路由地址localhost:5000/api/users 只要路径前缀如此，都会进入users.js中寻找路由
router.use('/api/users', users);
router.use('/api/profile', profile);
router.use('/api/posts', posts);

//配置路由
app.use(router.routes()).use(router.allowedMethods());

//路由
router.get('/', async ctx => {
    ctx.body = { msg: 'Hello Koa Interface' };
})

/**
 * 临时代码，向数据库testSystem里增加数据
 */
// var User = require('./models/User');
// var u = new User({
//     name: "蔡徐坤",
//     email: "Sing_jump_rap_basketball@nmsl.com",
//     password: "123123",
//     avatar: "cxk.jpg"
// });
// u.save()
//     .then(() => console.log("临时数据增加成功！"))
//     .catch(err => console.log("临时数据添加失败：", err));


//设置端口号
const port = process.env.PORT || 5000;//?这句什么意思

//监听当前端口号
app.listen(port, () => {
    console.log(`server started on ${port}!`);
})



const mongoose = require('mongoose');
const dburl = require('../config/keys').mongoURL;

/**
 * 测试代码
 * mongoose模块连接本地数据库测试
 */
// mongoose.connect('mongodb://FDuberru:123456@localhost:27019/FDfamily', { useNewUrlParser: true }).then(() => { console.log('MongoDB Connected'); });

// const UserSchenma = mongoose.Schema({
//     name: String,
//     age: Number,
//     status: {
//         type: Number,
//         default: 1
//     }
// });
// //var User = mongoose.model("user", UserSchenma, "user");//这句模型映射到user表
// var User = mongoose.model("user", UserSchenma);//这句模型映射到users表
// //查
// User.find({}, (err, doc) => {
//     if (err) {
//         console.log(err);
//     }
//     else {
//         console.log(`查找结果：${doc}`);
//     }
// })
//增
// var u = new User({
//     name: "张三",
//     age: 22,
//     status: 1
// });
// u.save(err => {
//     if (err) console.log(err);
//     else console.log('增加数据成功');
// });
//改
// User.update({ _id: "5d2c2883a46a0d3a741f1cb6" }, { age: "18" }, (err, doc) => {
//     if (err) console.log('修改失败：', err);
//     else console.log('修改成功:', doc);
// });
//删
// User.deleteOne({ age: "18" }, (err, doc) => {
//     if (err) console.log('修改失败：', err);
//     //else console.log(`删除成功：${doc}`); //？？？？？？？？这样写模板字符串为什么拿不到doc?
//     else console.log('修改成功:', doc);
// });

/**
 * 测试代码
 * mongoose模块连接云端数据库 
 * problem................无法连接，抛出错误
 * 错误见./err/DBconnect.txt
 */
// mongoose
//     .connect(dburl, { useNewUrlParser: true })
//     .then(() => { console.log('连接成功'); })
//     .catch(err => { console.log(err); });


/**
 * 测试代码
 * mongodb模块连接云端数据库
 */
// const MongoClient = require('mongodb').MongoClient;
// const uri = "mongodb+srv://test:test1234@cluster0-yvb23.mongodb.net/test?retryWrites=true&w=majority";
// const client = new MongoClient(uri, { useNewUrlParser: true });
// client.connect(err => {
//     const collection = client.db("test").collection("devices");
//     // perform actions on the collection object
//     console.log('连接成功');
//     client.close();
// });

/**
 * 正式代码
 * mongoose连接本地数据库 localhost:27019/testSystem
 */

// Make Mongoose use `findOneAndUpdate()`. Note that this option is `true`
// by default, you need to set it to false.
mongoose.set('useFindAndModify', false);
mongoose.connect(dburl, { useNewUrlParser: true })
    .then(() => { console.log('数据库testSystem连接成功'); })
    .catch(err => console.log("连接数据库testSystem失败：", err));

module.exports = mongoose;


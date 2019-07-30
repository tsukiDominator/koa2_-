const mongoose = require('./dbConnect');

const Schema = mongoose.Schema;

//实例化数据模板
const PostSchema = new Schema({
    user: {//关联数据表
        type: String,
        ref: "users",//注意这里是model名称不是表的名称，如果是mongoose.model("user", UserSchema, "users"); 这里要写use而不是users    
    },
    text: {
        type: String,
        required: true
    },
    name: {
        type: String,
    },
    avatar: {
        type: String,
    },
    likes: [{
        user: {
            type: Schema.Types.ObjectId,
            ref: 'users'
        }
    }],
    comments: [{
        user: {
            type: Schema.Types.ObjectId,
            ref: 'users'
        },
        text: {
            type: String,
            required: true
        },
        name: {
            type: String,
            required: true
        },
        avatar: {
            type: String,
            required: true
        }
    }],
    date: {
        type: Date,
        default: Date.now
    }
});

module.exports = User = mongoose.model("post", PostSchema);
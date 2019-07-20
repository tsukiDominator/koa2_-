const mongoose = require('./dbConnect');

const Schema = mongoose.Schema;

//实例化数据模板
const ProfileSchema = new Schema({
    user: {//关联数据表
        type: String,
        ref: "users",//注意这里是model名称不是表的名称，如果是mongoose.model("user", UserSchema, "users"); 这里要写use而不是users
        required: true
    },
    handle: {
        type: String,
        required: true,
        max: 40
    },
    company: {
        type: String,
    },
    website: {
        type: String,
    },
    location: {
        type: String,
    },
    status: {
        type: String,
        required: true
    },
    skills: {
        type: [String],
        required: true
    },
    bio: {
        type: String,
    },
    githubusername: {
        type: String,
    },
    experience: [{
        current: {
            type: Boolean,
            default: true
        },
        title: {
            type: String,
            required: true
        },
        company: {
            type: String,
            required: true
        },
        location: {
            type: String,
        },
        from: {
            type: String,
            required: true
        },
        to: {
            type: String,
        },
        description: {
            type: String,
        }
    }],
    education: [{
        current: {
            type: Boolean,
            default: true
        },
        school: {
            type: String,
            required: true
        },
        degree: {
            type: String,
            required: true
        },
        filedofstudy: {
            type: String,
        },
        from: {
            type: String,
            required: true
        },
        to: {
            type: String,
        },
        description: {
            type: String,
        }
    }],
    social: {
        wechat: {
            type: String,
        },
        qq: {
            type: String,
        },
        tengxunkt: {
            type: String,
        },
        wangyikt: {
            type: String,
        },
    },
    date: {
        type: Date,
        default: Date.now
    }
});

module.exports = Profile = mongoose.model("profile", ProfileSchema);
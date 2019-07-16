/**
 * 这个文件用来写用户信息的接口
 */

/**引入*/
const Router = require('koa-router');
const User = require('../../models/User');
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
const tools = require('../../config/tool');
const jwt = require('jsonwebtoken');
const keys = require('../../config/keys');
const passport = require('koa-passport');
const validateRegisterInput = require('../../validation/register');
const validateLoginInput = require('../../validation/login');

/**实例化 */
const router = new Router();

/**
 *route Get api/users/test
 *desc 测试接口地址
 *access 接口是公开的
 */
router.get('/test', async ctx => {
    ctx.status = 200;
    ctx.body = { msg: "测试请求成功！" };
});

/**
 *route POST api/users/register
 *desc 注册接口地址
 *access 接口是公开的
 */
router.post('/register', async ctx => {
    const { errors, isValid } = validateRegisterInput(ctx.request.body);
    //判断是否验证通过
    if (!isValid) {
        ctx.status = 400;
        ctx.body = errors;
        return;
    }
    /**连接数据库，判断邮箱是否已经注册*/
    const findResult = await User.find({ email: ctx.request.body.email });
    if (findResult.length > 0) {
        ctx.status = 500;
        ctx.body = { email: '邮箱已被占用' };
        console.log('注册失败，邮箱已被占用');
    }
    else {
        const avatar = gravatar.url(ctx.request.body.email, { s: '200', r: 'pg', d: 'mm' });
        const newUser = new User({
            name: ctx.request.body.name,
            email: ctx.request.body.email,
            password: tools.enbcrypt(ctx.request.body.password),/**密码加密 */
            avatar: avatar
        });

        /**
         * 正式代码块
         */
        /**存储到数据库 */
        await newUser.save();
        /**返回json数据 */
        console.log("新用户注册成功！");
        ctx.body = newUser;

        /**
         * 同样可用但总感觉有问题的代码块
         */
        // await newUser.save()
        //     .then(doc => {
        //         console.log("新用户注册成功");
        //         ctx.body = doc;
        //     })
        //     .catch(err => console.log("用户注册发生错误：", err));
    }
});

/**
 *route POST api/users/login
 *desc 登录接口地址 返回token
 *access 接口是公开的
 */
router.post('/login', async ctx => {
    const { errors, isValid } = validateLoginInput(ctx.request.body);
    //判断是否验证通过
    if (!isValid) {
        ctx.status = 400;
        ctx.body = errors;
        return;
    }
    /**查询 */
    const findResult = await User.find({ email: ctx.request.body.email });
    //声明
    const postPassword = ctx.request.body.password;
    const user = findResult[0];
    /**判断 */
    if (findResult.length == 0) {
        ctx.status = 404;
        ctx.body = { email: '用户不存在' };
    } else {
        //查到后验证密码
        var result = await bcrypt.compareSync(postPassword, user.password);
        //验证通过
        if (result) {
            //返回token
            const payLoad = { id: user.id, name: user.name, avatar: user.avatar };
            const token = jwt.sign(payLoad, keys.secretOrKey, { expiresIn: 3600 });
            ctx.status = 200;
            ctx.body = { success: true, token: "Bearer " + token };
        } else {
            ctx.status = 400;
            ctx.body = { password: '密码错误' };
        }
    }
});

/**
 * route Get api/users/current
 * desc 用户信息接口地址 返回用户信息
 * access 接口是私密的
 */
router.get('/current', passport.authenticate('jwt', { session: false }), async ctx => {
    ctx.body = {
        id: ctx.state.user.id,
        name: ctx.state.user.name,
        email: ctx.state.user.email,
        avatar: ctx.state.user.avatar
    };
});

/**导出*/
module.exports = router.routes();
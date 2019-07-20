/**
 * 这个文件用来写用户信息的接口
 */
/**引入*/
const Router = require('koa-router');
const router = new Router();
const passport = require('koa-passport');
const Profile = require('../../models/Profile');
const validateProfileInput = require('../../validation/profile');
const validateExperienceInput = require('../../validation/experience');
const validateEducationInput = require('../../validation/education');
const User = require('../../models/User');
/**
 *route Get api/profile/test
 *desc 测试接口地址
 *access 接口是公开的
 */
router.get('/test', async ctx => {
    ctx.status = 200;
    ctx.body = { msg: "profile works..." };
});
/**
 *route Get api/profile/
 *desc 测试接口地址
 *access 接口是私有的
 */
router.get('/', passport.authenticate('jwt', { session: false }), async ctx => {
    // Profile.aggregate([
    //     {
    //         $lookup: {
    //             from: "users",
    //             localField:""
    //         }
    //     },
    // ])
    const profile = await Profile.find({ user: ctx.state.user.id }).populate(
        'user',
        ['name', 'avatar']
    );
    //console.log(profile);
    if (profile.length > 0) {
        ctx.status = 200;
        ctx.body = profile;
    } else {
        ctx.status = 404;
        ctx.body = { noprofile: '该用户没有任何相关的个人信息' };
        return;
    }
});
/**
 *route POST api/profile/
 *desc 添加和编辑个人信息接口地址
 *access 接口是私有的
 */
router.post('/', passport.authenticate('jwt', { session: false }), async ctx => {
    //判断是否验证通过
    const { errors, isValid } = validateProfileInput(ctx.request.body);
    if (!isValid) {
        ctx.status = 400;
        ctx.body = errors;
        return;
    }
    const profileField = {};
    profileField.user = ctx.state.user.id;
    if (ctx.request.body.handle) {
        profileField.handle = ctx.request.body.handle;
    }
    if (ctx.request.body.company) {
        profileField.company = ctx.request.body.company;
    }
    if (ctx.request.body.website) {
        profileField.website = ctx.request.body.website;
    }
    if (ctx.request.body.location) {
        profileField.location = ctx.request.body.location;
    }
    if (ctx.request.body.status) {
        profileField.status = ctx.request.body.status;
    }
    //skills数据转换"html,css,js,vue"
    if (typeof ctx.request.body.skills !== undefined) {
        profileField.skills = ctx.request.body.skills.split(',');
    }
    if (ctx.request.body.bio) {
        profileField.bio = ctx.request.body.bio;
    }
    if (ctx.request.body.githubusername) {
        profileField.githubusername = ctx.request.body.githubusername;
    }

    profileField.social = {};
    if (ctx.request.body.wechat) {
        profileField.social.wechat = ctx.request.body.wechat;
    }
    if (ctx.request.body.qq) {
        profileField.social.qq = ctx.request.body.qq;
    }
    if (ctx.request.body.tengxunkt) {
        profileField.social.tengxunkt = ctx.request.body.tengxunkt;
    }
    if (ctx.request.body.wangyikt) {
        profileField.social.wangyikt = ctx.request.body.wangyikt;
    }
    //查询数据库
    const profile = await Profile.find({ user: ctx.state.user.id });
    if (profile.length > 0) {
        //编辑更新
        const profileUpdate = await Profile.findOneAndUpdate(
            { user: ctx.state.user.id },
            { $set: profileField },
            { new: true }
        );
        ctx.body = profileUpdate;//返回什么数据类型？
    } else {
        await new Profile(profileField).save()
            .then(profile => {
                ctx.status = 200;
                ctx.body = profile;
            })
    }
});
/**
 *route Get api/profile/handle?handle=test
 *desc 通过handle获取个人信息 接口地址
 *access 接口是公开的
 */
router.get('/handle', async ctx => {
    const errors = {};
    const handle = ctx.query.handle;
    const profile = await Profile.find({ handle: handle }).populate('user', ['name', 'avatar']);
    if (profile.length < 1) {
        errors.noprofile = '未找到该用户信息';
        ctx.status = 404;
        ctx.body = errors;
    } else {
        ctx.body = profile[0];
    }
});
/**
 *route Get api/profile/user?user_id=<>
 *desc 通过user_id获取个人信息 接口地址
 *access 接口是公开的
 */
router.get('/user', async ctx => {
    const errors = {};
    const user_id = ctx.query.user_id;
    const profile = await Profile.find({ user: user_id }).populate('user', ['name', 'avatar']);
    if (profile.length < 1) {
        errors.noprofile = '未找到该用户信息';
        ctx.status = 404;
        ctx.body = errors;
    } else {
        ctx.body = profile[0];
    }
});
/**
 *route Get api/profile/all
 *desc 获取所有人信息 接口地址
 *access 接口是公开的
 */
router.get('/all', async ctx => {
    const errors = {};
    const profiles = await Profile.find({}).populate('user', ['name', 'avatar']);
    if (profiles.length < 1) {
        errors.noprofile = '没有任何用户信息';
        ctx.status = 404;
        ctx.body = errors;
    } else {
        ctx.body = profiles;
    }
});
/**
 *route Got api/profile/experience
 *desc 工作经验填写 接口地址 (每post一次，数组里增加一条对象)
 *access 接口是私有的
 */
router.post(
    '/experience',
    passport.authenticate('jwt', { session: false }),
    async ctx => {
        /**validate */
        //const errors = {};//下面这句的解构起到了定义errors对象的效果
        const { errors, isValid } = validateExperienceInput(ctx.request.body);
        if (!isValid) {
            ctx.status = 400;//bad request
            ctx.body = errors;
            return;
        }
        const profileFields = {};
        profileFields.experience = [];
        const profile = await Profile.find({ user: ctx.state.user.id });
        if (profile.length > 0) {
            const newExp = {
                title: ctx.request.body.title,
                current: ctx.request.body.current,
                company: ctx.request.body.company,
                location: ctx.request.body.location,
                from: ctx.request.body.from,
                to: ctx.request.body.to,
                description: ctx.request.body.description,
            };
            profileFields.experience.unshift(newExp)
            //unshift(),数组方法向数组的开头添加一个或更多元素，并返回新的长度
            //将新项添加到数组末尾，请使用 push() 方法。
            const profileUpdate = await Profile.update(
                { user: ctx.state.user.id },
                { $push: { experience: profileFields.experience } },
                { $sort: 1 }
            );
            //ctx.body = profileUpdate;
            if (profileUpdate.ok == 1) {
                const profile = await Profile.find({ user: ctx.state.user.id })
                    .populate('user', ['name', 'avatar']);
                if (profile) {
                    ctx.status = 200;
                    ctx.body = profile;
                }
            }
        } else {
            errors.noprofile = '没有该用户信息';
            ctx.status = 404;
            ctx.body = errors;
        }
    }
);
/**
 *route Got api/profile/education
 *desc 教育填写 接口地址 （同一个界面存储和更新并存，但不能往数组添加多个对象）
 *access 接口是私有的
 */
router.post(
    '/education',
    passport.authenticate('jwt', { session: false }),
    async ctx => {
        /**validate */
        //const errors = {};//下面这句的解构起到了定义errors对象的效果
        const { errors, isValid } = validateEducationInput(ctx.request.body);
        if (!isValid) {
            ctx.status = 400;//bad request
            ctx.body = errors;
            return;
        }
        const profileFields = {};
        profileFields.education = [];
        const profile = await Profile.find({ user: ctx.state.user.id });
        if (profile.length > 0) {
            const newEdu = {
                school: ctx.request.body.school,
                current: ctx.request.body.current,
                degree: ctx.request.body.degree,
                filedofstudy: ctx.request.body.filedofstudy,
                from: ctx.request.body.from,
                to: ctx.request.body.to,
                description: ctx.request.body.description,
            };
            profileFields.education.unshift(newEdu)
            //unshift(),数组方法向数组的开头添加一个或更多元素，并返回新的长度
            //将新项添加到数组末尾，请使用 push() 方法。
            const profileUpdate = await Profile.findOneAndUpdate(
                { user: ctx.state.user.id },
                { $set: profileFields },
                { new: true }
            );
            ctx.body = profileUpdate;
        } else {
            errors.noprofile = '没有该用户信息';
            ctx.status = 404;
            ctx.body = errors;
        }
    }
);
/**
 *route DELETE api/profile/experience?exp_id=<>
 *desc 删除工作经验 接口地址
 *access 接口是私有的
 */
router.delete(
    '/experience',
    passport.authenticate('jwt', { session: false }),
    async ctx => {
        //拿到id
        const exp_id = ctx.query.exp_id;
        //查询 
        const profile = await Profile.find({ user: ctx.state.user.id });
        if (profile[0].experience.length > 0) {
            //找元素下标 indexOf() 
            //方法可返回某个指定的字符串值在字符串中首次出现的位置。
            const removeIndex = profile[0].experience
                .map(item => item.id)
                .indexOf(exp_id);
            //删除
            //splice() 方法用于添加或删除数组中的元素。
            profile[0].experience.splice(removeIndex, 1);
            //更新数据库
            const profileUpdate = await Profile.findOneAndUpdate(
                { user: ctx.state.user.id },
                { $set: profile[0] },
                { new: true }
            );
            ctx.body = profileUpdate;
        } else {
            ctx.status = 404;
            ctx.body = { errors: '没有任何数据' };
        }
    }
);
/**
 * @ route DELETE api/profile
 * @ desc 删除整个用户接口地址 （慎用！）本接口还未用postman测试过
 * @ access 接口是私有的
 */
router.delete(
    '/',
    passport.authenticate('jwt', { session: false }),
    async ctx => {
        const profile = await Profile.deleteOne({ user: ctx.state.user.id });
        if (profile.ok == 1) {
            const user = await User.deleteOne({ _id: ctx.state.user.id });
            if (user.ok == 1) {
                ctx.status = 200;
                ctx.body = { success: true };
            } else {
                ctx.status = 404;
                ctx.body = { error: 'profile不存在' };
            }
        }
    }
)
/**导出*/
module.exports = router.routes();
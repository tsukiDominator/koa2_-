const Router = require('koa-router');
const router = new Router();
const Post = require('../../models/Post');
const passport = require('koa-passport');
const validatePostInput = require('../../validation/post');
const Profile = require('../../models/Profile');

/**
 *route Get api/posts/test
 *desc 测试接口地址
 *access 接口是公开的
 */
router.get('/test', async ctx => {
    ctx.status = 200;
    ctx.body = { msg: "test works..." };
});

/**
 *route Get api/posts/test
 *desc 创建留言接口地址
 *access 接口是私有的
 */
router.post(
    '/',
    passport.authenticate('jwt', { session: false }),
    async ctx => {
        const { errors, isValid } = validatePostInput(ctx.request.body);
        if (!isValid) {
            ctx.status = 400;
            ctx.body = errors;
            return;
        }
        const newpost = {
            text: ctx.request.body.text,
            name: ctx.state.user.name,
            avatar: ctx.state.user.avatar,
            user: ctx.state.user.id
        }
        /**写法一 */
        let result = await Post.create(newpost);
        ctx.body = result;
        /**写法二 （不要使用）*/
        // let result = await Post.create(cfg)
        //     .then(doc => { ctx.body = doc; })
        /**写法二可行是因为它在末尾，await失效也无所谓了 */
    });

/**
 *route Get api/posts/all
 *desc 获取所有留言接口地址
 *access 接口是公开的
 */
router.get('/all', async ctx => {
    await Post
        .find()
        .sort({ data: -1 })//按时间最新的排列
        .then(doc => {
            ctx.status = 200;
            ctx.body = doc;
        })
        .catch(err => {
            ctx.status = 404;
            ctx.body = { nopostfound: '找不到任何留言信息' }
        })
});

/**
 *route Get api/posts?id=<>
 *desc 获取单个留言接口地址
 *access 接口是公开的
 */
router.get('/', async ctx => {
    const id = ctx.query.id;
    /**
     * @warn 下面这么写，即使result能查到东西，res依然显示：nopostfound: '没有留言信息'。因此永远不要将await和then连用
     * @infer .then会让await失效
     */
    // let result = await Post.findById(id)
    //     .then(doc => {
    //         ctx.status = 200;
    //         ctx.body = doc;
    //     })
    // if (!result) {
    //     ctx.status = 404;
    //     ctx.body = { nopostfound: '没有留言信息' }
    // }
    let result = await Post.findById(id)
    if (!result) {
        ctx.status = 404;
        ctx.body = { nopostfound: '没有留言信息' }
    } else {
        ctx.status = 200;
        ctx.body = result;
    }
});

/**
 *route Get api/posts?id=<>
 *desc 删除单个留言接口地址
 *access 接口是私有的
 */
router.delete(
    '/',
    passport.authenticate('jwt', { session: false }),
    async ctx => {
        const id = ctx.query.id;
        //当前用户是否拥有个人信息
        const profile = await Profile.find({ user: ctx.state.user.id });
        if (profile.length > 0) {
            //查找此人的留言
            const post = await Post.findById(id);
            console.log(post);
            if (!post) {
                ctx.body = { msg: '该评论不存在/已删除' };
                return;
            }
            //判断是不是当前用户操作
            if (post.user.toString() !== ctx.state.user.id) {
                ctx.status = 401;
                ctx.body = { notauyhorized: '用户非法操作' };
                return;
            }
            await Post.remove({ _id: id }).then(() => {
                ctx.status = 200;
                ctx.body = { success: true };
            })
        } else {
            ctx.status = 404;
            ctx.body = { error: '个人信息不存在' };
        }
    }
);

/**
*route Post api/posts/like?id=<>
*desc 点赞接口地址
*access 接口是私有的
*/
router.post(
    '/like',
    passport.authenticate('jwt', { session: false }),
    async ctx => {
        const id = ctx.query.id;
        //只允许填写过用户信息的用户点赞
        const profile = await Profile.find({ user: ctx.state.user.id });
        if (profile.length > 0) {
            const post = await Post.findById(id);
            const isLike =
                post.likes.filter(like => like.user.toString() === ctx.state.user.id)
                    .length > 0;
            if (isLike) {
                ctx.status = 400;
                ctx.body = { alreadyliked: '请勿重复点赞' };
                return;
            }
            post.likes.unshift({ user: ctx.state.user.id });
            //更新数据库
            const postUpdate = await Post.findOneAndUpdate(
                { _id: id },
                { $set: post },
                { new: true }
            );
            ctx.body = postUpdate;
        } else {
            ctx.status = 404;
            ctx.body = { error: '请先填写个人信息' };
        }
    }
);

/**
*route Post api/posts/like?id=<>
*desc 取消点赞接口地址
*access 接口是私有的
*/
router.post(
    '/unlike',
    passport.authenticate('jwt', { session: false }),
    async ctx => {
        const id = ctx.query.id;
        //只允许填写过用户信息的用户点赞
        const profile = await Profile.find({ user: ctx.state.user.id });
        if (profile.length > 0) {
            const post = await Post.findById(id);
            const isLike =
                post.likes.filter(like => like.user.toString() === ctx.state.user.id)
                    .length === 0;
            if (isLike) {
                ctx.status = 400;
                ctx.body = { alreadyliked: '还没有点赞你取消你马？' };
                return;
            }
            //获取要删掉的点赞在like数组中的位置
            const removeIndex = post.likes
                .map(item => item.user.toString())
                .indexOf(id);
            //删除
            post.likes.splice(removeIndex, 1)
            //更新数据库
            const postUpdate = await Post.findOneAndUpdate(
                { _id: id },
                { $set: post },
                { new: true }
            );
            ctx.body = postUpdate;
        } else {
            ctx.status = 404;
            ctx.body = { error: '请先填写个人信息' };
        }
    }
);

/**
*route Post api/posts/comment?id=<>
*desc 添加评论接口地址
*access 接口是私有的
*/
router.post(
    '/comment',
    passport.authenticate('jwt', { session: false }),
    async ctx => {
        const id = ctx.query.id;
        const post = await Post.findById(id);
        const newComment = {
            text: ctx.request.body.text,
            name: ctx.state.user.name,
            avatar: ctx.state.user.avatar,
            user: ctx.state.user.id
        };
        post.comments.unshift(newComment);
        const postUpdate = await Post.findOneAndUpdate(
            { _id: id },
            { $set: post },
            { new: true }
        );
        ctx.body = postUpdate;
    }
);

/**
*route Delete api/posts/comment?id=<>&comment_id=<>
*desc 删除评论接口地址
*access 接口是私有的
*/
router.delete(
    '/comment',
    passport.authenticate('jwt', { session: false }),
    async ctx => {
        const id = ctx.query.id;
        const comment_id = ctx.query.comment_id;

        const post = await Post.findById(id);
        const isComment = post.comments.filter(comment => comment.id.toString() === comment_id)
            .length
        if (!isComment) {
            ctx, status = 400;
            ctx.body = { error: '该评论不存在' };
            return;
        }
        //找到该评论信息
        const removeIndex = post.comments
            .map(item => item._id.toString())
            .indexOf(comment_id);
        //删除
        post.comments.splice(removeIndex, 1);
        const postUpdate = await Post.findByIdAndUpdate(
            { _id: id },
            { $set: post },
            { new: true }
        );
        ctx.body = postUpdate;
    }
);

module.exports = router.routes();
var router = require('express')
  .Router(),
  svgCaptcha = require('svg-captcha'),
  crypto = require('crypto'),
  accountModel = require('../model/accountModel');
  
function md5hex(code) {
  return crypto.createHash('md5').update(code).digest('hex');
}

// 获取验证码
router.get('/captcha', (req, res) => {
  let captcha = svgCaptcha.create({ fontSize: 50, width: 100 });
  req.session.captcha = captcha.text.toLowerCase();
  res.setHeader('Content-Type', 'image/svg+xml');
  res.write(String(captcha.data));
  res.end();
});

// 注册
router.post('/register_blog', (req, res) => {
  let body = req.body;
  if(body.proof) {
    req.session.captcha == body.proof ? "" : res.json({"status": "error", "code": "验证码不正确"});
  } else {
    res.json({"status": "error", "code": "验证码不为空"});
  }
  if(!body.username || !body.password) {
    res.json({"status": "error", "code": "参数错误"});
  } else {
    accountModel.findUser(body.username, (err, result) => {
      if(err) {
        res.json({"status": "error", "code": "查询错误"});
      } else {
        if(result && result.length == 0){
          (new accountModel({username: body.username, password: md5hex(body.password), regtime: (new Date()).getTime()})).save((err, r) => {
            if(err) {
              res.json({"status": "error", "code": "插入数据库失败"});
            } else {
              res.json({"status": "ok", "code": "成功"});
            }
          })
        }
      }
    })
  }
})

module.exports = router;
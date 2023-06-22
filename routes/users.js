var express = require('express');
const {roles} = require("./roles")
var router = express.Router();

/* GET users listing. */
router.get('/api', function(req, res, next) {
  let data = {...roles}
  if(req.query.text)
  {
    const temp = roles.body.filter(x=>x.job_title.toLocaleLowerCase().includes(req.query.text.toLocaleLowerCase()))
    data.body= temp
  }
  res.json(data)
 
});

module.exports = router;

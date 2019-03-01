//로그인->회원등록->postlist (o)
//로그인->postlist (o)
//app.post('/upload') (o)
//app.get('/postlist') (o)


//express
var express=require('express');
var app=express();
app.listen(3000,function(){
  console.log('Connected 3000 port!!!');
})

//template engine setting
app.set('view engine','jade');
app.set('views','./');
app.locals.pretty=true;

//bodyparser for register.jade
var bodyParser=require('body-parser');
app.use(bodyParser.urlencoded({extended:false}));

//fs setting
var fs=require('fs');

//static setting for postlist
app.use('/picture',express.static(__dirname+'/picture'));
//__dirname은 node.js에서 제공하는 node 파일의 경로를 담고있는 변수

//데이터베이스 setting
var mysql=require('mysql');
var conn=mysql.createConnection({
  host      : 'localhost',
  user      : 'root',
  password  : '111111',
  database  : 'picupsimple'
});
conn.connect();

//세션 setting
var session=require('express-session');
var MySQLStore=require('express-mysql-session')(session);
app.use(session({
  secret            : '!@#!@#%23412@#$^*',
  resave            : false,
  saveUninitialized : true,
  store             : new MySQLStore({
    host      : 'localhost',
    port      : 3306,
    user      : 'root',
    password  : '111111',
    database  : 'picupsimple'
  })
}));

//passport setting
var mID=null;
var passport=require('passport');
var FacebookStrategy=require('passport-facebook').Strategy;
app.use(passport.initialize());
app.use(passport.session());
passport.serializeUser(function(user,done){
  done(null,user.memberID);
});
passport.deserializeUser(function(id,done){
  var sql='SELECT * FROM member WHERE memberID=?';
  conn.query(sql,[id],function(err,results){
    if(err){
      done('There is no user');
    }else{
      mID=id;
      done(null,results[0]);
    }
  })
})

//multer for upload
var multer=require('multer');
var uploadImgName=null;
var storage=multer.diskStorage({
  destination : function(req,file,cb){
    cb(null,'upload/');
  },
  filename : function(req,file,cb){
    uploadImgName=mID+'_'+Date.now()+'_'+file.originalname;
    cb(null,uploadImgName);
  }
});
var upload=multer({storage:storage});

//로그인 라우팅
app.get('/auth/login',function(req,res){
  var output=`
    <h1>Login</h1>
    <ul>
      <li><a href="/auth/facebook">Facebook</a></li>
    </ul>
  `;
  res.send(output);
})

//member 객체
var member={
  memberID : null,
  memberName : null,
  email : null,
  account : null,
  birth : null,
  gender : null,
  memberProfile : null
};

//Facebook 라우팅
app.get('/auth/facebook',
  passport.authenticate(
    'facebook',
    { scope : 'email'}
  )
);
app.get('/auth/facebook/callback',
  passport.authenticate(
    'facebook',
    { failureRedirect: '/auth/register' }),
  function(req, res) {
    // Successful authentication, redirect home.
    res.redirect('/postlist');
  }
);

//Facebook Strategy
passport.use(new FacebookStrategy({
  clientID      : '396064287623425',
  clientSecret  : '8b645b3ed3d230f4b0d66b746dd10850',
  callbackURL   : "/auth/facebook/callback",
  profileFields : ['id','email','gender','link','locale','name','timezone','updated_time','verified','displayName']
},
  function(accessToken,refreshToken,profile,done){
    member.memberID=profile.id;
    member.account=profile.email;
    var memberId=member.memberID;
    var sql='SELECT * FROM member WHERE memberID=?';
    conn.query(sql, [memberId],function(err,results){
      if(results.length>0){ //이미 존재하는 사용자
        done(null,results[0]);
      }else{  //존재하지 않는 사용자
        done(null,false);
      }
    })
  }
));

//register 라우팅
app.get('/auth/register',function(req,res){
  res.render('register');
})
app.post('/auth/register',function(req,res){
  //사용자가 입력한 값 member배열에 넣기
  member.memberName=req.body.memberName;
  member.email=req.body.email;
  member.birth=req.body.birth;
  member.gender=req.body.gender;
  if(member.account===undefined){
    member.account=member.email;
  }
  //console.log(member);
  var sql='INSERT INTO member SET ?';
  conn.query(sql,member,function(err,results){
    if(err){
      console.log(err);
      res.status(500);
    }else{
      req.login(member,function(err){
        req.session.save(function(){
          res.redirect('/postlist');
        })
      })
    }
  });
})

//postlist 라우팅
var imgs=null;      //이미지 이름을 담은 배열
var isPush=false;
app.get('/postlist',function(req,res){
  console.log('This memberID:'+mID);
  var sql='SELECT * FROM pictureupload WHERE memberID=?';
  conn.query(sql,[mID],function(err,rows,fields){
    if(err){
      console.log(err);
    }else{
      for(var i=0;i<rows.length;i++){
        var buffer=new Buffer(rows[i].image,'binary');
        var imageName=rows[i].pictureID;
        fs.writeFile('picture/'+imageName+'.jpg',buffer,function(err,written){
          if(err){
            console.log(err);
          }else{
            console.log("Image Successfully written");
          }
        });
      }
    }
    conn.query(sql,[mID],function(err,rows,fields){
      imgs=[];
      for(var j=0;j<rows.length;j++){
        imgs.push(rows[j].pictureID);
      }
      console.log(imgs);
      res.render('postlist',{images:imgs});
    });
  });
})

//사진업로드 라우팅
var pictureupload={
  pictureID : null,
  image : null,
  thumnail : null,
  geo : '부산광역시',  //나중에 아두이노 gps로 받을 정보
  connect : true,
  memberID : null
}
app.get('/upload',function(req,res){
  console.log('this memberID : '+mID);
  res.render('picupload');
})
var getFilesizeInBytes = function getFilesizeInBytes(filename) {
  var stats = fs.statSync(filename);
  var fileSizeInBytes = stats.size;
  return fileSizeInBytes;
};
app.post('/upload',upload.single('userfile'),function(req,res){
  var path=__dirname+'/upload/'+uploadImgName;
  pictureupload.pictureID=uploadImgName;
  pictureupload.memberID=mID;
  fs.open(path,'r',function(status,fd){
    if(status){
      console.log(status.message);
    }else{
      var length=getFilesizeInBytes(path);
      var buffer=new Buffer(length);
      fs.read(fd,buffer,0,length,0,function(err,num){
        var sql='INSERT INTO pictureupload SET ?';
        pictureupload.image=buffer;
        pictureupload.thumnail=buffer;
        conn.query(sql,pictureupload,function(err,results){
          if(err){
            console.log(err);
          }else{
            console.log('업로드 성공');
            res.redirect('/postlist');
          }
        });
      });
    }
  });
})

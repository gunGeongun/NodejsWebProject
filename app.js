// app.js.
//1926005 김건
//socket.io , Passport , Login ,deleteAll추가
"use strict";

/**
 * =====================================================================
 * Define Express app and set it up
 * =====================================================================
 */

// modules
const express = require("express"), // express를 요청
  layouts = require("express-ejs-layouts"), // express-ejs-layout의 요청
  app = express(),
  http = require('http').createServer(app),
  io = require('socket.io')(http); // express 애플리케이션의 인스턴스화

// controllers 폴더의 파일을 요청
const pagesController = require("./controllers/pagesController"),
  subscribersController = require("./controllers/subscribersController"),
  usersController = require("./controllers/usersController"),
  coursesController = require("./controllers/coursesController"),
  talksController = require("./controllers/talksController"),
  trainsController = require("./controllers/trainsController"),
  musicController = require("./controllers/musicController"),
  errorController = require("./controllers/errorController");

/**
 * =====================================================================
 * Define Mongoose and MongoDB connection
 * =====================================================================
 */
const port = process.env.PORT || 3000;
// 애플리케이션에 Mongoose 설정
const mongoose = require("mongoose"), // mongoose를 요청
  dbName = "ut-nodejs";

// 데이터베이스 연결 설정
mongoose.connect(`mongodb://127.0.0.1:27017/${dbName}`, {
  useNewUrlParser: true,
});

// 연결되면 메시지를 보냄
const db = mongoose.connection;
db.once("open", () => {
  console.log(`Connected to ${dbName} MongoDB using Mongoose!`);
});

/**
 * =====================================================================
 * Define app settings and middleware
 * =====================================================================
 */
const methodOverride = require("method-override");
app.use(
  methodOverride("_method", {
    methods: ["GET", "POST"],
  })
);


app.set("port", process.env.PORT || 3000);

// ejs 레이아웃 렌더링
app.set("view engine", "ejs"); // ejs를 사용하기 위한 애플리케이션 세팅
app.use(layouts); // layout 모듈 사용을 위한 애플리케이션 세팅
app.use(express.static("public"));

// body-parser의 추가
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

/**
 * =====================================================================
 * Define routes
 * =====================================================================
 */

const router = express.Router(); // Express 라우터를 인스턴스화
app.use("/", router); // 라우터를 애플리케이션에 추가
const expressSession = require("express-session"),
  cookieParser = require("cookie-parser"),
  connectFlash = require("connect-flash"),
  expressValidator = require("express-validator"); // Lesson 23 - express-validator 미들웨어를 요청

router.use(cookieParser("secret_passcode")); // cookie-parser 미들웨어를 사용하고 비밀 키를 전달
router.use(
  expressSession({
    // express-session 미들웨어를 사용
    secret: "secret_passcode", // 비밀 키를 전달
    cookie: {
      maxAge: 4000000, // 쿠키의 유효 기간을 설정
    },
    resave: false, // 세션을 매번 재저장하지 않도록 설정
    saveUninitialized: false, // 초기화되지 않은 세션을 저장하지 않도록 설정
  })
);
router.use(connectFlash()); // connect-flash 미들웨어를 사용

//passport
const passport = require("passport");
router.use(passport.initialize());
router.use(passport.session());
const User = require("./models/User");
passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
router.use((req, res, next) => {
  // 응답 객체상에서 플래시 메시지의 로컬 flashMessages로의 할당
  res.locals.flashMessages = req.flash(); // flash 메시지를 뷰에서 사용할 수 있도록 설정
  res.locals.loggedIn = req.isAuthenticated();
  res.locals.currentUser = req.user;
  next();
});
router.use(expressValidator());
/**
 * Pages
 */
router.get("/", pagesController.showHome); // 홈 페이지 위한 라우트 추가
router.get("/about", pagesController.showAbout); // 코스 페이지 위한 라우트 추가
router.get("/transportation", pagesController.showTransportation); // 교통수단 페이지 위한 라우트 추가

/**
 * Subscribers
 */
router.get(
  "/subscribers",
  subscribersController.index,
  subscribersController.indexView
); // index 라우트 생성
router.get("/subscribers/new", subscribersController.new); // 생성 폼을 보기 위한 요청 처리
router.post(
  "/subscribers",
  subscribersController.create,
  subscribersController.redirectView
); // 생성 폼에서 받아온 데이터의 처리와 결과를 사용자 보기 페이지에 보여주기
router.get(
  "/subscribers/:id",
  subscribersController.show,
  subscribersController.showView
);
router.get("/subscribers/:id/edit", subscribersController.edit); // viewing을 처리하기 위한 라우트 추가
router.put(
  "/subscribers/:id/update",
  subscribersController.update,
  subscribersController.redirectView
); // 편집 폼에서 받아온 데이터의 처리와 결과를 사용자 보기 페이지에 보여주기
router.delete(
  "/subscribers/:id/delete",
  subscribersController.delete,
  subscribersController.redirectView
);
router.delete(
  "/subscribers/deleteAll",
  subscribersController.deleteAll,
  subscribersController.redirectView
);
/**
 * Users 로그인
 */
router.get("/users/login", usersController.login);
router.post(
  "/users/login",
  usersController.authenticate,
  usersController.redirectView
);
router.get(
  "/users/logout",
  usersController.logout,
  usersController.redirectView
);
/**
 * Users
 */
router.get("/users", usersController.index, usersController.indexView); // index 라우트 생성
router.get("/users/new", usersController.new); // 생성 폼을 보기 위한 요청 처리
router.post(
  "/users/create",
  usersController.validate,
  usersController.create,
  usersController.redirectView
); // 생성 폼에서 받아온 데이터의 처리와 결과를 사용자 보기 페이지에 보여주기
router.get("/users/:id", usersController.show, usersController.showView);
router.get("/users/:id/edit", usersController.edit); // viewing을 처리하기 위한 라우트 추가
router.put(
  "/users/:id/update",
  usersController.update,
  usersController.redirectView
); // 편집 폼에서 받아온 데이터의 처리와 결과를 사용자 보기 페이지에 보여주기
router.delete(
  "/users/:id/delete",
  usersController.delete,
  usersController.redirectView
);
router.delete(
  "/users/deleteAll",
  usersController.deleteAll,
  usersController.redirectView
);
/**
 * Courses
 */
router.get("/courses", coursesController.index, coursesController.indexView); // index 라우트 생성
router.get("/courses/new", coursesController.new); // 생성 폼을 보기 위한 요청 처리
router.post(
  "/courses",
  coursesController.create,
  coursesController.redirectView
); // 생성 폼에서 받아온 데이터의 처리와 결과를 사용자 보기 페이지에 보여주기
router.get("/courses/:id", coursesController.show, coursesController.showView);
router.get("/courses/:id/edit", coursesController.edit); // viewing을 처리하기 위한 라우트 추가
router.put(
  "/courses/:id/update",
  coursesController.update,
  coursesController.redirectView
); // 편집 폼에서 받아온 데이터의 처리와 결과를 사용자 보기 페이지에 보여주기
router.delete(
  "/courses/:id/delete",
  coursesController.delete,
  coursesController.redirectView
);
router.delete(
  "/courses/deleteAll",
  coursesController.deleteAll,
  coursesController.redirectView
);
/**
 * Talks
 */
// router.get("/talks", talksController.index, talksController.indexView); // 모든 토크를 위한 라우트 추가
// router.get("/talk/:id", talksController.show, talksController.showView); // 특정 토크를 위한 라우트 추가
router.get("/talks", talksController.index, talksController.indexView); // index 라우트 생성
router.get("/talks/new", talksController.new); // 생성 폼을 보기 위한 요청 처리
router.post(
  "/talks/create",
  talksController.create,
  talksController.redirectView
); // 생성 폼에서 받아온 데이터의 처리와 결과를 사용자 보기 페이지에 보여주기
router.get("/talks/:id", talksController.show, talksController.showView);
router.get("/talks/:id/edit", talksController.edit); // viewing을 처리하기 위한 라우트 추가
router.put(
  "/talks/:id/update",
  talksController.update,
  talksController.redirectView
); // 편집 폼에서 받아온 데이터의 처리와 결과를 사용자 보기 페이지에 보여주기
router.delete(
  "/talks/:id/delete",
  talksController.delete,
  talksController.redirectView
);
router.delete(
  "/talks/deleteAll",
  talksController.deleteAll,
  talksController.redirectView
);

/**
 * Trains
 */
router.get("/trains", trainsController.index, trainsController.indexView); // index 라우트 생성
router.get("/trains/new", trainsController.new); // 생성 폼을 보기 위한 요청 처리
router.post(
  "/trains/create",
  trainsController.create,
  trainsController.redirectView
); // 생성 폼에서 받아온 데이터의 처리와 결과를 사용자 보기 페이지에 보여주기
router.get("/trains/:id", trainsController.show, trainsController.showView);
router.get("/trains/:id/edit", trainsController.edit); // viewing을 처리하기 위한 라우트 추가
router.put(
  "/trains/:id/update",
  trainsController.update,
  trainsController.redirectView
); // 편집 폼에서 받아온 데이터의 처리와 결과를 사용자 보기 페이지에 보여주기
router.delete(
  "/trains/:id/delete",
  trainsController.delete,
  trainsController.redirectView
);
/**
 * Music
 */
router.get("/music", musicController.index, musicController.indexView); // index 라우트 생성
router.get("/music/new", musicController.new); // 생성 폼을 보기 위한 요청 처리
router.post("/music", musicController.create, musicController.redirectView); // 생성 폼에서 받아온 데이터의 처리와 결과를 사용자 보기 페이지에 보여주기
router.get("/music/:id", musicController.show, musicController.showView);
router.get("/music/:id/edit", musicController.edit); // viewing을 처리하기 위한 라우트 추가
router.put(
  "/music/:id/update",
  musicController.update,
  musicController.redirectView
); // 편집 폼에서 받아온 데이터의 처리와 결과를 사용자 보기 페이지에 보여주기
router.delete(
  "/music/:id/delete",
  musicController.delete,
  musicController.redirectView
);
router.delete(
  "/music/deleteAll",
  musicController.deleteAll,
  musicController.redirectView
);
/**
 * =====================================================================
 * Errors Handling & App Startup
 * =====================================================================
 */
/**
 * Chatting (socket.io)
 */
router.get("/chat",(req,res)=>{
  res.render("chat")
})

// 클라이언트가 연결되었을 때 실행
io.on('connection', (socket) => {
  console.log('A user connected');

  // 클라이언트로부터 메시지를 받았을 때 실행
  socket.on('chat message', (msg) => {
    console.log('Message:', msg);

    // 모든 클라이언트에게 메시지 전송
    io.emit('chat message', msg);
  });

  // 클라이언트가 연결을 끊었을 때 실행
  socket.on('disconnect', () => {
    console.log('A user disconnected');
  });
});
app.use(errorController.resNotFound); // 미들웨어 함수로 에러 처리 추가
app.use(errorController.resInternalError);

http.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
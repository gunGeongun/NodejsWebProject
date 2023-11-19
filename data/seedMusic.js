// seedCourses.js
"use strict";

/**
 * Listing 15.9 (p. 224)
 */
const mongoose = require("mongoose"),
  Music= require("../models/Music");

// 데이터베이스 연결 설정
mongoose.connect("mongodb://127.0.0.1:27017/ut-nodejs", {
  useNewUrlParser: true,
});

mongoose.connection;

var music = [
  {
    name:"Lost stars",
    genre:"popsong",
    singer:"Adam Levine",
    songlength: 90
  },
  {
    name:"Lay me Down",
    genre:"popsong",
    singer:"Sam Smith",
    songlength: 120
  },
  {
    name:"Let it go",
    genre:"ost",
    singer:"Elsa",
    songlength: 140
  },
  {
    name:"stay",
    genre:"edm",
    singer:"Zedd",
    songlength: 80
  },
];

var commands = [];

// 1. Delete all previous data. / 이전 데이터 모두 삭제
// 2. Set a timeout to allow the database to be cleared. / 데이터베이스가 지워지는 것을 기다리기 위해 타임아웃 설정
// 3. Create a promise for each courses object. / 코스 객체마다 프라미스 생성.
// 4. Use Promise.all() to wait for all promises to resolve. / 모든 프라미스가 해결될 때까지 기다리기 위해 Promise.all() 사용.
// 5. Close the connection to the database. / 데이터베이스 연결 닫기.

Music.deleteMany({})
  .exec()
  .then((result) => {
    console.log(`Deleted ${result.deletedCount} music records!`);
  });

setTimeout(() => {
  // 프라미스 생성을 위한 구독자 객체 루프
  music.forEach((c) => {
    commands.push(
      Music.create({
        
        name:c.name,
        genre:c.genre,
        singer:c.singer,
        songlength:c.songlength
      }).then((music) => {
        console.log(`Created music: ${music.name}`);
      })
    );
  });

  console.log(`${commands.length} commands created!`);

  Promise.all(commands)
    .then((r) => {
      console.log(JSON.stringify(r));
      mongoose.connection.close();
      console.log("Connection closed!");
    })
    .catch((error) => {
      console.log(`Error: ${error}`);
    });
}, 500);

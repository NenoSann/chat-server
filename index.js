"use strict";
exports.__esModule = true;
var express_1 = require("express");
var app = (0, express_1["default"])();
var port = 3000;
app.get('/', function (req, res) {
    res.send('Express + typescript!');
});

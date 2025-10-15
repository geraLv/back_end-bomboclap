"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = errorHandler;
const AppErrors_1 = require("../errors/AppErrors");
const HttpStatus_1 = require("../http/HttpStatus");
function errorHandler(err, _req, res, _next) {
    if (err instanceof AppErrors_1.AppError) {
        return res
            .status(err.status)
            .json({ error: err.message, details: err.details });
    }
    console.error(err);
    return res
        .status(HttpStatus_1.HttpStatus.INTERNAL)
        .json({ error: "Internal Server Error" });
}

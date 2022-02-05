"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
const PORT = process.env.PORT || 3001;
express_1.default()
    .use(express_1.default.static(path_1.default.join(__dirname, '../typescriptclient/build')))
    .get("/api", (req, res) => {
    res.json({ message: "Hello from server updated!" });
})
    .get('*', (req, res) => {
    res.sendFile(path_1.default.resolve(__dirname, '../typescriptclient/build', 'index.html'));
})
    .listen(PORT, () => console.log(`Listening on ${PORT}`));

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
class User {
    constructor(id, name, last_name, phone, email, role, createdAt = new Date()) {
        this.id = id;
        this.name = name;
        this.last_name = last_name;
        this.phone = phone;
        this.email = email;
        this.role = role;
        this.createdAt = createdAt;
    }
}
exports.User = User;

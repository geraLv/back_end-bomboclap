"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthUser = void 0;
class AuthUser {
    constructor(email, password, metadata, email_confirm, create_at = new Date()) {
        this.email = email;
        this.password = password;
        this.metadata = metadata;
        this.email_confirm = email_confirm;
        this.create_at = create_at;
    }
}
exports.AuthUser = AuthUser;

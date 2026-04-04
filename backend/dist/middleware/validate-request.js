"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateRequest = validateRequest;
function validateRequest(schemas) {
    return (req, _res, next) => {
        if (schemas.body) {
            req.body = schemas.body.parse(req.body);
        }
        if (schemas.query) {
            const parsedQuery = schemas.query.parse(req.query);
            Object.assign(req.query, parsedQuery);
        }
        if (schemas.params) {
            const parsedParams = schemas.params.parse(req.params);
            Object.assign(req.params, parsedParams);
        }
        next();
    };
}

"use strict";
/*
 * Copyright (c) 2025 Nebulit GmbH
 * Licensed under the MIT License.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseEndpoint = parseEndpoint;
exports.parseQueryEndpoint = parseQueryEndpoint;
const serviceURI = "http://localhost:3000";
function parseEndpoint(endpoint, data) {
    var parsedEndpoint = (endpoint === null || endpoint === void 0 ? void 0 : endpoint.startsWith("/")) ? endpoint.substring(1) : endpoint;
    return serviceURI + "/" + lowercaseFirstCharacter(parsedEndpoint).replace(/{(\w+)}/g, (match, param) => {
        return param && data && data[param] !== undefined ? data[param] : match;
    });
}
function parseQueryEndpoint(endpoint, queries) {
    const parsedEndpoint = endpoint.startsWith("/")
        ? endpoint.substring(1)
        : endpoint;
    const basePath = serviceURI + "/api/query/" + parsedEndpoint;
    const queryString = queries
        ? "?" + new URLSearchParams(filterEmptyEntries(queries)).toString()
        : "";
    return basePath + queryString;
}
function filterEmptyEntries(queries) {
    if (!queries)
        return {};
    return Object.fromEntries(Object.entries(queries).filter(([key, value]) => value !== ""));
}
function lowercaseFirstCharacter(inputString) {
    // Check if the string is not empty
    if ((inputString === null || inputString === void 0 ? void 0 : inputString.length) > 0) {
        // Capitalize the first character and concatenate the rest of the string
        return inputString.charAt(0).toLowerCase() + inputString.substring(1);
    }
    else {
        // Return an empty string if the input is empty
        return "";
    }
}

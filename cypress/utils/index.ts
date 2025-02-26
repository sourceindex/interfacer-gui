import { RouteMatcher } from "cypress/types/net-stubbing";

export function randomString(length = 5) {
  let result = "";
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

export function waitForData(requestUrl: RouteMatcher = Cypress.env("NEXT_PUBLIC_ZENFLOWS_URL"), name = "waitForData") {
  // Intercepting request and naming it
  cy.intercept(requestUrl).as(name);
  // Waiting for the request
  cy.wait(`@${name}`);
}

export function randomEmail() {
  return `${randomString()}@${randomString()}.com`;
}

export function getTextInput() {
  return cy.get("input[type=text]");
}

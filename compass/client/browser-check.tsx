import * as React from "react";
import { Notifications } from "./components/notifications";

export function browserCheck() {
  const ua = window.navigator.userAgent
  const msie = ua.indexOf('MSIE ')  // IE < 11
  const trident = ua.indexOf('Trident/')  // IE 11
  const edge = ua.indexOf('Edge')  // Edge
  if (msie > 0 || trident > 0 || edge > 0) {
    Notifications.info(
      <p>
        <b>Your browser does not support all Yametech features. </b>{" "}
        Please consider using another browser.
      </p>
    )
  }
}
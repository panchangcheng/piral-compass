import * as React from 'react';
import 'piral/polyfills';
import { renderInstance } from 'piral';
import { layout, errors } from './layout';
import { themeStore } from "compass-base/client/theme.store";
import "compass-base/client/components/app.scss";
import { render } from 'react-dom';
import {LoginComponent} from './+login'
import {configStore} from "compass-base/client/config.store";

// change to your feed URL here (either using feed.piral.cloud or your own service)
themeStore.setTheme('kontena-light');


if (location.pathname === '/login') {
  render(
    <LoginComponent />,
    document.querySelector('#app'),
  );
}else {
  console.log(configStore.config.clusterName)
  const piral = renderInstance({
    layout,
    errors,
    // requestPilets() {
    //   return new Promise((resolve) => setTimeout(() => resolve([]), 1000));
    // }
    requestPilets() {
      return fetch('http://localhost:9000/api/v1/pilet')
      .then(res => res.json())
      .then(res => res.items);
    }
  });
}






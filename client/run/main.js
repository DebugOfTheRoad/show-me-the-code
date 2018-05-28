import 'babel-polyfill';
import 'zone.js';

import Vue from 'vue';

import App from './App';

new Vue({
  el: '#app',
  render: h => h(App)
});

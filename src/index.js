import {run} from '@cycle/rxjs-run'
import {makeDOMDriver} from '@cycle/dom'
import {App} from './app'
const main = App

const drivers = {
  DOM: makeDOMDriver('#app')
}

run(main, drivers)

import { VNode, div, h2, svg, p, img } from '@cycle/dom'
import Rx from 'rxjs'
import { scaleLinear } from 'd3-scale'
import { Pythagoras } from './pythagoras.js'
import Styles from './app.styles.css';

const svgDimensions = {
    width: 1280,
    height: 600
}

const realMax = 11;

export function App (sources) {
  const scaleFactor = scaleLinear().domain([svgDimensions.height, 0]).range([0, .8]);
  const scaleLean = scaleLinear().domain([0, svgDimensions.width / 2, svgDimensions.width]).range([.5, 0, -.5]);

  const factorAndLean$ = sources.DOM.select('#the-svg').events('mousemove')
        .throttleTime(12)
        .map((mouseEvent) => {
            const { offsetX: x, offsetY: y } = mouseEvent;
            return {
                heightFactor: scaleFactor(y),
                lean: scaleLean(x)
            };
        }, Rx.Scheduler.animationFrame)
        .startWith({ heightFactor: 0, lean: 0 });

  const args$ = Rx.Observable
        .combineLatest(factorAndLean$, Rx.Observable.interval(500).take(realMax), ({ heightFactor, lean }, maxlvl) => ({
            w: 80,
            heightFactor,
            lean,
            x: svgDimensions.width / 2 - 40,
            y: svgDimensions.height - 80,
            lvl: 0,
            maxlvl: maxlvl + 1,
            left: false,
            right: false
        }))

  const pythagoras$ = Pythagoras(args$);

  const vtree$ = pythagoras$.map(x =>
        div(Styles.app, [
            div(Styles.appHeader, [
                img(Styles.appLogo, { attrs: { src: 'cyclejs_logo.svg' } }),
                h2('This is a dancing Pythagoras tree')
            ]),
            p(Styles.appIntro, [
                svg('#the-svg', { attrs: { height: svgDimensions.height, width: svgDimensions.width, style: 'border: 1px solid lightgray' } }, [ x ])
            ])
        ])
    );
  return {
    DOM: vtree$
  }
}

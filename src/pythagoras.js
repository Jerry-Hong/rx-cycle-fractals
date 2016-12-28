import { VNode, svg, h } from '@cycle/dom'
import { interpolateViridis } from 'd3-scale';

Math.deg = radians => {
  return radians * (180 / Math.PI)
}

const memoizedCalc = function () {
    const memo = {};

    const key = ({ w, heightFactor, lean }) => [w,heightFactor, lean].join('-');

    return (args) => {
        const memoKey = key(args);

        if (memo[memoKey]) {
            return memo[memoKey];
        }else{
            const { w, heightFactor, lean } = args;

            const trigH = heightFactor*w;

            const result = {
                nextRight: Math.sqrt(trigH*trigH + (w * (.5+lean))*(w * (.5+lean))),
                nextLeft: Math.sqrt(trigH*trigH + (w * (.5-lean))*(w * (.5-lean))),
                A: Math.deg(Math.atan(trigH / ((.5-lean) * w))),
                B: Math.deg(Math.atan(trigH / ((.5+lean) * w)))
            };

            memo[memoKey] = result;
            return result;
        }
    }
}();



const pythagoras = ({ w, x, y, heightFactor, lean, left = false, right = false, lvl, maxlvl }) => {
    if (lvl >= maxlvl || w < 1) {
        return null;
    }

    const { nextRight, nextLeft, A, B } = memoizedCalc({
        w: w,
        heightFactor: heightFactor,
        lean: lean
    });

    let rotate = '';

    if (left) {
        rotate = `rotate(${-A} 0 ${w})`;
    } else if (right) {
        rotate = `rotate(${B} ${w} ${w})`;
    }

    const leftArgs = {
        w: nextLeft,
        x: 0,
        y: -nextLeft,
        lvl: lvl + 1,
        maxlvl,
        heightFactor,
        lean,
        left: true
    };

    const rightArgs = {
        w: nextRight,
        x: w - nextRight,
        y: -nextRight,
        lvl: lvl + 1,
        maxlvl,
        heightFactor,
        lean,
        right: true
    };

    return h('g', { attrs: { transform: `translate(${x} ${y}) ${rotate}` } }, [
        h('rect', { attrs: { width: w, height: w, x: 0, y: 0, style: `fill: ${interpolateViridis(lvl / maxlvl)}` } }),
        pythagoras(leftArgs),
        pythagoras(rightArgs)
    ])
}


export const Pythagoras = (args$) => args$.map(pythagoras);
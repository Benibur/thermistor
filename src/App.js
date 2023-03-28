import logo from './logo.svg';
import './App.css';

import React from 'react';
import Plot from 'react-plotly.js';
import experimentData from './datasheet';
import { directive } from '@babel/types';
const ExpReg = require('exponential-regression').ExpReg;

// EXPERIMENTAL
const experimentAugmentedData = {
  t: [experimentData.t[0]],
  r: [experimentData.r[0]]
}
for (let i = 1; i < experimentData.t.length; i++) {
  experimentAugmentedData.t.push(experimentData.t[i]-0.5)
  experimentAugmentedData.t.push(experimentData.t[i])
  experimentAugmentedData.r.push((experimentData.r[i-1]+experimentData.r[i])/2)
  experimentAugmentedData.r.push(experimentData.r[i])
}

// EXPERIMENTAL DATA POINTS
const experimentDataPoints = {
  x: experimentData.t,
  y: experimentData.r,
  type:'scatter'
}
const solved = ExpReg.solve(experimentData.t, experimentData.r);
const regData = {
  x: experimentData.t,
  y: experimentData.t.map(t=> solved.a + solved.b * Math.exp(solved.c * t)),
  type:'scatter'
}

// REGRESSION ON A RANGE OF T°
const sliceRegression = (t1, t2) => {
  if (t2===undefined) {
    t2 = experimentData.t[experimentData.t.length-1];
  }
  console.log(`\nfrom ${t1} to  ${t2}`);
  const t1_n = experimentData.t.findIndex(t => t === t1);
  const t2_n = experimentData.t.findIndex(t => t === t2)+1;
  const T = experimentData.t.slice(t1_n, t2_n);
  const R = experimentData.r.slice(t1_n, t2_n);
  const solved = ExpReg.solve(T, R);
  console.log(solved);
  const t2r = t=> solved.a + solved.b * Math.exp(solved.c * t) 
  const r2t = r => 1/solved.c * Math.log((r-solved.a)/solved.b);
  const regData = {
    x: T,
    y: T.map(t2r),
    name: `from ${t1}° to  ${t2}°`,
    type:'scatter'
  }
  const reverseT = R.map(r2t)
  const delta = reverseT.map((tComputed,n) => Math.abs(T[n]-tComputed));
  const deltaMax = delta.reduce((max, d)=> Math.max(max,d),0);
  solved.deltaMax = deltaMax;
  solved.range = `from ${t1}° to  ${t2}°`;
  console.log(`delta max entre t prévue et t mesurée =`, deltaMax);
  console.log('deltas entre t prévue et t mesurée', delta);
  return [regData, solved];

}

// RUN THE REGRESSIONS
const bornes = [-30,5,25,70,100]
const dataPlots = [experimentDataPoints, regData];
const results = [];
bornes.unshift(experimentData.t[0]);
bornes.forEach((b,i)=>{
  const regression = sliceRegression(bornes[i],bornes[i+1]);
  dataPlots.push(regression[0]);
  results.push(regression[1]);
});

class App extends React.Component {
  render() {
    return (
    <div>
      <Plot
        data={dataPlots}
        layout={{
          xaxis: {
            //type: 'log',
            autorange: true
          },
          yaxis: {
            type: 'log',
            autorange: true
          },
          width: 800, height: 500, title: 'R en fonction de T'}}
      />
      <tbody>
        <tr>
          <td>range</td>
          <td>a</td>
          <td>b</td>
          <td>c</td>
          <td>delta max</td>
        </tr>
        {results.map((result, i) =>
          <tr key={i}>
              <td>{result.range}</td>
              <td>{result.a}</td>
              <td>{result.b}</td>
              <td>{result.c}</td>
              <td>{result.deltaMax}</td>
          </tr>
        )}
      </tbody>
    </div>
      
    );
  }
}

export default App;

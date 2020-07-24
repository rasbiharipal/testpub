import { 
  select, 
  csv, 
  scaleLinear, 
  max, 
  scaleBand, 
  axisLeft, 
  axisBottom, 
  format, 
  descending, 
  nest,
  sum
} from 'd3';

const svg = select('svg');

const width = +svg.attr('width');
const height = +svg.attr('height');

const render = data => {
  
  const nested = nest()
    .key(function(d) {return d["Country/Region"];})
    .rollup(function(d) {
        return {
            latestConfirmedCases: sum(d, function(e) { return e["7/22/20"]; }),
            //country: d3.sum(d, function(e) { return e.line2; })
        };
    })
    .entries(data);

	//console.log(nested);
  
	//data = data.sort((a, b) => descending(+a["7/22/20"], +b["7/22/20"])).slice(0,30)
  
  data = nested.sort((a, b) => descending(+a["value"]["latestConfirmedCases"], +b["value"]["latestConfirmedCases"])).slice(0,10)
  
  console.log(data)
  
	const xValue = d => d["value"]["latestConfirmedCases"];
  const yValue = d => d["key"];


  const mergin = {
  	top:60, bottom:85, left:200, right:20
  };
  const innerWidth = width -  mergin.left - mergin.right;
  const innerHeight = height -  mergin.top - mergin.bottom;
  
	const xScale = scaleLinear()
  	.domain([0,max(data, xValue)])
  	.range([0,innerWidth]);
  
  
  
  const yScale = scaleBand()
  	.domain(data.map(yValue))
  	.range([0,innerHeight])
  	.padding(0.11);
  
  
  const g = svg.append('g')
  	.attr('transform',`translate(${mergin.left},${mergin.top})`);
  
  const xAxisTickFormat = number => format('.3s')(number).replace('G','B');
  
  const xAxis = axisBottom(xScale).tickFormat(xAxisTickFormat).tickSize(-innerHeight);
  
  g.append('g').call(axisLeft(yScale))
  	.selectAll('.domain,.tick line')
  		.remove();
  const xAxisG = g.append('g').call(xAxis)
  	.attr('transform',`translate(0,${innerHeight})`);
  
	xAxisG.selectAll('.domain').remove(); 
  
  xAxisG.append('text')
  	.attr('class', 'axis-label')
    .attr('y',70)
  	.attr('x',innerWidth/2)
  	.attr('fill','black')
    .text('Number of Confirmed Cases as on 7/22/2020');
  
  g.selectAll('rect').data(data)
  	.enter().append('rect')
  		.attr('y',d => yScale(yValue(d)))
  		.attr('width',d => xScale(xValue(d)))
  		.attr('height',yScale.bandwidth())
  
  g.append('text')
    .attr('class', 'title')
    .attr('y',-10)
    .text('Top 10 Countries');
  
};

csv('https://github.com/rasbiharipal/testpub/blob/master/data.csv').then(data => {
	data.forEach(d => {
  	d.population=+d.population*1000;
  });
  render(data);
});
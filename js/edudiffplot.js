var w_diff = 800,
	h_diff = 400,
	padding_diff = 50;	

// set up formats
var pctfmt = d3.format("%");

// edudata
edudata = [
	{label: "Wife more educated", value: 0.394},
	{label: "Equal edu attainment", value: 0.317},
	{label: "Husband more educated", value: 0.288}
]

// set up scales
var yScale_e = d3.scale.linear()
	.domain([0, d3.max(edudata, function(d) { return d.value; }) ])
	.range([h_diff, 0]);

// set up y axis
var yAxis_e = d3.svg.axis()
	.scale(yScale_e)
	.orient("right")
	.ticks(10, "%")
	.tickSize(w_diff);

// set up chart
var eduPlot = d3.select("#edudiffplot")
  .append("svg")
	.attr("width", w_diff + padding_diff + padding_diff)
	.attr("height", h_diff + padding_diff + padding_diff)
  .append("g")
  	.attr("transform", "translate(" + padding_diff + ", " + padding_diff + ")");

// set bar width
var barWidth = 100;

// set up variable to shift bars to the center of the chart
var xEduBarStart = (w_diff - (barWidth * edudata.length)) / 2;

// draw axis
var incAxis = eduPlot.append("g")
	.attr("class", "axis diff")
	.call(yAxis_e);

incAxis.selectAll("text")
	.attr("x", -25)
	.attr("text-anchor", "end");

// draw bars
var bars = eduPlot.selectAll("rect")
	.data(edudata)
	.enter()
  .append("rect")
  	.attr("class", "diffbar")
  	.attr("width", barWidth - 1)
  	.attr("height", function(d) { return h_diff - yScale_e(d.value); })
  	.attr("x", function(d, i) { return xEduBarStart + (i * barWidth); })
  	.attr("y", function(d) { return yScale_e(d.value); });
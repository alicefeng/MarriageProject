var w_diff = 800,
	h_diff = 400,
	padding_diff = 50;	

// set up formats
var pctfmt = d3.format("%");

// set up scales
var yScale_i = d3.scale.linear()
	.range([h_diff, 0]);

// set up y axis
var yAxis_i = d3.svg.axis()
	.scale(yScale_i)
	.orient("right")
	.ticks(10, "%")
	.tickSize(w_diff);

// set up chart
var incPlot = d3.select("#incdiffplot")
  .append("svg")
	.attr("width", w_diff + padding_diff + padding_diff)
	.attr("height", h_diff + padding_diff + padding_diff)
  .append("g")
  	.attr("transform", "translate(" + padding_diff + ", " + padding_diff + ")");


//load data and draw chart
d3.csv("data/diffdata.csv", function(d) {

	return {
		label: d.label,
		value: +d.value,
		cat: d.cat,
		order: d.order
	};

}, function(error, data) {

	console.log(data);

	// add in domains for axes
	yScale_i.domain([0, d3.max(data, function(d) { return d.value; }) ]);

	// set bar width
	var barWidth = w_diff / data.length;
	console.log(barWidth);
	
	// draw axis
	var incAxis = incPlot.append("g")
		.attr("class", "axis diff")
		.call(yAxis_i);

	incAxis.selectAll("text")
		.attr("x", -25)
		.attr("text-anchor", "end");
	
	// draw bars
	var bars = incPlot.selectAll("rect")
		.data(data)
		.enter()
	  .append("rect")
	  	.attr("class", "diffbar")
	  	.attr("width", barWidth - 1)
	  	.attr("height", function(d) { return h_diff - yScale_i(d.value); })
	  	.attr("x", function(d, i) { return i * barWidth; })
	  	.attr("y", function(d) { return yScale_i(d.value); });


}); 
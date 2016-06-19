var w_diff = 800,
	h_diff = 400,
	padding_diff = 50;	

// set up scales
var yScale_i = d3.scale.linear()
	.range([h_diff, 0]);

// set up y axis
var yAxis_i = d3.svg.axis()
	.scale(yScale_i)
	.orient("right")
	.ticks(5, "%")
	.tickSize(w_diff);

// set up chart
var incPlot = d3.select("#incdiffplot")
  .append("svg")
	.attr("width", w_diff + padding_diff + padding_diff)
	.attr("height", h_diff + padding_diff + padding_diff)
  .append("g")
  	.attr("transform", "translate(" + padding_diff + ", " + padding_diff + ")");


//load data and draw chart
d3.csv("data/incdiffdata.csv", function(d) {

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
	  	.attr("height", 0)
	  	.attr("x", function(d, i) { return i * barWidth; })
	  	.attr("y", h_diff);

	// add in transition
	incPlot.selectAll("rect")
		.transition()
		.delay(function(d, i) {return i * 100; })
		.duration(1000)
		.ease("linear")
		.attr("height", function(d) { return h_diff - yScale_i(d.value); })
		.attr("y", function(d) { return yScale_i(d.value); });

	// add labels
	incPlot.append("text")
		.attr("x", barWidth - 2)
		.attr("y", h_diff + 15)
		.text("Wife's income more")
		.style("text-anchor", "end");

	incPlot.append("text")
		.attr("x", barWidth - 2)
		.attr("y", h_diff + 30)
		.text("than triple husband's")
		.style("text-anchor", "end");
	
	incPlot.append("line")
		.attr("x1", barWidth -1)
		.attr("x2", barWidth -1)
		.attr("y1", h_diff)
		.attr("y2", h_diff + 40)
		.style("stroke", "gray");

	incPlot.append("text")
		.attr("x", barWidth * 4 - 2)
		.attr("y", h_diff + 15)
		.text("Wife's income more")
		.style("text-anchor", "end");

	incPlot.append("text")
		.attr("x", barWidth * 4 -2)
		.attr("y", h_diff + 30)
		.text("than double husband's")
		.style("text-anchor", "end");

	incPlot.append("line")
		.attr("x1", barWidth * 4 -1)
		.attr("x2", barWidth * 4 -1)
		.attr("y1", h_diff)
		.attr("y2", h_diff + 40)
		.style("stroke", "gray");

	incPlot.append("text")
		.attr("x", w_diff / 2)
		.attr("y", h_diff + 15)
		.text("Within 25%")
		.style("text-anchor", "middle");

	incPlot.append("line")
		.attr("x1", barWidth * 12 + 1)
		.attr("x2", barWidth * 12 + 1)
		.attr("y1", h_diff)
		.attr("y2", h_diff + 40)
		.style("stroke", "gray");

	incPlot.append("text")
		.attr("x", barWidth * 12 + 2)
		.attr("y", h_diff + 15)
		.text("Husband's income more");

	incPlot.append("text")
		.attr("x", barWidth * 12 + 2)
		.attr("y", h_diff + 30)
		.text("than double wife's");
	
	incPlot.append("line")
		.attr("x1", barWidth * 16 -1)
		.attr("x2", barWidth * 16 -1)
		.attr("y1", h_diff)
		.attr("y2", h_diff + 40)
		.style("stroke", "gray");

	incPlot.append("text")
		.attr("x", barWidth * 16 + 2)
		.attr("y", h_diff + 15)
		.text("Husband's income more");

	incPlot.append("text")
		.attr("x", barWidth * 16 + 2)
		.attr("y", h_diff + 30)
		.text("than triple wife's");

}); 
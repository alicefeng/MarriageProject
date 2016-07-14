// chart
var w_comp = 450,
	h_comp = 300,
	padding_c = 75,
	padding_left = 250;	

// set up scales
var yScale_c = d3.scale.linear()
	.range([h_comp, 0]);

// this scale maps where the two groups should be placed
var xScale0_c = d3.scale.ordinal()
	.rangeRoundBands([0, w_comp], .1);

// this scale maps where each of the bars within the groups should be placed
var xScale1_c = d3.scale.ordinal();

var color_c2 = d3.scale.ordinal()
	.range(["#6b5ea9", "#bbb"]);

// set up y-axis
var yAxis_c = d3.svg.axis()
	.scale(yScale_c)
	.orient("left")
	.tickFormat(d3.format("%"));


// set up chart
var incCompPlot = d3.select("#inccompplot")
  .append("svg")
	.attr("width", w_comp + padding_left)
	.attr("height", h_comp + padding_c * 2)
  .append("g")
  	.attr("transform", "translate(" + padding_left + ", " + padding_diff + ")");


//load data and draw chart
d3.csv("Data/inccompare.csv", function(error, data) {

	if (error) throw error;

	var incCats = d3.keys(data[0]).filter(function(key) { return key !== "MaritalStatus"; });

	// reshape data for grouping
	data.forEach(function(d) {
		d.cat = incCats.map(function(name) { return {name: name, value: +d[name], marital: d["MaritalStatus"]}; });
	});

	console.log(data);

	// add in domains for axes
	xScale0_c.domain(data.map(function(d) { return d.MaritalStatus; }));
	xScale1_c.domain(incCats).rangeRoundBands([0, xScale0_c.rangeBand()]);
	yScale_c.domain([0, d3.max(data, function(d) { return d3.max(d.cat, function(d) { return d.value; }); }) ]);
	color_c2.domain(data.map(function(d) { return d.MaritalStatus; }));

	// set up x-axis
	var xAxis_c = d3.svg.axis()
		.orient("bottom")
		.scale(xScale1_c)
		.tickSize(0);
	
	// draw axes
	incCompPlot.append("g")
		.attr("class", "axis comp")
		.attr("transform", "translate(0," + h_comp + ")")
		.call(xAxis_c)
	  .selectAll("text")
	  	.attr("y", 15)
	  	.attr("x", 9)
	  	.attr("dy", ".35em")
	  	.attr("transform", "rotate(-45)")
	  	.style("text-anchor", "end");

	incCompPlot.append("g")
		.attr("class", "axis comp")
		.call(yAxis_c);


	// draw bars
	var bars = incCompPlot.selectAll(".marStat")
		.data(data)
		.enter()
	  .append("g")
	  	.attr("class", "marStat")
	  	.attr("transform", function(d) { return "translate(" + xScale0_c(d.MaritalStatus) + ",0)"; });

	bars.selectAll("rect")
		.data(function(d) { return d.cat; })
		.enter()
	  .append("rect")
	  	.attr("x", function(d) { return xScale1_c(d.name); })
	  	.attr("y", function(d) { return yScale_c(d.value); })
		.attr("width", xScale1_c.rangeBand()-1 )
	  	.attr("height", function(d) { return h_comp - yScale_c(d.value); })
	  	.style("fill", function(d) { return color_c2(d.marital); });

}); 

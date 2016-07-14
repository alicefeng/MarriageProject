// chart
var w_comp = 450,
	h_comp = 300,
	padding_c = 75,
	padding_left = 250;	

// set up scales
var yScale_ce = d3.scale.linear()
	.range([h_comp, 0]);

var xScale0_c = d3.scale.ordinal()
	.rangeRoundBands([0, w_comp], .1);

var xScale1_ce = d3.scale.ordinal();

var color_c2 = d3.scale.ordinal()
	.range(["#6b5ea9", "#bbb"]);

// set up axes
var yAxis_c = d3.svg.axis()
	.scale(yScale_ce)
	.orient("left")
	.tickFormat(d3.format("%"));


// set up chart
var eduCompPlot = d3.select("#educompplot")
  .append("svg")
	.attr("width", w_comp + padding_left)
	.attr("height", h_comp + padding_c * 2)
  .append("g")
  	.attr("transform", "translate(" + padding_left + ", " + padding_diff + ")");


//load data and draw chart
d3.csv("Data/educompare.csv", function(error, data) {

	if (error) throw error;

	var eduCats = d3.keys(data[0]).filter(function(key) { return key !== "MaritalStatus"; });

	// reshape data for grouping
	data.forEach(function(d) {
		d.cat = eduCats.map(function(name) { return {name: name, value: +d[name], marital: d["MaritalStatus"]}; });
	});

	console.log(data);

	// add in domains for axes
	xScale0_c.domain(data.map(function(d) { return d.MaritalStatus; }));
	xScale1_ce.domain(eduCats).rangeRoundBands([0, xScale0_c.rangeBand()]);
	yScale_ce.domain([0, d3.max(data, function(d) { return d3.max(d.cat, function(d) { return d.value; }); }) ]);
	color_c2.domain(data.map(function(d) { return d.MaritalStatus; }));

	// set up x-axis
	var xAxis_ce = d3.svg.axis()
		.orient("bottom")
		.scale(xScale1_ce)
		.tickSize(0);

	// draw axes
	eduCompPlot.append("g")
		.attr("class", "axis comp")
		.attr("transform", "translate(0," + h_comp + ")")
		.call(xAxis_ce)
	  .selectAll("text")
	  	.attr("y", 15)
	  	.attr("x", 9)
	  	.attr("dy", ".35em")
	  	.attr("transform", "rotate(-45)")
	  	.style("text-anchor", "end");

	eduCompPlot.append("g")
		.attr("class", "axis comp")
		.call(yAxis_c);


	// draw bars
	var bars = eduCompPlot.selectAll(".marStat")
		.data(data)
		.enter()
	  .append("g")
	  	.attr("class", "marStat")
	  	.attr("transform", function(d) { return "translate(" + xScale0_c(d.MaritalStatus) + ",0)"; });

	bars.selectAll("rect")
		.data(function(d) { return d.cat; })
		.enter()
	  .append("rect")
	  	.attr("x", function(d) { return xScale1_ce(d.name); })
	  	.attr("y", function(d) { return yScale_ce(d.value); })
		.attr("width", xScale1_ce.rangeBand()-1 )
	  	.attr("height", function(d) { return h_comp - yScale_ce(d.value); })
	  	.style("fill", function(d) { return color_c2(d.marital); });

}); 

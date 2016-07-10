// chart
var w_diff = 400,
	h_comp = 300,
	padding_diff = 50,
	padding_left = 250;	

// set up scales
var yScale_ce = d3.scale.linear()
	.range([h_comp, 0]);

var xScale0_c = d3.scale.ordinal()
	.rangeRoundBands([0, w_diff], .1);

var xScale1_ce = d3.scale.ordinal();

var color_c3 = d3.scale.ordinal()
	.range(['#fee5d9','#fcae91','#fb6a4a','#de2d26','#a50f15']);

// set up axes
var xAxis_c= d3.svg.axis()
	.scale(xScale0_c)
	.orient("bottom");

var yAxis_c = d3.svg.axis()
	.scale(yScale_ce)
	.orient("left")
	.tickFormat(d3.format("%"));


// set up chart
var eduCompPlot = d3.select("#educompplot")
  .append("svg")
	.attr("width", w_diff + padding_left)
	.attr("height", h_comp + padding_diff * 2)
  .append("g")
  	.attr("transform", "translate(" + padding_left + ", " + padding_diff + ")");


//load data and draw chart
d3.csv("data/educompare.csv", function(error, data) {

	if (error) throw error;

	var eduCats = d3.keys(data[0]).filter(function(key) { return key !== "MaritalStatus"; });

	// reshape data for stacking
	data.forEach(function(d) {
		d.cat = eduCats.map(function(name) { return {name: name, value: +d[name]}; });
	});

	console.log(data);

	// add in domains for axes
	xScale0_c.domain(data.map(function(d) { return d.MaritalStatus; }));
	xScale1_ce.domain(eduCats).rangeRoundBands([0, xScale0_c.rangeBand()]);
	yScale_ce.domain([0, d3.max(data, function(d) { return d3.max(d.cat, function(d) { return d.value; }); }) ]);
	color_c3.domain(eduCats);

	// draw axes
	eduCompPlot.append("g")
		.attr("class", "axis diff")
		.attr("transform", "translate(0," + h_comp + ")")
		.call(xAxis_c);

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
		.attr("width", xScale1_ce.rangeBand() )
	  	.attr("height", function(d) { return h_comp - yScale_ce(d.value); })
	  	.style("fill", function(d) { return color_c3(d.name); });

}); 

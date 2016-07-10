// chart
var w_diff = 400,
	h_comp = 300,
	padding_diff = 50,
	padding_left = 250;	

// set up scales
var yScale_c = d3.scale.linear()
	.range([h_comp, 0]);

var xScale0_c = d3.scale.ordinal()
	.rangeRoundBands([0, w_diff], .1);

var xScale1_c = d3.scale.ordinal();

var color_c2 = d3.scale.ordinal()
	.range(['#edf8e9','#bae4b3','#74c476','#31a354','#006d2c']);

// set up axes
var xAxis_c= d3.svg.axis()
	.scale(xScale0_c)
	.orient("bottom");

var yAxis_c = d3.svg.axis()
	.scale(yScale_c)
	.orient("left")
	.tickFormat(d3.format("%"));


// set up chart
var incCompPlot = d3.select("#inccompplot")
  .append("svg")
	.attr("width", w_diff + padding_left)
	.attr("height", h_comp + padding_diff * 2)
  .append("g")
  	.attr("transform", "translate(" + padding_left + ", " + padding_diff + ")");


//load data and draw chart
d3.csv("data/inccompare.csv", function(error, data) {

	if (error) throw error;

	var incCats = d3.keys(data[0]).filter(function(key) { return key !== "MaritalStatus"; });

	// reshape data for stacking
	data.forEach(function(d) {
		d.cat = incCats.map(function(name) { return {name: name, value: +d[name]}; });
	});

	console.log(data);

	// add in domains for axes
	xScale0_c.domain(data.map(function(d) { return d.MaritalStatus; }));
	xScale1_c.domain(incCats).rangeRoundBands([0, xScale0_c.rangeBand()]);
	yScale_c.domain([0, d3.max(data, function(d) { return d3.max(d.cat, function(d) { return d.value; }); }) ]);
	color_c2.domain(incCats);

	// draw axes
	incCompPlot.append("g")
		.attr("class", "axis diff")
		.attr("transform", "translate(0," + h_comp + ")")
		.call(xAxis_c);

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
		.attr("width", xScale1_c.rangeBand() )
	  	.attr("height", function(d) { return h_comp - yScale_c(d.value); })
	  	.style("fill", function(d) { return color_c2(d.name); });

}); 

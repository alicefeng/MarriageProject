// chart
var w_diff = 500,
	h_diff = 500,
	padding_diff = 50,
	padding_left = 250;	

// set up scales
var xScale_i = d3.scale.linear()
	.domain([0, 1])
	.rangeRound([0, w_diff]);

var yScale_i = d3.scale.ordinal()
	.rangeRoundBands([0, h_diff], .1);

var color_c = d3.scale.ordinal()
	.range(["#6b5ea9", "#bbb"]);

// set up axes
var xAxis_i = d3.svg.axis()
	.scale(xScale_i)
	.orient("top")
	.ticks(5, "%");

var yAxis_i = d3.svg.axis()
	.scale(yScale_i)
	.orient("left")
	.tickSize(0);


// set up chart
var occCompPlot = d3.select("#occcompplot")
  .append("svg")
	.attr("width", w_diff + padding_left * 2)
	.attr("height", h_diff + padding_diff * 2)
  .append("g")
  	.attr("transform", "translate(" + padding_left + ", " + padding_diff + ")");


//load data and draw chart
d3.csv("Data/occmarried.csv", function(d) {

	return {
		Occupation: d.Occ,
		Rank: +d.rank,
		Married: +d.Married,
		NotMarried: +d.NotMarried
	};

}, function(error, data) {

	color_c.domain(d3.keys(data[0]).filter(function(key) { return key !== "Occupation" && key !== "Rank"; }));

	// reshape data for stacking
	data.forEach(function(d) {
		var x0 = 0;
		d.cat = color_c.domain().map(function(name) { return {name: name, x0: x0, x1: x0 += +d[name]}; });
		d.total = d.cat[d.cat.length - 1].x1;
	});

	console.log(data);

	// sort data in order of occupation rank
	data.sort(function(a, b) { return a.Rank - b.Rank; });

	// add in domains for axes
	yScale_i.domain(data.map(function(d) { return d.Occupation; }));


	// draw axes
	occCompPlot.append("g")
		.attr("class", "axis comp")
		.attr("transform", "translate(0, 5)")
		.call(xAxis_i);

	occCompPlot.append("g")
		.attr("class", "axis comp")
		.call(yAxis_i);


	// draw bars
	var bars = occCompPlot.selectAll(".occ")
		.data(data)
		.enter()
	  .append("g")
	  	.attr("class", "occ")
	  	.attr("transform", function(d) { return "translate(0," + yScale_i(d.Occupation) + ")"; });

	bars.selectAll("rect")
		.data(function(d) { return d.cat; })
		.enter()
	  .append("rect")
	  	.attr("x", function(d) { return xScale_i(d.x0); })
		.attr("width", function(d) { return xScale_i(d.x1) - xScale_i(d.x0); })
	  	.attr("height", yScale_i.rangeBand())
	  	.style("fill", function(d) { return color_c(d.name); });

}); 

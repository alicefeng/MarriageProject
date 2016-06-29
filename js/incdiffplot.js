var w_diff = 800,
	h_diff = 600,
	padding_diff = 50,
	padding_left = 200;	

// set up scales
var xScale_i = d3.scale.linear()
	.domain([0, 1])
	.rangeRound([0, w_diff]);

var yScale_i = d3.scale.ordinal()
	.rangeRoundBands([0, h_diff], .1);

var color_i = d3.scale.ordinal()
	.range(["#e66101", "#e6e6e6", "#b2abd2"]);

// set up axes
var xAxis_i = d3.svg.axis()
	.scale(xScale_i)
	.orient("top")
	.ticks(5, "%");

var yAxis_i = d3.svg.axis()
	.scale(yScale_i)
	.orient("left");

// set up a key function to allow for object constancy when transitioning between graphs
function key(d) { return d.name; }

// set up chart
var incPlot = d3.select("#incedudiffplot")
  .append("svg")
	.attr("width", w_diff + padding_left + padding_diff)
	.attr("height", h_diff + padding_diff)
  .append("g")
  	.attr("transform", "translate(" + padding_left + ", " + padding_diff + ")");


//load data and draw chart
d3.csv("data/incdiffdata.csv", function(d) {

	return {
		Occupation: d.Occupation,
		Rank: +d.Rank,
		Less: +d.Less,
		Equal: +d.Equal,
		More: +d.More
	};

}, function(error, data) {

	color_i.domain(d3.keys(data[0]).filter(function(key) { return key !== "Occupation" && key !== "Rank"; }));

	// reshape data for stacking
	data.forEach(function(d) {
		var x0 = 0;
		d.cat = color_i.domain().map(function(name) { return {name: name, x0: x0, x1: x0 += +d[name]}; });
		d.total = d.cat[d.cat.length - 1].x1;
	});

	console.log(data);

	// sort data in order of occupation rank
	data.sort(function(a, b) { return a.Rank - b.Rank; });

	// add in domains for axes
	yScale_i.domain(data.map(function(d) { return d.Occupation; }));


	// draw axes
	incPlot.append("g")
		.attr("class", "axis diff")
		//.attr("transform", "translate(0," + padding_diff/2 + ")")
		.call(xAxis_i);

	incPlot.append("g")
		.attr("class", "axis diff")
		.call(yAxis_i);


	// draw bars
	var bars = incPlot.selectAll(".occ")
		.data(data)
		.enter()
	  .append("g")
	  	.attr("class", "occ")
	  	.attr("transform", function(d) { return "translate(0," + yScale_i(d.Occupation) + ")"; });

	bars.selectAll("rect")
		.data(function(d) { return d.cat; }, key)
		.enter()
	  .append("rect")
	  	.attr("x", function(d) { return xScale_i(d.x0); })
		.attr("width", function(d) { return xScale_i(d.x1) - xScale_i(d.x0); })
	  	.attr("height", yScale_i.rangeBand())
	  	.style("fill", function(d) { return color_i(d.name); });

	incPlot.append("text")
		.attr("x", 0)
		.attr("y", h_diff - 5)
		.text("Data Source: 2014 American Community Survey");
}); 


// function to update the chart based on the dataset selected
function updateChart(dataset) {

	// read in new dataset
	d3.csv("data/" + dataset + ".csv", function(d) {

	return {
		Occupation: d.Occupation,
		Rank: +d.Rank,
		Less: +d.Less,
		Equal: +d.Equal,
		More: +d.More
	};

	}, function(error, data) {

		// reshape data for stacking
		data.forEach(function(d) {
			var x0 = 0;
			d.cat = color_i.domain().map(function(name) { return {name: name, x0: x0, x1: x0 += +d[name]}; });
			d.total = d.cat[d.cat.length - 1].x1;
		});

		console.log(dataset + " used:", data);

		// sort data in order of occupation rank
		data.sort(function(a, b) { return a.Rank - b.Rank; });

		// update bars based on new data
		var bars = incPlot.selectAll(".occ")
			.data(data);

		bars.selectAll("rect")
			.data(function(d) { return d.cat; }, key)
			.transition()
			.duration(1000)
			.attr("x", function(d) { return xScale_i(d.x0); })
			.attr("width", function(d) { return xScale_i(d.x1) - xScale_i(d.x0); })
	  		.style("fill", function(d) { return color_i(d.name); });

	});
}


// button handlers
function selectEdu() {
	updateChart("edudiffdata");
}

function selectInc() {
	updateChart("incdiffdata");
}
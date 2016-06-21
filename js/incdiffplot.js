var w_diff = 900,
	h_diff = 800,
	padding_diff = 50,
	padding_left = 400;	

// set up scales
var xScale_i = d3.scale.linear()
	.domain([0, 1])
	.rangeRound([0, w_diff]);

var yScale_i = d3.scale.ordinal()
	.rangeRoundBands([0, h_diff], .1);

var color_i = d3.scale.ordinal()
	.range(["#e66101", "#fdb863", "#e6e6e6", "#b2abd2"]);

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
var incPlot = d3.select("#incdiffplot")
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
		Less: +d.LessHalf,
		Half: +d.Half,
		Equal: +d.Equal,
		More: +d.HalfMore
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
		.attr("transform", "translate(0," + padding_diff/2 + ")")
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
/*
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
*/
}); 

function selectEdu() {

	d3.csv("data/edudiffdata.csv", function(d) {

	return {
		Occupation: d.Occupation,
		Rank: +d.Rank,
		Less: +d.Less,
		Equal: +d.Equal,
		More: +d.More
	};

	}, function(error, data) {
		var color_i = d3.scale.ordinal()
			.domain(d3.keys(data[0]).filter(function(key) { return key !== "Occupation" && key !== "Rank"; }))
			.range(["#e66101", "#e6e6e6", "#b2abd2"]);

		// reshape data for stacking
		data.forEach(function(d) {
			var x0 = 0;
			d.cat = color_i.domain().map(function(name) { return {name: name, x0: x0, x1: x0 += +d[name]}; });
			d.total = d.cat[d.cat.length - 1].x1;
		});

		console.log(data);

		// sort data in order of occupation rank
		data.sort(function(a, b) { return a.Rank - b.Rank; });

		// draw bars
		var bars = incPlot.selectAll(".occ")
			.data(data);

		bars.selectAll("rect")
			.data(function(d) { return d.cat; }, key)
			.transition()
			.duration(1000)
			.attr("x", function(d) { return xScale_i(d.x0); })
			.attr("width", function(d) { return xScale_i(d.x1) - xScale_i(d.x0); })
	  		.style("fill", function(d) { return color_i(d.name); });

	  	bars.selectAll("rect")
	  		.data(function(d) { return d.cat; }, key)
	  		.exit()
	  		.remove();
	});
}


var w_heat = 700,
    h_heat = 700,
    padding_heat = 100;

// create formats
percentfmt = d3.format(".2%");

// set up scales
var xScale_h = d3.scale.ordinal()
	.rangeRoundBands([0, h_heat], .1);

var yScale_h = d3.scale.ordinal()
	.rangeRoundBands([0, h_heat], .1);

var heatcolors = d3.scale.linear()
	.domain([0, 0.28])
	.range(["#fff", "#1f097c"]);

// set up axes
var xAxis_h = d3.svg.axis()
	.scale(xScale_h)
	.orient("top")
	.tickSize(0);

var yAxis_h = d3.svg.axis()
	.scale(yScale_h)
	.orient("left")
	.tickSize(0);

//set up tooltip 
var tip_heat = d3.tip()
	.attr("class", "d3-tip")
	.direction("e")
	.offset([0, 10])
	.html(function(d) { return "<h6>" + percentfmt(d.PctPairs) + " of " + d.Spouse1Job + " marry " + d.Spouse2Job + "</h6>"; });	

// set up graph
var svg_heat = d3.select("#occheatmap")
  .append("svg")
  	.attr("width", w_heat + padding_heat * 2)
  	.attr("height", h_heat + padding_heat * 2)
  .append("g")
  	.attr("transform", "translate(" + padding_heat + "," + padding_heat + ")");

// call tooltip
svg_heat.call(tip_heat);

// load data
d3.json("data/pairings.json", function(error, data) {
	console.log(data);

	// sort data in order of occupation rank
	data.sort(function(a, b) { return a.Spouse1Rank - b.Spouse1Rank; });

	// get length of the side of the square
	s = Math.floor(w_heat / data.length);
	console.log("The length of each square is " + s);

	// get list of occupations to label axes with
	var occlist = data.map(function(d) { return d.Spouse1Job; });

	// set axes domains
	xScale_h.domain(occlist);
	yScale_h.domain(occlist);

	//draw axes
	svg_heat.append("g")
		.attr("class", "axis diff")
		.call(xAxis_h)
	  .selectAll("text")
	  	.attr("transform", "rotate(-45)")
	  	.style("text-anchor", "start");

	svg_heat.append("g")
		.attr("class", "axis diff")
		.call(yAxis_h);

	// draw heatmap
	var squares = svg_heat.selectAll(".occrow")
		.data(data)
		.enter()
	  .append("g")
	  	.attr("class", "occrow")
	  	.attr("transform", function(d) { return "translate(0, " + yScale_h(d.Spouse1Job) + ")"; });

	squares.selectAll("rect")
		.data(function(d) { return d.Spouse2Jobs; })
		.enter()
	  .append("rect")
	  	.attr("width", s - 1)
	  	.attr("height", s - 1)
	  	.attr("x", function(d) { return xScale_h(d.Spouse2Job); })
	  	.attr("fill", function(d) { return heatcolors(d.PctPairs); })
	  	.on("mouseover", tip_heat.show)
	  	.on("mouseout", tip_heat.hide);


	// add labels
	svg_heat.append("text")
		.attr("x", -100)
		.attr("y", -20)
		.text("Occupations with ");

	svg_heat.append("text")
		.attr("x", -100)
		.attr("y", -10)
		.text("high paid,");
	
	svg_heat.append("text")
		.attr("x", -100)
		.attr("y", 4)
		.text("high educated");

	svg_heat.append("text")
		.attr("x", -100)
		.attr("y", 16)
		.text("workers");

	svg_heat.append("text")
		.attr("x", w_heat)
		.attr("y", h_heat - 36)
		.text("Occupations with");

	svg_heat.append("text")
		.attr("x", w_heat)
		.attr("y", h_heat - 24)
		.text("low paid,");

	svg_heat.append("text")
		.attr("x", w_heat)
		.attr("y", h_heat - 12)
		.text("low educated");

	svg_heat.append("text")
		.attr("x", w_heat)
		.attr("y", h_heat)
		.text("workers");

	svg_heat.append("text")
		.attr("x", 0)
		.attr("y", h_heat + 20)
		.text("Data Source: 2014 American Community Survey");
})
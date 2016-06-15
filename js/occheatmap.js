var w_heat = 800,
    h_heat = 800,
    padding_heat_top = 50
    padding_heat_left = 100;

// create color scale
heatcolors = d3.scale.pow()
	//.domain([0, 0.0025, 0.006, 0.013, 0.028, 0.15])
	//.range(["white", "#eff3ff", "#bdd7e7", "#6baed6", "#3182bd", "#08306b"]);
	.exponent(0.5)
	.domain([0, 0.28])
	.range(["white", "black"]);

// get length of the side of the square
s = Math.floor(w_heat / 57);
console.log("The length of each square is " + s);

// set up graph
var svg_heat = d3.select("#occheatmap")
  .append("svg")
  	.attr("width", w_heat + padding_heat_left * 2)
  	.attr("height", h_heat + padding_heat_top * 2)
  .append("g")
  	.attr("transform", "translate(" + padding_heat_left + "," + padding_heat_top + ")");

// load data
d3.csv("data/pairingsbyocc.csv", function(d) {
	return {
		Spouse1Job: d.Spouse1Job,
		Spouse1Rank: +d.Spouse1Rank,
		Spouse2Job: d.Spouse2Job,
		Spouse2Rank: +d.Spouse2Rank,
		NumPairings: + d.NumPairings,
		PctPairs: +d.PctPairs,
		Overrep: d.overrep,
		Lift: d.lift
	}
}, function(error, data) {
	console.log(data);

	// draw heatmap
	var squares = svg_heat.selectAll("rect")
		.data(data)
		.enter()
	  .append("rect")
	  	.attr("class", "occsquare")
	  	.attr("width", s - 1)
	  	.attr("height", s - 1)
	  	.attr("x", function(d) { return (d.Spouse1Rank - 1) * s; })
	  	.attr("y", function(d) { return (d.Spouse2Rank - 1) * s; })
	  	.attr("fill", function(d) { return heatcolors(d.PctPairs); });

	// add labels
	svg_heat.append("text")
		.attr("x", -100)
		.attr("y", 10)
		.text("High paid,");

	svg_heat.append("text")
		.attr("x", -100)
		.attr("y", 22)
		.text("high educated workers");

	svg_heat.append("text")
		.attr("x", w_heat)
		.attr("y", h_heat - 12)
		.text("Low paid,");

	svg_heat.append("text")
		.attr("x", w_heat)
		.attr("y", h_heat)
		.text("low educated workers");
})
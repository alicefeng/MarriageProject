var w = 700,
    h = 500,
    padding = 60;


// set up formats for currency and commas;
var dollarfmt = d3.format("$,.0f");
var commafmt = d3.format(",.0f");

//set up tooltip 
var tip = d3.tip()
	.attr("class", "d3-tip")
	.direction("e")
	.offset([0, 10])
	.html(function(d) { return "<ul><li>" + d.My_cat + "</li> <li>Number of Workers: " + commafmt(d.TOT_EMP) + 
					"</li> <li>Mean Annual Salary: " + dollarfmt(d.A_MEAN) + 
					"</li> <li>Percent with College Education: " + commafmt(d.BachelorsPlus) + "%</li></ul>"; });	

// create scale based on percent of workers with at least a bachelor's degree;
xscale = d3.scale.linear()
	.domain([0, 100])
	.rangeRound([0, w]);

// create scale based on median annual salary
yscale = d3.scale.linear()
	.rangeRound([h, 0]);

// create scale based on number of workers employed in the occupation;
rscale = d3.scale.sqrt()
	.range([0, 40]);

// create scale that assigns color based on gender breakdown
color = d3.scale.linear()
	.domain([0, 50, 100])
	.range(["#0571b0", "#f7f7f7", "#ca0020"]);

// set up axes
var xAxis = d3.svg.axis()
	.scale(xscale)
	.orient("bottom");

var yAxis = d3.svg.axis()
	.scale(yscale)
	.orient("left")
	.tickFormat(dollarfmt);

var svg = d3.select("#occscatterplot")
	.append("svg")
	.attr("width", w + padding + padding)
	.attr("height", h + padding + padding)
	.append("g")
	.attr("transform", "translate(" + padding + "," + padding + ")");

svg.call(tip);

d3.csv("data/occupationGroups.csv", function(d) {

	return {
		My_cat: d.SOC_Major_Group,
		TOT_EMP: +d.TOT_EMP,
		A_MEAN: +d.A_MEAN,
		BachelorsPlus: +d.BachelorsPlus,
		PctWomen: +d.PctWomen
	};

}, function(error, data) {

	// sort data so that larger occupations are drawn first
	// this way smaller circles are on top and can be selected
	data.sort(function(a,b) { return b.TOT_EMP - a.TOT_EMP;} );

	console.log(data);

	// set scale domains
	yscale.domain([0, d3.max(data, function(d) { return d.A_MEAN; }) ]);

	rscale.domain([0, d3.max(data, function(d) { return d.TOT_EMP; }) ]);

	// add line for median annual wage and label it
	var medwageline = svg.append("g")
		.attr("class", "median wage");

	medwageline.append("line")
		.attr("x1", 0)
		.attr("y1", yscale(48320))
		.attr("x2", w)
		.attr("y2", yscale(48320))
		.style("stroke", "gray")
		.style("stroke-width", 1)
		.style("stroke-dasharray", "3,3");

	medwageline.append("text")
		.attr("x", w)
		.attr("y", yscale(48320)-4)
		.text("Mean Annual Wage")
		.style("text-anchor", "end")
		.style("fill", "gray");

	// add line for percent of Americans with a college degree and label it
	var collegeline = svg.append("g")
		.attr("class", "pct bachelors");

	collegeline.append("line")
		.attr("x1", xscale(35.6))
		.attr("y1", 0)
		.attr("x2", xscale(35.6))
		.attr("y2", h)
		.style("stroke", "gray")
		.style("stroke-width", 1)
		.style("stroke-dasharray", "3,3");

	// (split label into three text elements to "wrap" it)
	collegeline.append("text")
		.attr("x", xscale(35.6)+4)
		.attr("y", 0)
		.text("Pct of Americans")
		.style("fill", "gray");

	collegeline.append("text")
		.attr("x", xscale(35.6)+4)
		.attr("y", 12)
		.text("with a bachelor's")
		.style("fill", "gray");

	collegeline.append("text")
		.attr("x", xscale(35.6)+4)
		.attr("y", 24)
		.text("degree or higher")
		.style("fill", "gray");



	// draw circles for each occupation group
	var occpoints = svg.selectAll("circle")
		.data(data)
		.enter()
		.append("circle")
		.attr("class", "occ")
		.attr("r", function(d) { return rscale(d.TOT_EMP); })
		.attr("cx", function(d) { return xscale(d.BachelorsPlus); })
		.attr("cy", function(d) { return yscale(d.A_MEAN); })
		.style("fill", function(d) { return color(d.PctWomen); })
		.style("stroke", "gray")
		.on("mouseover", tip.show)
		.on("mouseout", tip.hide);



	// label axes
	svg.append("g")
		.attr("class", "x axis")
		.attr("transform", "translate(0," + h + ")")
		.call(xAxis)
		.append("text")
		.attr("class", "label")
		.attr("x", w)
		.attr("y", -6)
		.style("text-anchor", "end")
		.text("Percent of workers with at least a bachelor's degree");

	svg.append("g")
		.attr("class", "y axis")
		.call(yAxis)
		.append("text")
		.attr("class", "label")
		.attr("transform", "rotate(-90)")
		.attr("y", 6)
		.attr("dy", ".71em")
		.style("text-anchor", "end")
		.text("Mean Annual Salary");

}); 

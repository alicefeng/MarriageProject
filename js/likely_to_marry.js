var formatPercent = d3.format(".1%");

// chart
var w = 300,
	h = 500,
	padding = 50;	

// set up scales
var xScale = d3.scale.linear()
	.domain([0, 0.055])
	.range([0, w]);

var yScale = d3.scale.linear()
	.domain([0, 0.75])
	.rangeRound([h, 0]);

// set up axis
var xAxis = d3.svg.axis()
	.scale(xScale)
	.orient("bottom")
	.tickValues([0, 0.01, 0.02, 0.03, 0.04, 0.05])
	.tickFormat(d3.format(".0%"));

var yAxis = d3.svg.axis()
	.scale(yScale)
	.orient("left")
	.tickFormat(d3.format(".0%"));

var surprisePlot1 = d3.select("#splot1")
  .append("svg")
	.attr("width", w + padding * 2)
	.attr("height", h + padding * 2)
  .append("g")
  	.attr("transform", "translate(" + padding + ", " + padding + ")");


var surprisePlot2 = d3.select("#splot2")
  .append("svg")
	.attr("width", w + padding * 2)
	.attr("height", h + padding * 2)
  .append("g")
  	.attr("transform", "translate(" + padding + ", " + padding + ")");

// tooltip
tip = d3.tip()
		.attr('class', 'd3-tip')
		.direction('e')
		.html(function(d) { return formatPercent(d.pct_couples) + " of male " + d.husband_occ.toLowerCase() + " marry female " + d.wife_occ.toLowerCase(); });

tip3 = d3.tip()
		.attr('class', 'd3-tip')
		.direction('e')
		.html(function(d) { return formatPercent(d.pct_couples) + " of female " + d.wife_occ.toLowerCase() + " marry male " + d.husband_occ.toLowerCase(); });

d3.csv('Data/surprise_w.csv', function(d) {
	
	return {
		occp_h: d.OCCP_H,
		occp_w: d.OCCP_W,
		husband_occ: d.Husband_Occ,
		wife_occ: d.Wife_Occ,
		pct_women: +d.PctWomen,
		pct_couples: +d.pct_couples,
	};

}, function(error, data) {

	surprisePlot1.call(tip);

	surprisePlot1.append("text")
		.attr("x", 40)
		.attr("y", -30)
		.attr("class", "label")
		.text("Who Men are Likely to Marry")
		.style("font-size", "1.75rem");

	//label axes
	surprisePlot1.append("g")
		.attr("class", "x axis")
		.attr("transform", "translate(0," + h + ")")
		.call(xAxis)
		.append("text")
		// .attr("class", "label")
		.attr("x", w)
		.attr("y", 35)
		.style("text-anchor", "end")
		.text("Share of Women");

	surprisePlot1.append("g")
		.attr("class", "y axis")
		.call(yAxis)
		.append("text")
		// .attr("class", "label")
		.attr("transform", "rotate(-90)")
		.attr("y", -45)
		.attr("dy", ".71em")
		.style("text-anchor", "end")
		.text("Share of Wives"); 

	// add line at y=0
	surprisePlot1.append("line")
		.attr("x1", 0)
		.attr("x2", w)
		.attr("y1", h)
		.attr("y2", yScale(0.055))
		.style("stroke", "gray")
		.style("stroke-width", 1)
		.style("stroke-dasharray", "3,3");
		
	var circles = surprisePlot1.selectAll(".men")
		.data(data)
		.enter()
	  .append("circle")	  	
		.attr("class", "men")
		.attr("r", 4)
	  	.attr("cx", function(d) { return xScale(d.pct_women); })
	  	.attr("cy", function(d) { return yScale(d.pct_couples); })
	  	.style("fill", "#bdbdbd")
	  	.style("fill-opacity", 0.4)
	  	.style("stroke", "#bdbdbd")
	  	.on("mouseover", tip.show)
	  	.on("mouseout", tip.hide);
})

d3.csv('Data/surprise_h.csv', function(d) {
	
	return {
		occp_h: d.OCCP_H,
		occp_w: d.OCCP_W,
		husband_occ: d.Husband_Occ,
		wife_occ: d.Wife_Occ,
		pct_men: +d.PctMen,
		pct_couples: +d.pct_couples,
	};

}, function(error, data) {

	surprisePlot2.call(tip3);

	surprisePlot2.append("text")
		.attr("x", 30)
		.attr("y", -30)
		.attr("class", "label")
		.text("Who Women are Likely to Marry")
		.style("font-size", "1.75rem");

	//label axes
	surprisePlot2.append("g")
		.attr("class", "x axis")
		.attr("transform", "translate(0," + h + ")")
		.call(xAxis)
		.append("text")
		// .attr("class", "label")
		.attr("x", w)
		.attr("y", 35)
		.style("text-anchor", "end")
		.text("Share of Men");

	surprisePlot2.append("g")
		.attr("class", "y axis")
		.call(yAxis)
		.append("text")
		// .attr("class", "label")
		.attr("transform", "rotate(-90)")
		.attr("y", -45)
		.attr("dy", ".71em")
		.style("text-anchor", "end")
		.text("Share of Husbands"); 

	// add line at y=0
	surprisePlot2.append("line")
		.attr("x1", 0)
		.attr("x2", w)
		.attr("y1", h)
		.attr("y2", yScale(0.055))
		.style("stroke", "gray")
		.style("stroke-width", 1)
		.style("stroke-dasharray", "3,3");
		
	var circles = surprisePlot2.selectAll(".women")
		.data(data)
		.enter()
	  .append("circle")	  	
		.attr("class", "women")
		.attr("r", 4)
	  	.attr("cx", function(d) { return xScale(d.pct_men); })
	  	.attr("cy", function(d) { return yScale(d.pct_couples); })
	  	.style("fill", "#bdbdbd")
	  	.style("fill-opacity", 0.4)
	  	.style("stroke", "#bdbdbd")
	  	.on("mouseover", tip3.show)
	  	.on("mouseout", tip3.hide);
})
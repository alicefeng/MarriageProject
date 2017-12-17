var dataset = [];

var padding = 50,
	width = 1000,
	height = 800;

var xscale = d3.scale.linear()
	.range([width/2, width]);

var yscale = d3.scale.linear()
	.range([0, height]);

var axis = d3.svg.axis()
	.scale(xscale)
	.orient("top")
	.tickValues([1, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100]);

var svg = d3.select("#cplot")
	.append("svg")
		.attr("width", width + padding*2)
		.attr("height", height + padding*2)
	.append("g")
		.attr("transform", "translate(" + padding + "," + padding + ")");

d3.csv('Data/most_common.csv', function(d) {
	return {
		occp_h: +d.OCCP_H,
		husband_occ: d.Husband_Occ,
		occp_w: +d.OCCP_W,
		wife_occ: d.Wife_Occ,
		husband_occ_group: d.Husband_Occ_Group,
		wife_occ_group: d.Wife_Occ_Group,
		rank: +d.rank,
		num_couples: +d.num_couples,
		pct_couples: +d.pct_couples,
		h_occ_rank: +d.H_occ_rank,
		w_occ_rank: +d.W_occ_rank,
	};
}, function(error, data) {

		data.forEach(function(d) {
			if(d.rank <= 25) {
				dataset.push({'occp': d.occp_h, 'occ_name': d.husband_occ, 'occ_group': d.husband_occ_group, 
								'rank': d.rank, 'num_couples': d.num_couples, 'pct_couples': d.pct_couples, 'occ_rank': d.h_occ_rank,
								'spouse_occ_rank': d.w_occ_rank, 'sex': "Husband"});
				dataset.push({'occp': d.occp_w, 'occ_name': d.wife_occ, 'occ_group': d.wife_occ_group, 
								'rank': d.rank, 'num_couples': d.num_couples, 'pct_couples': d.pct_couples, 'occ_rank': d.w_occ_rank,
								'spouse_occ_rank': d.h_occ_rank, 'sex': "Wife"});
			}
		});

		xscale.domain([1, d3.max(dataset, function(d) { return d.occ_rank; })]);
		yscale.domain([1, 25]);

		//add labels
		svg.append("text")
			.attr("x", 50)
			.attr("y", -30)
			.attr("class", "label")
			.text("Husband's Occupation");

		svg.append("circle")
		  	.attr("cx", 188)
		  	.attr("cy", -34)
		  	.attr("r", 4)
		  	.style("fill", "#BFD8D2");

		svg.append("text")
			.attr("x", 290)
			.attr("y", -30)
			.attr("class", "label")
			.text("Wife's Occupation");

		svg.append("circle")
		  	.attr("cx", 400)
		  	.attr("cy", -34)
		  	.attr("r", 4)
		  	.style("fill", "#DF744A");

		// add marriage rank number
		var ranks = svg.selectAll(".ranklabel")
			.data(dataset.filter(function(d) { return d.sex == "Husband"; }))
		  .enter().append("text")		  	
		  	.attr("class", "ranklabel")
		  	.attr("x", 0)
		  	.attr("y", function(d) { return yscale(d.rank) ; })
		  	.attr("dy", 3)
		  	.text(function(d) { return d.rank + "."; });

		// label jobs
		var jobs = svg.selectAll(".occ")
			.data(dataset)
		  .enter().append("text")
		  	.attr("class", "occ")
		  	.attr("x", function(d) { return d.sex=="Husband" ? 25 : 250; })
		  	.attr("y", function(d) { return yscale(d.rank); })
		  	.attr("dy", 3)
		  	.text(function(d) { return d.occ_name; });

		// graphic comparing occupational ranks
		svg.append("rect")
			.attr("x", width/2 - 5)
			.attr("y", -5)
			.attr("width", xscale(20) - width/2 + 5)
			.attr("height", height + 10)
			.style("fill", "#FEDCD2");

		svg.append("g")
			.attr("class", "x axis")
			.attr("transform", "translate(0, -5)")
			.call(axis)
		  .append("text")
			.attr("x", 700)
			.attr("y", -30)
			.attr("class", "label")
			.text("Popularity of Occupation");

		var lines = svg.selectAll(".line")
			.data(dataset)
		  .enter().append("line")
		  	.filter(function(d) { return d.sex == "Husband"; })
		  	.attr("class", "pairing")
		  	.attr("x1", function(d) { return xscale(d.occ_rank); })
		  	.attr("x2", function(d) { return xscale(d.spouse_occ_rank); })
		  	.attr("y1", function(d) { return yscale(d.rank); })
		  	.attr("y2", function(d) { return yscale(d.rank); })
		  	.style("stroke", "#bebebe");
		  	
		var circles = svg.selectAll(".spouse")
			.data(dataset)
		  .enter().append("circle")
		  	.attr("class", "spouse")
		  	.attr("cx", function(d) { return xscale(d.occ_rank); })
		  	.attr("cy", function(d) { return yscale(d.rank); })
			.attr("r", 4)
			.style("fill", function(d) { return d.sex=="Husband" ? "#BFD8D2" : "#DF744A" ;});  // change fill to color if occ rank < 20
});


// function vertical_layout() {
// 	var nodes = svg.selectAll(".node")
// 		.transition(2000)
// 		.attr("cx", width/2)
// 		.attr("cy", function(d) { return radii.slice(0, d.rank-1).reduce((a, b) => a+b,0) + 80; });

// 	svg.selectAll("text")
// 		.data({})
// 	  .exit().remove();
// }

// function split_layout(dataset) {
// 	var nodes = svg.selectAll("circle")
// 		.transition(2000)
// 		.attr("cx", function(d) { return d.sex=="Wife" ? (width/2 + 100) : (width/2 - 100); })
// 		.style("fill", "#e0e0e0");

// 	svg.selectAll("text")
// 		.data(dataset)
// 	  .enter().append("text")
// 	  	.transition()
// 	  	.delay(500)
// 		.text(function(d) { return d.occ_rank; })
// 		.attr("x", function(d) { return d.sex=="Wife" ? (width/2 + 100) : (width/2 - 100); })
// 		.attr("y", function(d) { return radii.slice(0, d.rank-1).reduce((a, b) => a+b,0) + 80; })
// 		.attr("text-anchor", "middle")
// 		.attr("dy", ".35em");

// 	svg.append("text")
// 		.text("Husband")
// 		.attr("x", width/2 - 100)
// 		.attr("y", 0)
// 		.attr("text-anchor", "middle");

// 	svg.append("text")
// 		.text("Wife")
// 		.attr("x", width/2 + 100)
// 		.attr("y", 0)
// 		.attr("text-anchor", "middle");
// }


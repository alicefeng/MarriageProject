var dataset;

// set length of a side
var s = 5;

// chart
var w2 = 131*s,
	h2 = 131*s,
	padding2 = 60;	

// set up color scale
var occScale = d3.scale.ordinal()
	.domain(['Architecture and Engineering',
			'Computer and Mathematics',
			'Life, Physical, and Social Sciences',
			'Arts, Design, Entertainment, Sports, and Media',
			'Community and Social Service',
			'Education, Training, and Library',
			'Legal',
			'Healthcare Practitioners and Technicians',
			'Business and Financial Operations',
			'Management',
			'Construction and Extraction',
			'Farming, Fishing, and Forestry',
			'Installation, Maintenance, and Repair',
			'Production',
			'Transportation and Material Moving',
			'Office and Administrative Support',
			'Sales',
			'Building and Grounds Cleaning and Maintenance',
			'Food Preparation and Serving',
			'Healthcare Support',
			'Personal Care and Service',
			'Protective Service'])
	.range(['#f7dc6f', '#f1c40f', '#b7950b', '#e59866',
			'#d35400', '#a04000', '#873600', '#f39c12',
			'#e67e22', '#af601a', '#85c1e9', '#3498db',
		    '#2874a6', '#c0392b', '#d98880', '#8e44ad',
			'#bb8fce', '#a3e4d7', '#76d7c4', '#1abc9c',
			'#148f77', '#0e6251']);

// tooltip
tip2 = d3.tip()
		.attr('class', 'd3-tip')
		.direction('e')
		.html(function(d) { return "Husband's Occupation: " + d.husband_occ + "<br /> Wife's Occupation: " + d.wife_occ; });

var surprise_occ_plot = d3.select("#splot3")
  .append("svg")
	.attr("width", w2 + padding2)
	.attr("height", h2 + padding2)
  .append("g")
  	.attr("transform", "translate(" + padding2 + ", " + padding2 + ")");


d3.csv('Data/non_base_rate.csv', function(d) {
	
	return {
		occp_h: d.OCCP_H,
		occp_w: d.OCCP_W,
		husband_occ: d.Husband_Occ,
		wife_occ: d.Wife_Occ,
		husband_occ_group: d.Husband_Occ_Group,
		wife_occ_group: d.Wife_Occ_Group,
		same_occ: d.same_occ,
		same_occ_group: d.same_occ_group, 
		occ_num_h: +d.occ_num_h, 
		occ_num_w: +d.occ_num_w,
	};

}, function(error, data) {

	dataset = data;

});

// make fake to datasets visualize the underlying grid
var cols = [],
	rows = [];

for(var i = 1; i <= 131; i++) {
	cols.push(i);
	rows.push(i);
}

function make_surprise_occ_graph(data) {
	surprise_occ_plot.call(tip2);

	// add labels
	surprise_occ_plot.append("text")
		.attr("x", w2/2)
		.attr("y", -10)
		.attr("text-anchor", "middle")
		.text("Wife's Occupation");

	surprise_occ_plot.append("text")
		.attr("x", -padding2)
		.attr("y", h2/2)
		.text("Husband's");
	surprise_occ_plot.append("text")
		.attr("x", -padding2)
		.attr("y", h2/2 + 15)
		.text("Occupation");
		
	var squares = surprise_occ_plot.selectAll(".couple")
		.data(data)
		.enter()
	  .append("rect")
	  	.attr("class", "couple")
		.attr("width", s)
		.attr("height", s)
	  	.attr("x", function(d) { return d.occ_num_w*s; }) 
	  	.attr("y", function(d) { return d.occ_num_h*s; })
	  	.style("fill", function(d) { if(d.same_occ_group==="1") { return occScale(d.wife_occ_group); }
	  								 else { return "#bdbdbd"; }})
	  	.on("mouseover", tip2.show)
	  	.on("mouseout", tip2.hide);

	// add legend

	// first clear legend if it already exists
	d3.select("#legend").remove(); 

	var legend = d3.select("#splot3").append("img")
		.attr("id", "legend")
		.attr("src", "Color-Legend.png")
		.style("display", "block")
		.style("margin", "auto");
}

function updateGraph(step) {
	if(step === 0) {
		surprise_occ_plot.selectAll(".row")
			.data(rows)
			.enter()
		  .append("rect")
			.attr("class", "row")
			.attr("x", s)
			.attr("y", function(d) { return d * s; })
			.attr("width", w2)
			.attr("height", s)
			.attr("fill", "none")
			.attr("stroke", function(d) { if(d===1) { return "#828282"; } else { return "#fff"; }});
	}
	else if (step === 1) {
		surprise_occ_plot.selectAll(".row")
			.transition()
			.delay(function(d, i) { return i * 5; })
			.attr("stroke", "#cecece");

		surprise_occ_plot.selectAll(".col")
			.data([])
			.exit().remove();
	}
	else if (step === 2) {
		surprise_occ_plot.selectAll(".col")
			.data(cols)
			.enter()
		  .append("rect")
			.attr("class", "col")
			.attr("x", function(d) { return d * s; })
			.attr("y", s)
			.attr("width", s)
			.attr("height", h2)
			.attr("fill", "none")
			.attr("stroke", function(d) { if(d===1) { return "#828282"; } else { return "none"; }});
	}
	else if (step === 3) {
		surprise_occ_plot.selectAll(".col")
			.transition()
			.delay(function(d, i) { return i * 5; })
			.attr("stroke", "#cecece");

		surprise_occ_plot.selectAll(".couple")
			.data([])
			.exit().remove();
			
		surprise_occ_plot.select("#example").remove();
	}
	else if (step === 4) {
		//make grid lines lighter
		surprise_occ_plot.selectAll(".row")
			.attr("stroke", "#f0f0f0");

		surprise_occ_plot.selectAll(".col")
			.attr("stroke", "#f0f0f0");

		surprise_occ_plot.append("rect")
			.attr("id", "example")
			.attr("x", s)
			.attr("y", s)
			.attr("width", s)
			.attr("height", s)
			.attr("fill", "#af601a");
	}
	else {
		surprise_occ_plot.select("#example").remove();

		make_surprise_occ_graph(dataset); 
	}
}
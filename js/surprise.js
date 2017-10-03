// chart
var w = 800,
	h = 600,
	padding_h = 50,
	padding_l = 250;	

// set up scales
var xScale = d3.scale.linear()
	.domain([0, 100])
	.rangeRound([0, w]);

var yScale = d3.scale.linear()
	.rangeRound([h, 0]);

var rScale = d3.scale.sqrt()
	.domain([0, 1])
	.range([0, 100]);

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

var surprisePlot = d3.select("#splot")
  .append("svg")
	.attr("width", w + padding_l * 2)
	.attr("height", h + padding_h * 2)
  .append("g")
  	.attr("transform", "translate(" + padding_l + ", " + padding_h + ")");

d3.csv('Data/data_husbands.csv', function(d) {
	
	return {
		occp_h: d.OCCP_H,
		occp_w: d.OCCP_W,
		husband_occ: d.Husband_Occ,
		wife_occ: d.Wife_Occ,
		wife_occ_group: d.SOC_Major_Group,
		wife_edu: +d.Wife_edu,
		pct_couples: +d.pct_couples,
		pct_women: +d.PctWomen2,
		surprise: +d.surprise
	};

}, function(error, data) {
	//console.log(data);

	yScale.domain([d3.min(data, function(d) { return d.surprise; }), d3.max(data, function(d) { return d.surprise; }) ]);

	var nested_data = d3.nest()
		.key(function(d) { return d.husband_occ; })
		.entries(data);

	//console.log(d3.values(nested_data).map(function(d) { return d.key; }));

	//populate dropdown with occupation names
	var occupations = d3.values(nested_data).map(function(d) { return d.key; });
	//console.log(occupations);
	var select = d3.select("#occselect")
		.on("change", onchange);

	var options = select
		.selectAll("option")
		.data(occupations)
		.enter()
		.append("option")
		.text(function(d) { return d; })
		.attr("value", function(d) { return d; });

	make_surprise_plot(nested_data, "Chief executives and legislators");
});

function onchange(data) {
	selectOcc = d3.select('#occselect').property('value');
	make_surprise_plot(data, selectOcc);
}

function make_surprise_plot(data, occupation) {
	var selected = data.filter(function(d) { return d.key===occupation; });
	
	var circles = surprisePlot.selectAll(".occ")
		.data(selected[0].values)
		.enter()
	  .append("circle")
	  	.attr("r", function(d) { return rScale(d.pct_women); })
	  	.attr("cx", function(d) { return xScale(d.wife_edu); }) 
	  	.attr("cy", function(d) { return yScale(d.surprise); })
	  	.attr("fill", function(d) { return occScale(d.wife_occ_group); });
}
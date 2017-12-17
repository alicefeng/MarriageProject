var formatPercent = d3.format(".1%");

var dataset2;

// chart
var w_s = 500,
	h_s = 250,
	padding_s = 10;	

var appendixPlot = d3.select("#appendix_plot")
  .append("svg")
	.attr("width", w_s + padding_s * 2)
	.attr("height", h_s + padding_s * 2)
  .append("g")
  	.attr("transform", "translate(" + padding_s + ", " + padding_s + ")");

d3.csv('Data/appendix_data.csv', function(d) {
	
	return {
		ref_occ: d.Ref_Occ,
		spouse_occ: d.Spouse_Occ,
		pct_couples: +d.pct_couples,
		ref_person: d.ref_person,
	};

}, function(error, data) {

	var nested_data = d3.nest()
		.key(function(d) { return d.ref_occ; }).sortKeys(d3.ascending)
		.entries(data);

	//dataset2 = nested_data;
	dataset2 = data;
	
	// select spouse gender dropdown 
	var sexselect = d3.select("#sexselect")
		.on("change", onchange);

	var sexes = sexselect
		.selectAll("option")
		.data(["Husband", "Wife"])
	  .enter().append("option")
	  	.text(function(d) { return d; })
	  	.attr("value", function(d) { return d; });

	//populate dropdown with occupation names
	var occupations = d3.values(nested_data).map(function(d) { return d.key; });

	var occselect = d3.select("#occselect")
		.on("change", onchange);

	var options = occselect
		.selectAll("option")
		.data(occupations)
	  .enter().append("option")
		.text(function(d) { return d; })
		.attr("value", function(d) { return d; }); 
	
	make_surprise_plot(dataset2, "Husband", "Chief executives and legislators");
});


function onchange() {
	selectSex = d3.select('#sexselect').property('value');
	selectOcc = d3.select('#occselect').property('value');
	make_surprise_plot(dataset2, selectSex, selectOcc);
}

function make_surprise_plot(data, sex, occupation) {

	var selected = data.filter(function(d) { return d.ref_person==sex & d.ref_occ===occupation; });
	
	if(selected.length===0) {
		var spouseoccs = appendixPlot.selectAll(".occtext")
			.data([1])
			.attr("class", "occtext")
			.attr("x", 0)
		  	.attr("y", 0) 
		  	.attr("dy", 3)
		  	.text("Not enough data");

		spouseoccs.exit().remove();
	}
	else {
		var spouseoccs = appendixPlot.selectAll(".occtext")
			.data(selected)
			.attr("class", "occtext")
			.attr("x", 0)
		  	.attr("y", function(d, i) { return i * 24; }) 
		  	.attr("dy", 3)
		  	.text(function(d, i) { return (i+1) + ". " + d.spouse_occ + " (" + formatPercent(d.pct_couples) + ")"; });

		spouseoccs.enter()
		  .append("text")
		  	.attr("class", "occtext")
		  	.attr("x", 0)
		  	.attr("y", function(d, i) { return i * 24; }) 
		  	.attr("dy", 3)
		  	.text(function(d, i) { return (i+1) + ". " + d.spouse_occ + " (" + formatPercent(d.pct_couples) + ")"; });

		spouseoccs.exit().remove();
	}
}

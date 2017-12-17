var formatPercent = d3.format(".1%");

function make_diff_plot_w() {
	var w = 870,
		h = 500, 
		padding = 50,
		padding_top = 80;

	// set up scales
	var xScale = d3.scale.ordinal()
		.domain(['Elementary and middle school teachers',
			'Accountants and auditors',
			'Registered nurses',
			'Secretaries and administrative assistants',
			'Office and administrative support supervisors',
			'Postsecondary teachers',
			'Nursing, psychiatric, and home health aides',
			'Customer service representatives',
			'Cashiers',
			'General office clerks',
			'Retail salespersons'])
		.rangeRoundPoints([0, w]);

	var yScale = d3.scale.log()
		.rangeRound([h, 0]);

	// set up axis
	var xAxis = d3.svg.axis()
		.scale(xScale)
		.orient("top");

	var diff_plot_w = d3.select('#diff_plot_w')
	  .append('svg')
		.attr('width', w + padding*2)
		.attr('height', h + padding*2)
	  .append('g')
	  	.attr("transform", "translate(" + padding + ", " + padding_top + ")");

	// set up tooltip
	tip_w = d3.tip()
		.attr('class', 'd3-tip')
		.direction('e')
		.html(function(d) { return formatPercent(d.pct_couples) + " of male " + d.husband_occ.toLowerCase() + " marry female " + d.wife_occ.toLowerCase(); });

	d3.csv('Data/diff_final_w.csv', function(d) {

		return {
			occp_w: d.OCCP_W,
			pct_couples: +d.pct_couples,
			wife_occ_rank: +d.Wife_Occ_Rank,
			wife_occ: d.Wife_Occ,
			occp_h: d.OCCP_H,
			husband_occ: d.Husband_Occ,
		};

	}, function(error, data) {

		yScale.domain([d3.min(data, function(d) { return d.pct_couples; }), d3.max(data, function(d) { return d.pct_couples; })]);

		// add tooltip
		diff_plot_w.call(tip_w);

		// draw axes
		var axes = diff_plot_w.selectAll(".axis_line")
			.data(xScale.domain())
		  .enter().append("line")
		  	.attr("class", "axis_line")
		  	.attr("x1", function(d) { return xScale(d); })
		  	.attr("x2", function(d) { return xScale(d); })
		  	.attr("y1", 0)
		  	.attr("y2", h)
		  	.style("stroke", "#bebebe");

		// label each line 
		diff_plot_w.append("g")
			.attr("class", "x axis")
			.attr("transform", "translate(0, -70)")
			.call(xAxis)
		  .selectAll(".tick text")
		  	.call(wrap, xScale.rangeBand());

		// draw points
		var marriages = diff_plot_w.selectAll(".couple")
			.data(data.filter(function(d) { return d.husband_occ!=='Base_Rate'; }))
		  .enter().append("circle")
		  	.attr("class", "couple")
		  	.attr("cx", function(d) { return xScale(d.wife_occ); })
		  	.attr("cy", function(d) { return yScale(d.pct_couples); })
		  	.attr("r", 7)
		  	.style("fill", "#bdbdbd")
		  	.style("fill-opacity", 0.5)
		  	.on("mouseover", tip_w.show)
		  	.on("mouseout", tip_w.hide);


		// mark base rate for each occupation
		var base_rate = diff_plot_w.selectAll(".base_rate")
			.data(data.filter(function(d) { return d.husband_occ==='Base_Rate'; }))
		  .enter().append("line")
		  	.attr("class", "base_rate")
		  	.attr("x1", function(d) { return xScale(d.wife_occ) - 10; })
		  	.attr("x2", function(d) { return xScale(d.wife_occ) + 10; })
		  	.attr("y1", function(d) { return yScale(d.pct_couples); })
		  	.attr("y2", function(d) { return yScale(d.pct_couples); })
		  	.style("stroke", "#DF744A")
		  	.style("stroke-width", 2);

		// label each base rate
		var br_label = diff_plot_w.selectAll(".br_label")
			.data(data.filter(function(d) { return d.husband_occ==='Base_Rate'; }))
		  .enter().append("text")
		  	.attr("class", "br_label")
		  	.attr("x", function(d) { return xScale(d.wife_occ) - 40; })
		  	.attr("y", function(d) { return yScale(d.pct_couples); })
		  	.attr("dy", 3)
		  	.text(function(d) { return formatPercent(d.pct_couples); })
		  	.style("fill", "#DF744A");
	})

}

function make_diff_plot_h() {
	var w = 870,
		h = 500, 
		padding = 50,
		padding_top = 80;

	// set up scales
	var xScale = d3.scale.ordinal()
		.domain(['Retail sales supervisors', 
			'Automotive service technicians and mechanics',
			'Software developers',
			'Truck drivers',
			'Cashiers',
			'Laborers and hand movers',
			'Customer service representatives',
			'Stock clerks and order fillers',
			'General and operations managers',
			'General maintenance and repair workers',			
			'Retail salespersons'])
		.rangeRoundPoints([0, w]);

	var yScale = d3.scale.log()
		.rangeRound([h, 0]);

	// set up axis
	var xAxis = d3.svg.axis()
		.scale(xScale)
		.orient("top");

	var diff_plot_h = d3.select('#diff_plot_h')
	  .append('svg')
		.attr('width', w + padding*2)
		.attr('height', h + padding*2)
	  .append('g')
	  	.attr("transform", "translate(" + padding + ", " + padding_top + ")");

	// set up tooltip
	tip_h = d3.tip()
		.attr('class', 'd3-tip')
		.direction('e')
		.html(function(d) { return formatPercent(d.pct_couples) + " of female " + d.wife_occ.toLowerCase() + " marry male " + d.husband_occ.toLowerCase(); });

	d3.csv('Data/diff_final_h.csv', function(d) {

		return {
			occp_h: d.OCCP_H,
			pct_couples: +d.pct_couples,
			husband_occ_rank: +d.Husband_Occ_Rank,
			husband_occ: d.Husband_Occ,
			occp_w: d.OCCP_W,
			wife_occ: d.Wife_Occ,
		};

	}, function(error, data) {

		yScale.domain([d3.min(data, function(d) { return d.pct_couples; }), d3.max(data, function(d) { return d.pct_couples; })]);

		// add tooltip
		diff_plot_h.call(tip_h);

		// draw axes
		var axes = diff_plot_h.selectAll(".axis_line")
			.data(xScale.domain())
		  .enter().append("line")
		  	.attr("class", "axis_line")
		  	.attr("x1", function(d) { return xScale(d); })
		  	.attr("x2", function(d) { return xScale(d); })
		  	.attr("y1", 0)
		  	.attr("y2", h)
		  	.style("stroke", "#bebebe");

		// label each line 
		diff_plot_h.append("g")
			.attr("class", "x axis")
			.attr("transform", "translate(0, -70)")
			.call(xAxis)
		  .selectAll(".tick text")
		  	.call(wrap, xScale.rangeBand());

		// draw points
		var marriages = diff_plot_h.selectAll(".couple")
			.data(data.filter(function(d) { return d.wife_occ!=='Base_Rate'; }))
		  .enter().append("circle")
		  	.attr("class", "couple")
		  	.attr("cx", function(d) { return xScale(d.husband_occ); })
		  	.attr("cy", function(d) { return yScale(d.pct_couples); })
		  	.attr("r", 7)
		  	.style("fill", "#bdbdbd")
		  	.style("fill-opacity", 0.5)
		  	.on("mouseover", tip_h.show)
		  	.on("mouseout", tip_h.hide);


		// mark base rate for each occupation
		var base_rate = diff_plot_h.selectAll(".base_rate")
			.data(data.filter(function(d) { return d.wife_occ==='Base_Rate'; }))
		  .enter().append("line")
		  	.attr("class", "base_rate")
		  	.attr("x1", function(d) { return xScale(d.husband_occ) - 10; })
		  	.attr("x2", function(d) { return xScale(d.husband_occ) + 10; })
		  	.attr("y1", function(d) { return yScale(d.pct_couples); })
		  	.attr("y2", function(d) { return yScale(d.pct_couples); })
		  	.style("stroke", "#609e8f")
		  	.style("stroke-width", 2);

		// label each base rate
		var br_label = diff_plot_h.selectAll(".br_label")
			.data(data.filter(function(d) { return d.wife_occ==='Base_Rate'; }))
		  .enter().append("text")
		  	.attr("class", "br_label")
		  	.attr("x", function(d) { return xScale(d.husband_occ) - 40; })
		  	.attr("y", function(d) { return yScale(d.pct_couples); })
		  	.attr("dy", 3)
		  	.text(function(d) { return formatPercent(d.pct_couples); })
		  	.style("fill", "#609e8f");
	})

}

function wrap(text, width) {
  text.each(function() {
    var text = d3.select(this),
        words = text.text().split(/\s+/).reverse(),
        word,
        line = [],
        lineNumber = 0,
        lineHeight = 1.1, // ems
        y = text.attr("y"),
        dy = parseFloat(text.attr("dy")),
        tspan = text.text(null).append("tspan").attr("x", 0).attr("y", y).attr("dy", dy + "em");
    while (word = words.pop()) {
      line.push(word);
      tspan.text(line.join(" "));
      if (tspan.node().getComputedTextLength() > width) {
        line.pop();
        tspan.text(line.join(" "));
        line = [word];
        tspan = text.append("tspan").attr("x", 0).attr("y", y).attr("dy", ++lineNumber * lineHeight + dy + "em").text(word);
      }
    }
  });
}

make_diff_plot_w();

make_diff_plot_h();


(function( map ) {
	/* Data and data processing */
	var world = {},
	data = {},
	queue = d3_queue.queue,
	countryByIso = d3.map();

	/* Map size */
	var width = 600,
		height = 500;

	/* Map settings */
	var svg = d3.select("#map").append("svg")
		.attr("width", width)
		.attr("height", height),
	projection = d3.geo.mercator()
	    .scale(390)
	    .translate([width * .5, height * 1.45]),
	path = d3.geo.path()
		.projection(projection);

	/* Map color scale */
	var minGap = 3, 
	maxGap = 30,
	minGapColor = "#bcbddc", 
	maxGapColor = "#990000",
	gapColor = d3.scale.linear().domain([minGap, maxGap]).range([minGapColor, maxGapColor]);

	/* Info pane scale */
	var xMax = 320,
	xScale = d3.scale.linear()
	          .domain([0, 100])
	          .range([0, xMax]);

	/* 
	Private draw function
	Draw the map with gradient shading
	Bind click events to show detailed data
	*/

	var go = function(error, world, data) {
		/*console.log(error);
		console.log(world);
		console.log(data);*/
		
		// Access the country geometries
		var countries = topojson.feature(world, world.objects.ne_110m_admin_0_countries);
		svg.selectAll("path")
	      	.data(countries.features)
	      .enter().append("path") // add a path for each country
	      	.attr("fill", function(d) { 
	      		var country = countryByIso.get(d.id);
	      		if (typeof country !== 'undefined' && country.gap) { // check that country is defined and the data is available
					return gapColor(country.gap); // map the data to the colour scale
	      		}
	      		return "#eee";
	      		
	      	})
	      	.attr("class",function(d) { return d.id + " country"}) // not used in this tutorial but can be useful for filters and styles
	      	.attr("stroke",'#000')
	      	.attr("d", path);

	    // bind click events
	    d3.selectAll("path.country")
	    	.on("click",function(d) {
	    		
	    		var country = countryByIso.get(d.id); // use map function to retrieve country data by ISO
	    		var html;
	      		if (typeof country !== 'undefined') { // check we don't have missing data
					html = '<h2>' + country.country + '</h2>';
					html += '<h3>Workplace participation rates</h3>';
					
					d3.select('#info')
		      			.html('')
		    			.append("div")
		    			.html(html);

		    		// store enter selection so we can add multiple elements for each data point (rect and text)
		    		var selection = d3.select('#info')
		    			.append("svg")
							.attr("width", xMax)
							.attr("height", 80)
						.append('g')
						.selectAll("rect")
							.data([country.fpr,country.mpr]) // set data to be male and female participation rates
						.enter();
					// add grey background rectangles
					selection.append("rect")
						    .attr("y", function(d, i) { return i * 38; })
						    .attr("x", 0)
						    .attr("height", 20)
						    .style('fill', "#ddd")
						    .attr("width", xMax);
					// add colour rectangles for data
					selection.insert("rect")
						    .attr("y", function(d, i) { return i * 38; })
						    .attr("x", 0)
						    .attr("height", 20)
						    .style('fill', function(d, i) { 
						    	if (i < 1) return "rgb(223, 101, 176)"; 
						    	return "rgb(33, 113, 181)";
						    })
						    .attr("width", xScale);
					// add text overlay with figures
					selection.insert("text")
						    .attr("y", function(d, i) { return i * 38 + 15; })
						    .attr("x", 5)
						    .attr("height", 20)
						    .attr("width", xMax)
						    .attr("fill","white")
						    .style("color","white")
						    .text(function(d, i) { 
						    	return parseFloat(d).toFixed(2) + '%';
						    });
					
					// not all countries have this data
					if (country.gap) {
						html = '<h3>Wage gap</h3>';
						d3.select('#info')
		    				.append("div")
		    				.html(html);
		    			// store enter selection so we can add multiple elements for each data point 	
		    			var selection = d3.select('#info')
		    			.append("svg")
							.attr("width", xMax)
							.attr("height", 80)
						.append('g')
						.selectAll("rect")
							.data([100 - country.gap,100])
						.enter();
						// add grey background rectangles
						selection.append("rect")
						    .attr("y", function(d, i) { return i * 38; })
						    .attr("x", 0)
						    .attr("height", 20)
						    .style('fill', "#ddd")
						    .attr("width", xMax);
						// add colour rectangles for data
						selection.insert("rect")
						    .attr("y", function(d, i) { return i * 38; })
						    .attr("x", 0)
						    .attr("height", 20)
						    .style('fill', function(d, i) { 
						    	if (i < 1) return "rgb(223, 101, 176)"; 
						    	return "rgb(33, 113, 181)";
						    })
						    .attr("width", xScale);
						// add text overlay with figures
						selection.insert("text")
						    .attr("y", function(d, i) { return i * 38 + 15; })
						    .attr("x", 5)
						    .attr("height", 20)
						    .attr("width", xMax)
						    .attr("fill","white")
						    .style("color","white")
						    .text(function(d, i) { 
						    	return parseFloat(d).toFixed(2) + '%';
						    });
					}
				}

	    	});

	};

	/* 
	Publicly accessible init function 
	Load the data and geodata and pass to the go function
	*/
	map.init = function() {
		queue()
			.defer(d3.json, "data/world.topojson")
			/* Use a row walker function to set up a map of the data so it can be accessed by country iso code */
			.defer(d3.csv, "data/gender_gap.csv",  function(d) { countryByIso.set(d.iso3, d); return d; })
			.await(go);
	};	

}( window.map = window.map || {} ));


// Let's Go!
map.init();
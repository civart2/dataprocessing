/* 
 * name: Civio Arts
 * studentnumber: 11043946
 * assignment 4: scatterplot
 */

window.onload = function() {    
    // link to data (from OECD)
    var womenInScience = "http://stats.oecd.org/SDMX-JSON/data/MSTI_PUB/TH_WRXRS.FRA+DEU+KOR+NLD+PRT+GBR/all?startTime=2007&endTime=2015"
    var consConf = "http://stats.oecd.org/SDMX-JSON/data/HH_DASH/FRA+DEU+KOR+NLD+PRT+GBR.COCONF.A/all?startTime=2007&endTime=2015"
    
    // retrieve data
    d3.queue()
      .defer(d3.request, womenInScience)
      .defer(d3.request, consConf)
      .awaitAll(createScatter);

    // create scatterplot
    function createScatter(error, response){
        if(error) throw error;
        
        // get womens data
        var data = JSON.parse(response[0].responseText);
        var womenData = [];
        
        // fill in data for women
        for(let i = 0; i < 1; i++){
            for(let j = 0; j < 6; j++){
                var range = i + ":" + j;
                womenData.push(+(data.dataSets[0].series[range]
                        .observations[0][0]));
            }
        }
        
        // get consConf data
        var data = JSON.parse(response[1].responseText);
        var consConfData = [];
        
        // fill in data for cons
        for(let i = 0; i < 1; i++){
            for(let j = 0; j < 6; j++){
                var range = j + ":" + i + ":" + 0   ;
                var range2 = '"' + j + '"';
                consConfData.push(+(data.dataSets[0].series[range]
                        .observations[0][0]));
            }
        }
        console.log(womenData);
        console.log(consConfData);
 
        // set margin, width and height
        var margin = {top: 20, right: 20, bottom: 30, left: 40},
        width = 960 - margin.left - margin.right,
        height = 500 - margin.top - margin.bottom;

        // scale X
        var xScale = d3.scaleLinear()
                       .range([0, width]);

        // scale Y
        var yScale = d3.scaleLinear()
                       .range([height, 0]);

        // set color
        var color = d3.scaleLinear(d3.schemeCategory20);
        
        // define X-Axis
        var xAxis = d3.axisBottom()
                      .scale(xScale);

        // define Y-Axis
        var yAxis = d3.axisLeft()
                      .scale(yScale)

        // create svg-element
        var svg = d3.select("body")
                    .append("svg")
                    .attr("width", width + margin.left + margin.right)
                    .attr("height", height + margin.top + margin.bottom)
                    .append("g")
                    .attr("transform", "translate(" + margin.left + 
                        "," + margin.top + ")");

        // define domains
        xScale.domain(d3.extent(womenData, function(d) { return Math.max(d); })).nice();
        yScale.domain(d3.extent(consConfData, function(d) { return Math.max(d); })).nice();

        // append elements to svg x-axis
        svg.append("g")
          .attr("class", "xaxis")
          .attr("transform", "translate(0," + height + ")")
          .call(xAxis)
          .append("text")
          .attr("class", "label")
          .attr("x", width)
          .attr("y", -20)
          .style("text-anchor", "middle")
          .text("Women researchers");

        // append elements to svg y-axis
        svg.append("g")
          .attr("class", "yaxis")
          .call(yAxis)
          .enter()
          .append("text")
          .attr("class", "label")
          .attr("x", 160)
          .attr("y", 20)
          .style("text-anchor", "end")
          .text("Households Economic well-being");

        // set womenData point
        svg.selectAll(".dot")
           .data(womenData)
           .enter()
           .append("circle")
           .attr("class", "dot")
           .attr("r", 3.5)
           .attr("cx", function(d) { return xScale(d); })
   
        // set consConf point
        svg.selectAll(".dot")
           .data(consConf)
           .append("circle")
           .attr("class", "dot")
           .attr("cy", function(d) { return yScale(d); });

     // define legend
     var legend = svg.selectAll(".legend")
      .data(color.domain())
      .enter()
      .append("g")
      .attr("class", "legend")
      .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

    // make rects by legend
    legend.append("rect")
      .attr("x", width - 18)
      .attr("width", 18)
      .attr("height", 18)
      .style("fill", color);

    // append text to legend
    legend.append("text")
      .attr("x", width - 24)
      .attr("y", 9)
      .attr("dy", ".35em")
      .style("text-anchor", "end")
      .text(function(d) { return d; });
}}
